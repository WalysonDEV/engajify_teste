import React, { useState } from 'react';
import type { EngajifyResult } from '../types';
import { ClipboardIcon, CheckIcon, StarIcon, StarFillIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import Loader from './Loader';
import { useNotification } from '../contexts/NotificationContext';

interface ResultsDisplayProps {
  results: EngajifyResult;
}

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button onClick={handleCopy} className="absolute top-3 right-3 p-1.5 bg-[var(--button-secondary-bg)] hover:bg-zinc-700 rounded-full text-gray-400 hover:text-white transition-all transform hover:scale-110">
            {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
        </button>
    );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const { title, description, hashtags, best_times, creative_ideas, platform_style, niche } = results;
  const { profile, refetchProfile } = useAuth();
  const { showNotification } = useNotification();
  const [favoritingIdea, setFavoritingIdea] = useState<string | null>(null);
  const [removingIdeas, setRemovingIdeas] = useState<string[]>([]); // New state for ideas being removed
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);

  const formattedHashtags = hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`);

  const handleHashtagClick = (tag: string) => {
    setSelectedHashtags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const hashtagsToCopy = selectedHashtags.length > 0 ? selectedHashtags.join(' ') : formattedHashtags.join(' ');

  const handleFavoriteToggle = async (idea: string) => {
    if (!profile) return;

    const isCurrentlyFavorite = profile.favorite_ideas?.includes(idea) ?? false;
    let updatedFavorites: string[];

    if (isCurrentlyFavorite) {
      if (!window.confirm('Tem certeza que deseja remover esta ideia dos seus favoritos?')) {
        return; // User cancelled
      }
      setRemovingIdeas(prev => [...prev, idea]); // Add to removing list to trigger animation
      updatedFavorites = profile.favorite_ideas?.filter(fav => fav !== idea) ?? [];
    } else {
      updatedFavorites = [...(profile.favorite_ideas ?? []), idea];
    }

    // Set loading state for the specific idea being toggled
    if (!isCurrentlyFavorite) { // Only show loader when adding, not when removing (animation handles removal visual)
        setFavoritingIdea(idea);
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ favorite_ideas: updatedFavorites })
        .eq('id', profile.id);

      if (error) throw error;

      if (!isCurrentlyFavorite) {
        showNotification('Ideia adicionada aos seus favoritos!', 'success');
      } else {
        showNotification('Ideia removida dos seus favoritos!', 'remove');
        // If it was removed, wait for animation then refetch
        setTimeout(async () => {
            await refetchProfile(); // This will cause the item to unmount
            setRemovingIdeas(prev => prev.filter(id => id !== idea)); // Clean up removing state
        }, 300); // Animation duration (should match CSS animation duration)
      }
      
      // For adding, refetch immediately after update and notification
      if (!isCurrentlyFavorite) {
          await refetchProfile();
      }

    } catch (error) {
      if (error instanceof Error) {
        // If error during removal, remove from removingIdeas state
        if (isCurrentlyFavorite) {
            setRemovingIdeas(prev => prev.filter(id => id !== idea));
        }
        alert(`Erro ao atualizar favoritos: ${error.message}`);
      }
    } finally {
      setFavoritingIdea(null); // Clear loading state for adding
    }
  };

  return (
    <div className="space-y-4 animate-fade-in text-[var(--text-secondary)] overflow-y-auto pr-2 h-full">
      
      <div className="p-4 rounded-lg relative inset-surface">
        <h3 className="font-semibold text-lg mb-2 text-[var(--text-primary)]">Título Sugerido</h3>
        <p className="text-[var(--text-primary)] pr-8">{title}</p>
        <CopyButton textToCopy={title} />
      </div>

      <div className="p-4 rounded-lg relative inset-surface">
        <h3 className="font-semibold text-lg mb-2 text-[var(--text-primary)]">Descrição/Legenda</h3>
        <p className="whitespace-pre-wrap text-[var(--text-primary)] pr-8 text-sm leading-relaxed">{description}</p>
        <CopyButton textToCopy={description} />
      </div>

      <div className="p-4 rounded-lg relative inset-surface">
        <h3 className="font-semibold text-lg mb-3 text-[var(--text-primary)]">Hashtags</h3>
        <div className="flex flex-wrap gap-2">
          {formattedHashtags.map((tag, index) => {
            const isSelected = selectedHashtags.includes(tag);
            return (
              <button
                key={index}
                onClick={() => handleHashtagClick(tag)}
                className={`hashtag-bubble ${isSelected ? 'selected' : ''}`}
                aria-pressed={isSelected}
              >
                {tag}
              </button>
            )
          })}
        </div>
        <CopyButton textToCopy={hashtagsToCopy} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg inset-surface">
            <h3 className="font-semibold text-lg mb-2 text-[var(--text-primary)]">Nicho & Formato</h3>
            <p className="text-sm"><span className="font-semibold text-gray-400">Nicho:</span> {niche}</p>
            <p className="text-sm"><span className="font-semibold text-gray-400">Formato:</span> {platform_style}</p>
        </div>
        <div className="p-4 rounded-lg inset-surface">
            <h3 className="font-semibold text-lg mb-2 text-[var(--text-primary)]">Melhores Horários</h3>
            {best_times.map((item, index) => (
                <div key={index} className="text-sm">
                    <span className="font-semibold text-gray-400">{item.platform}:</span> {item.times.join(', ')}
                </div>
            ))}
        </div>
      </div>

      <div className="p-4 rounded-lg inset-surface">
        <h3 className="font-semibold text-lg mb-3 text-[var(--text-primary)]">Ideias Criativas</h3>
        <ul className="space-y-3 text-[var(--text-primary)] text-sm">
          {creative_ideas.map((idea, index) => {
            const isFavorite = profile?.favorite_ideas?.includes(idea) ?? false;
            const isBeingToggled = favoritingIdea === idea; // Loader when adding
            const isRemoving = removingIdeas.includes(idea); // Animation when removing

            // Disable button during any loading or removing state for this item
            const isDisabled = !profile || isBeingToggled || isRemoving;

            return (
              <li 
                key={index} 
                className={`flex items-center justify-between gap-2 ${isRemoving ? 'item-removing' : ''}`}
              >
                <span className="flex-1">{idea}</span>
                <button
                  onClick={() => handleFavoriteToggle(idea)}
                  disabled={isDisabled}
                  className="icon-button p-1 disabled:opacity-50 disabled:cursor-wait"
                  aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                  {isBeingToggled ? (
                    <Loader />
                  ) : isFavorite ? ( // Only show fill icon when it IS favorite, otherwise outline
                    <StarFillIcon className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <StarIcon className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ResultsDisplay;