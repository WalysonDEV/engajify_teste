import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import Avatar from './Avatar';
import Loader from './Loader';
import { useAuth } from '../contexts/AuthContext';

interface AccountProps {
  session: Session;
}

const Account: React.FC<AccountProps> = ({ session }) => {
  const { profile, loading: authLoading, refetchProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile && !authLoading) {
      setFullName(profile.full_name);
      setUsername(profile.username);
      setAvatarUrl(profile.avatar_url);
      setLoading(false);
    } else if (!authLoading && session) {
        setLoading(false);
    }
  }, [session, profile, authLoading]);

  const updateProfile = async (event: React.FormEvent, newAvatarUrl?: string) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { user } = session;
      const updates = {
        id: user.id,
        full_name: fullName,
        username,
        avatar_url: newAvatarUrl !== undefined ? newAvatarUrl : avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;
      }
      setMessage('Perfil atualizado com sucesso!');
      await refetchProfile();
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error updating the profile:', error.message);
        setMessage(`Erro ao atualizar perfil: ${error.message}`);
      } else {
        console.error('Unknown error updating the profile:', error);
        setMessage('Erro desconhecido ao atualizar perfil.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = useCallback(async (path: string) => {
    setAvatarUrl(path);
    await updateProfile(new Event('submit') as unknown as React.FormEvent, path);
  }, [fullName, username, session, refetchProfile]);
  
  const initialLoad = authLoading && !profile;

  return (
    <div className="space-y-6">
      <form onSubmit={updateProfile} className="space-y-6">
        {initialLoad ? (
          <div className="flex justify-center items-center h-48">
            <Loader />
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4">
              <Avatar
                uid={session.user.id}
                url={avatarUrl}
                size={100}
                onUpload={handleAvatarUpload}
              />
              <p className="text-sm text-[var(--text-secondary)]">Clique ou arraste para alterar</p>
            </div>

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Nome Completo
              </label>
              <input
                id="full_name"
                type="text"
                value={fullName || ''}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full form-input"
                placeholder="Seu nome completo"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Nome de Usuário (Opcional)
              </label>
              <input
                id="username"
                type="text"
                value={username || ''}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full form-input"
                placeholder="Ex: engajify_user"
                disabled={loading}
              />
            </div>

            {message && (
              <p className={`text-center text-sm ${message.startsWith('Erro') ? 'text-red-400' : 'text-green-400'}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-[var(--accent-primary)] text-[var(--accent-primary-text)] font-bold py-2.5 px-4 rounded-lg flex items-center justify-center transition-all duration-300 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? <Loader /> : 'Atualizar Perfil'}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default Account;