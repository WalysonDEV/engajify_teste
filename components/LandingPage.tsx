import React, { useState, useEffect, useRef, useCallback } from 'react';
import Auth from './Auth';
import LiquidGlassBackground from './LiquidGlassBackground';

const BubblesBackground: React.FC = () => {
    // Generate an array to map over for bubbles
    const bubbles = Array.from({ length: 60 }).map((_, i) => {
        const style = {
            '--size': `${4 + Math.random() * 26}rem`,
            '--left-start': `${-10 + Math.random() * 120}%`,
            '--left-end': `${-10 + Math.random() * 120}%`,
            '--animation-delay': `${-1 * (Math.random() * 40)}s`,
            '--animation-duration': `${30 + Math.random() * 50}s`,
        };
        return <div key={i} className="bubble" style={style as React.CSSProperties}></div>;
    });

    return <div className="bubbles-background" aria-hidden="true">{bubbles}</div>;
};


const LandingPage: React.FC = () => {
    const phrases = [
        "Crie conteúdo que conecta e inspira.",
        "Transforme ideias em posts que brilham.",
        "Aumente seu engajamento com inteligência.",
        "Descubra o poder criativo da IA.",
        "Torne sua marca impossível de ignorar."
    ];

    const [phraseIndex, setPhraseIndex] = useState(0);
    const [animationState, setAnimationState] = useState('in');
    const [isMobile, setIsMobile] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // --- Hacker Text Effect State and Logic ---
    const originalTitle = "Engajify";
    const [titleText, setTitleText] = useState(originalTitle);
    const hackerIntervalRef = useRef<number | null>(null);
    const isEffectActive = useRef(false); // Use ref to track active state without causing re-renders

    const stopHackerEffect = useCallback(() => {
        if (hackerIntervalRef.current) {
            clearInterval(hackerIntervalRef.current);
            hackerIntervalRef.current = null;
        }
    }, []);

    const startRevealEffect = useCallback(() => {
        stopHackerEffect();
        let iteration = 0;
        hackerIntervalRef.current = window.setInterval(() => {
            const newText = originalTitle
                .split('')
                .map((_letter, index) => {
                    if (index < iteration) {
                        return originalTitle[index];
                    }
                    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
                })
                .join('');

            setTitleText(newText);

            if (iteration >= originalTitle.length) {
                stopHackerEffect();
                setTitleText(originalTitle);
            }

            iteration += 1 / 3; // Reveal speed
        }, 30);
    }, [stopHackerEffect, originalTitle]);

    const handleInteractionEnd = useCallback(() => {
        // When interaction ends, immediately remove the global listeners
        window.removeEventListener('mouseup', handleInteractionEnd);
        window.removeEventListener('touchend', handleInteractionEnd);

        if (isEffectActive.current) {
            isEffectActive.current = false;
            startRevealEffect();
        }
    }, [startRevealEffect]);

    const handleInteractionStart = useCallback(() => {
        if (isEffectActive.current) return;
        isEffectActive.current = true;
        
        stopHackerEffect();
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        hackerIntervalRef.current = window.setInterval(() => {
            const scrambled = originalTitle
                .split('')
                .map(() => letters[Math.floor(Math.random() * letters.length)])
                .join('');
            setTitleText(scrambled);
        }, 60); // Scramble speed

        // Add global listeners to catch the release event anywhere on the page
        window.addEventListener('mouseup', handleInteractionEnd);
        window.addEventListener('touchend', handleInteractionEnd);
    }, [stopHackerEffect, originalTitle, handleInteractionEnd]);
    // --- End Hacker Text Effect Logic ---

    // Effect for rotating phrases
    useEffect(() => {
        const animationDuration = 500; // ms, should match CSS
        const phraseVisibleDuration = 4000; // ms

        const phraseInterval = setInterval(() => {
            setAnimationState('out');

            setTimeout(() => {
                setPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
                setAnimationState('in');
            }, animationDuration);
        }, phraseVisibleDuration);

        return () => {
            clearInterval(phraseInterval);
        };
    }, [phrases.length]);

    // Effect for cleanup on unmount
    useEffect(() => {
        return () => {
            stopHackerEffect();
            // Ensure listeners are removed if component unmounts while effect is active
            window.removeEventListener('mouseup', handleInteractionEnd);
            window.removeEventListener('touchend', handleInteractionEnd);
        };
    }, [stopHackerEffect, handleInteractionEnd]);

    // Detect mobile and reduced motion preferences on client only
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mq = window.matchMedia('(max-width: 767px)');
        const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

        const update = () => setIsMobile(mq.matches || navigator.userAgent.match(/Mobi|Android/i) !== null);
        const updateMotion = () => setPrefersReducedMotion(motionMq.matches);

        update();
        updateMotion();

        mq.addEventListener?.('change', update);
        motionMq.addEventListener?.('change', updateMotion);
        window.addEventListener('resize', update);

        return () => {
            mq.removeEventListener?.('change', update);
            motionMq.removeEventListener?.('change', updateMotion);
            window.removeEventListener('resize', update);
        };
    }, []);

    const animationClass = animationState === 'in' ? 'rotating-text-in' : 'rotating-text-out';

    // On mobile or when user prefers reduced motion, render a lightweight static background to avoid freezes.
    if (isMobile || prefersReducedMotion) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 relative overflow-hidden bg-black">
                <div className="relative z-10 flex flex-col items-center">
                    <h1
                        className="futuristic-title interactive-glow-target"
                        onMouseDown={handleInteractionStart}
                        onTouchStart={handleInteractionStart}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                        {titleText}
                    </h1>
                    <div className="mt-4 text-lg max-w-2xl mx-auto text-[var(--text-secondary)] h-[56px] flex items-center justify-center overflow-hidden">
                        <span className={animationClass}>
                            {phrases[phraseIndex]}
                        </span>
                    </div>
                    <div className="mt-10 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                        <Auth />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <LiquidGlassBackground
            className="min-h-screen flex flex-col items-center justify-center text-center p-4 relative overflow-hidden bg-black"
        >
            <BubblesBackground />

            <div className="relative z-10 flex flex-col items-center">
                <h1
                    className="futuristic-title interactive-glow-target"
                    onMouseDown={handleInteractionStart}
                    onTouchStart={handleInteractionStart}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                    {titleText}
                </h1>
                <div className="mt-4 text-lg max-w-2xl mx-auto text-[var(--text-secondary)] h-[56px] flex items-center justify-center overflow-hidden">
                    <span className={animationClass}>
                        {phrases[phraseIndex]}
                    </span>
                </div>
                <div className="mt-10 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                    <Auth />
                </div>
            </div>
        </LiquidGlassBackground>
    );
};

export default LandingPage;
