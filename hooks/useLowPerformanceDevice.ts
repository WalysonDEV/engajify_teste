import { useState, useEffect } from 'react';

interface DeviceInfo {
  isLowPerformance: boolean;
  reason: string[];
}

/**
 * Detecta se o dispositivo tem performance limitada baseado em:
 * - Número de cores de CPU (hardwareConcurrency)
 * - Quantidade de RAM (deviceMemory) 
 * - Tipo de conexão (Connection API)
 * - User agent de dispositivos conhecidamente fracos
 * - Preferência do usuário por reduzir animações
 */
export const useLowPerformanceDevice = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isLowPerformance: false,
    reason: []
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    const reasons: string[] = [];
    let isLowPerformance = false;

    // 1. Verifica hardwareConcurrency (número de cores)
    const cores = (navigator as any).hardwareConcurrency || 4; // Default 4 se não disponível
    if (cores <= 2) {
      reasons.push(`CPU com apenas ${cores} cores`);
      isLowPerformance = true;
    }

    // 2. Verifica deviceMemory (RAM em GB) - disponível em alguns navegadores
    const memory = (navigator as any).deviceMemory;
    if (memory !== undefined) {
      if (memory <= 2) {
        reasons.push(`${memory}GB de RAM`);
        isLowPerformance = true;
      }
    }

    // 3. Verifica conexão lenta
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      const effectiveType = connection.effectiveType; // '2g', '3g', '4g'
      const slowConnections = ['2g', 'slow-2g'];
      if (slowConnections.includes(effectiveType)) {
        reasons.push(`Conexão ${effectiveType}`);
        isLowPerformance = true;
      }
    }

    // 4. Verifica user agent para dispositivos conhecidamente fracos
    const ua = navigator.userAgent.toLowerCase();
    const weakDevices = [
      /android.*go/i,           // Android Go (versões leves)
      /redmi.*c/i,              // Redmi C series (dispositivos básicos)
      /samsung.*galaxy.*j/i,    // Galaxy J series antigos
      /android.*4\.[0-3]/i,     // Android KitKat e anteriores
      /iphone.*os.*1[0-1]_/i    // iOS 10-11 (mais antigos)
    ];
    
    if (weakDevices.some(pattern => pattern.test(ua))) {
      reasons.push('Dispositivo básico detectado');
      isLowPerformance = true;
    }

    // 5. Verifica preferência do usuário por reduzir animações
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      reasons.push('Preferência por reduzir animações');
      isLowPerformance = true;
    }

    setDeviceInfo({
      isLowPerformance,
      reason: reasons
    });
  }, []);

  return deviceInfo;
};
