// Gerenciador de chaves API com rotação, cooldown e controle de concorrência

class KeyManager {
  constructor() {
    this.keys = [];
    this.keyStates = new Map(); // { key: { status, inUse, cooldownUntil } }
    this.requestQueue = [];
    this.processingQueue = false;
    this.lastUsedKeyIndex = -1; // Para rotação round-robin
    
    this.initializeKeys();
    
    // Intervalo para liberar chaves do cooldown
    setInterval(() => this.checkCooldowns(), 1000);
  }

  initializeKeys() {
    // Suporta GEMINI_API_KEYS (separadas por vírgula) ou GEMINI_API_KEY
    const keysEnv = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
    
    if (!keysEnv) {
      console.warn('Nenhuma chave API configurada. Use GEMINI_API_KEYS ou GEMINI_API_KEY');
      return;
    }

    // Se for uma string única (GEMINI_API_KEY), usa ela
    // Se for múltiplas (GEMINI_API_KEYS), separa por vírgula
    const keyList = keysEnv.split(',').map(k => k.trim()).filter(k => k.length > 0);
    
    this.keys = keyList;
    
    // Inicializa o estado de cada chave
    this.keys.forEach(key => {
      this.keyStates.set(key, {
        status: 'available', // available, inUse, cooldown
        inUse: false,
        cooldownUntil: null,
        retryCount: 0
      });
    });
    
    console.log(`KeyManager inicializado com ${this.keys.length} chave(s) API`);
  }

  checkCooldowns() {
    const now = Date.now();
    this.keyStates.forEach((state, key) => {
      if (state.status === 'cooldown' && state.cooldownUntil && now >= state.cooldownUntil) {
        state.status = 'available';
        state.cooldownUntil = null;
        state.retryCount = 0;
        console.log(`Chave liberada do cooldown: ${key.substring(0, 20)}...`);
        this.processQueue();
      }
    });
  }

  getAvailableKey() {
    // Busca uma chave disponível com rotação round-robin (não em uso e não em cooldown)
    const availableKeys = [];
    for (let i = 0; i < this.keys.length; i++) {
      const key = this.keys[i];
      const state = this.keyStates.get(key);
      if (state.status === 'available' && !state.inUse) {
        availableKeys.push({ key, index: i });
      }
    }
    
    if (availableKeys.length === 0) {
      return null;
    }
    
    // Rotação round-robin: começa após a última chave usada
    const startIndex = (this.lastUsedKeyIndex + 1) % this.keys.length;
    
    // Procura a partir da última chave usada
    for (let i = 0; i < availableKeys.length; i++) {
      const checkIndex = (startIndex + i) % this.keys.length;
      const found = availableKeys.find(ak => ak.index === checkIndex);
      if (found) {
        this.lastUsedKeyIndex = found.index;
        return found.key;
      }
    }
    
    // Se não encontrou na ordem round-robin, usa a primeira disponível
    this.lastUsedKeyIndex = availableKeys[0].index;
    return availableKeys[0].key;
  }

  async acquireKey() {
    const availableKey = this.getAvailableKey();
    
    if (availableKey) {
      const state = this.keyStates.get(availableKey);
      state.inUse = true;
      state.status = 'available'; // garante que está available
      
      return {
        key: availableKey,
        release: () => this.releaseKey(availableKey),
        markError: (error) => this.markKeyError(availableKey, error)
      };
    }

    // Não há chave disponível - retorna erro imediatamente com posição na fila
    // Conta requisições em uso + requisições na fila
    const inUseCount = Array.from(this.keyStates.values()).filter(s => s.inUse).length;
    const queuePosition = inUseCount + this.requestQueue.length + 1;
    
    throw {
      isQueueError: true,
      queuePosition,
      message: `Você está na fila. Posição: ${queuePosition}`
    };
  }

  processQueue() {
    if (this.processingQueue) return;
    this.processingQueue = true;

    while (this.requestQueue.length > 0) {
      const availableKey = this.getAvailableKey();
      
      if (!availableKey) {
        break; // Não há chave disponível, espera
      }

      const queueItem = this.requestQueue.shift();
      const state = this.keyStates.get(availableKey);
      
      state.inUse = true;
      state.status = 'available';
      
      queueItem.resolve({
        key: availableKey,
        release: () => this.releaseKey(availableKey),
        markError: (error) => this.markKeyError(availableKey, error)
      });
    }

    this.processingQueue = false;
  }

  releaseKey(key) {
    const state = this.keyStates.get(key);
    if (state) {
      state.inUse = false;
    }
    
    // Após liberar, tenta processar a fila
    setImmediate(() => this.processQueue());
  }

  markKeyError(key, error) {
    const state = this.keyStates.get(key);
    if (!state) return;

    // Verifica se é erro de rate limit (429) ou auth
    const errorMessage = error?.message || String(error);
    const statusCode = error?.status || error?.statusCode;
    
    const isRateLimit = statusCode === 429 || errorMessage.includes('429');
    const isAuthError = statusCode === 401 || statusCode === 403 || 
                       errorMessage.includes('401') || 
                       errorMessage.includes('403') ||
                       errorMessage.includes('API key') ||
                       errorMessage.includes('authentication');

    if (isRateLimit || isAuthError) {
      // Coloca em cooldown
      state.status = 'cooldown';
      state.inUse = false;
      state.retryCount = (state.retryCount || 0) + 1;
      
      // Cooldown progressivo: 60s * retryCount (min 60s, max 300s)
      const cooldownSeconds = Math.min(60 * state.retryCount, 300);
      state.cooldownUntil = Date.now() + (cooldownSeconds * 1000);
      
      console.log(`Chave ${key.substring(0, 20)}... marcada em cooldown por ${cooldownSeconds}s. Motivo: ${isRateLimit ? '429 Rate Limit' : 'Auth Error'}`);
      
      // Libera para processar a fila com outras chaves
      setImmediate(() => this.processQueue());
    } else {
      // Outro erro - apenas libera a chave
      state.inUse = false;
      setImmediate(() => this.processQueue());
    }
  }

  getQueuePosition() {
    return this.requestQueue.length;
  }

  getStatus() {
    const stats = {
      totalKeys: this.keys.length,
      availableKeys: 0,
      inUseKeys: 0,
      cooldownKeys: 0,
      queueLength: this.requestQueue.length
    };

    this.keyStates.forEach(state => {
      if (state.status === 'available' && !state.inUse) {
        stats.availableKeys++;
      } else if (state.inUse) {
        stats.inUseKeys++;
      } else if (state.status === 'cooldown') {
        stats.cooldownKeys++;
      }
    });

    return stats;
  }
}

// Singleton
let keyManagerInstance = null;

export function getKeyManager() {
  if (!keyManagerInstance) {
    keyManagerInstance = new KeyManager();
  }
  return keyManagerInstance;
}

