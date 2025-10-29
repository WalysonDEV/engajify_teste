import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { XIcon } from './Icons';
import { useNotification } from '../contexts/NotificationContext';

const FavoritesList: React.FC = () => {
  const { profile, refetchProfile } = useAuth();
  const [removingFavorite, setRemovingFavorite] = useState<string | null>(null); // State to track item being removed for animation
  const { showNotification } = useNotification();

  const handleRemoveFavorite = async (idea: string) => {
    if (!profile || !profile.favorite_ideas) return;

    setRemovingFavorite(idea); // Trigger animation by setting this state
    const updatedFavorites = profile.favorite_ideas.filter(fav => fav !== idea);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ favorite_ideas: updatedFavorites })
        .eq('id', profile.id);

      if (error) throw error;
      
      showNotification('Ideia removida dos seus favoritos!', 'remove');
      
      // Wait for animation to finish before refetching, which will remove the item from DOM
      setTimeout(async () => {
          await refetchProfile();
          setRemovingFavorite(null); // Clear removal state
      }, 300); // Animation duration (should match CSS animation duration)

    } catch (error) {
      if (error instanceof Error) {
        console.error(`Erro ao remover favorito: ${error.message}`);
        setRemovingFavorite(null); // Clear removal state on error
      }
    }
  };

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {profile?.favorite_ideas && profile.favorite_ideas.length > 0 ? (
        profile.favorite_ideas.map((idea, index) => {
            const isRemoving = removingFavorite === idea; // Check if this specific item is being removed
            return (
                <div 
                    key={index} 
                    className={`flex items-center justify-between p-2.5 rounded-lg inset-surface text-sm ${isRemoving ? 'item-removing' : ''}`}
                >
                    <span className="flex-1 text-[var(--text-secondary)] mr-2">{idea}</span>
                    <button
                        onClick={() => handleRemoveFavorite(idea)}
                        disabled={isRemoving} // Disable button if currently removing
                        className="flex-shrink-0 p-1.5 rounded-full text-gray-500 hover:bg-[var(--button-secondary-bg)] hover:text-white disabled:opacity-50 disabled:cursor-wait transition-colors"
                        aria-label="Remover dos favoritos"
                    >
                        {/* Loader is no longer needed here, the item-removing class provides visual feedback */}
                        <XIcon className="w-4 h-4" /> 
                    </button>
                </div>
            );
        })
        ) : (
        <p className="text-center text-sm text-gray-500 py-4">
            Você ainda não favoritou nenhuma ideia.
        </p>
        )}
    </div>
  );
};

export default FavoritesList;