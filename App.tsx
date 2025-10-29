import React from 'react';
import { useAuth } from './contexts/AuthContext';
import { isSupabaseConfigured } from './services/supabaseClient';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl p-8 rounded-[12px] text-center surface-card">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Configuração do Supabase Necessária</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Para habilitar a autenticação de usuários e perfis, você precisa configurar seu projeto Supabase.
          </p>
          <div className="text-left bg-zinc-900/50 p-4 rounded-lg border border-[var(--border-color)] font-mono text-sm overflow-x-auto">
            <h3 className="font-semibold text-lg text-green-400 mb-3">Passo 1: Credenciais da API</h3>
            <p className="mb-2">1. Abra o arquivo: <code className="text-green-400 font-semibold">services/supabaseClient.ts</code></p>
            <p>2. Substitua os valores de placeholder por suas credenciais reais:</p>
            <div className="mt-3 mb-4 bg-black/30 p-3 rounded">
              <p><span className="text-purple-400">const</span> supabaseUrl = <span className="text-red-400">'https://your-project-id.supabase.co'</span>;</p>
              <p><span className="text-purple-400">const</span> supabaseAnonKey = <span className="text-red-400">'your-public-anon-key'</span>;</p>
            </div>
            <p className="text-xs text-gray-500 mb-6">
              Você pode encontrar essas chaves nas configurações de API do seu projeto no painel do Supabase.
            </p>

            <h3 className="font-semibold text-lg text-green-400 mb-3">Passo 2: Configurar Tabela de Perfis</h3>
            <p className="mb-2">No seu painel Supabase (seção 'Table Editor'), crie uma nova tabela chamada <code className="text-yellow-400 font-semibold">profiles</code> com as seguintes colunas:</p>
            <div className="mt-3 mb-4 bg-black/30 p-3 rounded">
              <p><span className="text-blue-400">id</span> UUID <span className="text-gray-500">(Primary Key, References auth.users.id)</span></p>
              <p><span className="text-blue-400">updated_at</span> TIMESTAMP <span className="text-gray-500">(Default: now(), Updateable)</span></p>
              <p><span className="text-blue-400">full_name</span> TEXT <span className="text-gray-500">(Nullable)</span></p>
              <p><span className="text-blue-400">username</span> TEXT <span className="text-gray-500">(Nullable, Unique)</span></p>
              <p><span className="text-blue-400">avatar_url</span> TEXT <span className="text-gray-500">(Nullable)</span></p>
              <p><span className="text-blue-400">favorite_ideas</span> TEXT[] <span className="text-gray-500">(Nullable)</span></p>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Certifique-se de que a coluna `id` seja uma chave primária e referencie `auth.users.id`.
            </p>

            <h3 className="font-semibold text-lg text-green-400 mb-3">Passo 3: Habilitar RLS (Row Level Security)</h3>
            <p className="mb-2">Na seção 'Authentication' &gt; 'Policies' do seu projeto, crie políticas RLS para a tabela <code className="text-yellow-400 font-semibold">profiles</code>:</p>
            <div className="mt-3 mb-4 bg-black/30 p-3 rounded">
              <p><span className="text-yellow-400">Enable RLS</span> na tabela `profiles`.</p>
              <p><span className="text-yellow-400">Policy for SELECT:</span> `(uid() = id)`</p>
              <p><span className="text-yellow-400">Policy for INSERT:</span> `(uid() = id)`</p>
              <p><span className="text-yellow-400">Policy for UPDATE:</span> `(uid() = id)`</p>
              <p><span className="text-yellow-400">Policy for DELETE:</span> `(uid() = id)`</p>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Estas políticas garantem que os usuários só possam acessar e modificar seus próprios perfis.
            </p>

            <h3 className="font-semibold text-lg text-green-400 mb-3">Passo 4: Configurar Auto-criação de Perfil (Opcional, mas recomendado)</h3>
            <p className="mb-2">Na seção 'Database' &gt; 'Functions' do seu painel Supabase, crie uma nova função SQL (trigger) para criar automaticamente um perfil quando um novo usuário se cadastra:</p>
            <div className="mt-3 mb-4 bg-black/30 p-3 rounded overflow-x-auto">
              <pre className="text-white"><code>
                <p><span className="text-blue-400">create</span> <span className="text-blue-400">function</span> public.handle_new_user()</p>
                <p>&nbsp;&nbsp;<span className="text-blue-400">returns</span> <span className="text-blue-400">trigger</span> <span className="text-blue-400">as</span> $$</p>
                <p><span className="text-blue-400">begin</span></p>
                <p>&nbsp;&nbsp;<span className="text-blue-400">insert</span> <span className="text-blue-400">into</span> public.profiles (id, full_name, avatar_url)</p>
                <p>&nbsp;&nbsp;<span className="text-blue-400">values</span> (new.id, new.email, null);</p>
                <p>&nbsp;&nbsp;<span className="text-blue-400">return</span> new;</p>
                <p><span className="text-blue-400">end</span>;</p>
                <p>$$ <span className="text-blue-400">language</span> plpgsql <span className="text-blue-400">security</span> <span className="text-blue-400">definir</span>;</p>
                <p></p>
                <p><span className="text-blue-400">create</span> <span className="text-blue-400">trigger</span> on_auth_user_created</p>
                <p>&nbsp;&nbsp;<span className="text-blue-400">after</span> <span className="text-blue-400">insert</span> <span className="text-blue-400">on</span> auth.users</p>
                <p>&nbsp;&nbsp;<span className="text-blue-400">for</span> <span className="text-blue-400">each</span> <span className="text-blue-400">row</span> <span className="text-blue-400">execute</span> <span className="text-blue-400">function</span> public.handle_new_user();</p>
              </code></pre>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Este trigger garante que cada novo usuário terá uma entrada correspondente na tabela `profiles`.
            </p>

            <h3 className="font-semibold text-lg text-green-400 mb-3">Passo 5: Configurar Storage para Avatares</h3>
            <p className="mb-2">Na seção 'Storage' do seu painel Supabase, crie um novo bucket público chamado <code className="text-yellow-400 font-semibold">avatars</code>:</p>
            <div className="mt-3 bg-black/30 p-3 rounded">
              <p><span className="text-yellow-400">Create a new bucket</span> com o nome `avatars`.</p>
              <p><span className="text-yellow-400">Defina-o como 'Public'</span> para que as imagens de perfil possam ser exibidas.</p>
            </div>
            <p className="text-sm text-gray-400 mt-6">
              Isto permitirá que os usuários enviem e exibam suas fotos de perfil.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { session } = useAuth();
  
  return session ? <Dashboard /> : <LandingPage />;
};

export default App;