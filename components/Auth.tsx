import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import Modal from './Modal';
import Loader from './Loader';
import { UserIcon, StarFillIcon, LogInIcon } from './Icons';
import Account from './Account';
import FavoritesList from './FavoritesList';
import Avatar from './Avatar';

const Auth: React.FC = () => {
  const { session, profile } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [avatarSize, setAvatarSize] = useState(32);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const updateSize = () => {
      // 768px is the default for Tailwind's `md` breakpoint
      setAvatarSize(window.innerWidth >= 768 ? 40 : 32);
    };

    window.addEventListener('resize', updateSize);
    updateSize(); // Call on initial render

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(`Erro: ${error.message}`);
      } else {
        setMessage('Verifique seu e-mail para confirmar a conta!');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(`Erro: ${error.message}`);
      } else {
        setIsLoginModalOpen(false);
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await supabase.auth.signOut();
  };
  
  const openLoginModal = () => {
      setEmail('');
      setPassword('');
      setMessage('');
      setIsSignUp(false);
      setIsLoginModalOpen(true);
  }

  if (session) {
    return (
      <div className="relative z-50" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="block w-8 h-8 md:w-10 md:h-10 rounded-full focus:outline-none"
          aria-label="Menu do usuário"
        >
          <Avatar
            uid={session.user.id}
            url={profile?.avatar_url || null}
            size={avatarSize}
          />
        </button>

        {isDropdownOpen && (
           <div
              className="absolute top-full right-0 mt-2 w-56 md:w-64 modal-surface rounded-lg origin-top-right"
              style={{ animation: 'scaleIn 0.15s ease-out forwards' }}
            >
              <div className="p-3 md:p-4 border-b border-[var(--border-color)]">
                <p className="text-sm md:text-base font-medium text-[var(--text-primary)] truncate" title={profile?.full_name ?? session.user.email ?? ''}>
                  {profile?.full_name || session.user.email}
                </p>
                <p className="text-xs md:text-sm text-gray-400">Logado</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => { setIsDropdownOpen(false); setIsAccountModalOpen(true); }}
                  className="w-full text-left flex items-center gap-2 md:gap-3 text-sm md:text-base text-[var(--text-secondary)] hover:bg-[var(--button-secondary-bg)] px-3 md:px-4 py-1.5 md:py-2 rounded-md transition-colors"
                >
                  <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  Minha Conta
                </button>
                <button
                  onClick={() => { setIsDropdownOpen(false); setIsFavoritesModalOpen(true); }}
                  className="w-full text-left flex items-center gap-2 md:gap-3 text-sm md:text-base text-[var(--text-secondary)] hover:bg-[var(--button-secondary-bg)] px-3 md:px-4 py-1.5 md:py-2 rounded-md transition-colors mt-1"
                >
                  <StarFillIcon className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                  Meus Favoritos
                </button>
                <div className="my-1 border-t border-[var(--border-color)]"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-sm md:text-base text-red-400 hover:bg-[var(--button-secondary-bg)] px-3 md:px-4 py-1.5 md:py-2 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
        )}

        <Modal 
          isOpen={isAccountModalOpen} 
          onClose={() => setIsAccountModalOpen(false)} 
          title="Minha Conta"
        >
          {session && <Account session={session} />}
        </Modal>

        <Modal
          isOpen={isFavoritesModalOpen}
          onClose={() => setIsFavoritesModalOpen(false)}
          title="Meus Favoritos"
          containerClassName="max-w-md"
        >
          <FavoritesList />
        </Modal>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={openLoginModal}
        className="group flex items-center justify-center gap-2.5 bg-[var(--accent-primary)] text-sm text-white font-semibold px-5 py-2.5 rounded-lg transition-all transform hover:scale-[1.03] hover:brightness-110 shadow-[0_5px_15px_rgba(var(--accent-primary-rgb),0.3)] hover:shadow-[0_8px_25px_rgba(var(--accent-primary-rgb),0.4)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-main)] focus:ring-[var(--accent-primary)]"
      >
        <LogInIcon className="w-5 h-5 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
        <span>Entrar</span>
      </button>

      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title={isSignUp ? "Criar Nova Conta" : "Acessar Engajify"}
      >
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full form-input"
            />
            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full form-input"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--accent-primary)] text-[var(--accent-primary-text)] font-bold py-2.5 px-4 rounded-lg flex items-center justify-center transition-all duration-300 hover:brightness-110 disabled:opacity-50"
            >
              {loading ? <Loader /> : (isSignUp ? 'Cadastrar' : 'Entrar')}
            </button>
          </form>
          {message && <p className={`mt-4 text-center text-sm ${message.startsWith('Erro') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}
          <div className="mt-4 text-center">
              <button 
                  onClick={() => {
                      setIsSignUp(!isSignUp);
                      setMessage('');
                  }}
                  className="text-sm text-gray-400 hover:text-[var(--accent-primary)] transition-colors"
              >
                  {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Cadastre-se'}
              </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Auth;