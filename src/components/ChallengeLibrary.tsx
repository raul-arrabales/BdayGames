import { useState } from 'react';
import type { Dictionary } from '../lib/i18n';
import type { ChallengeCard } from '../types';

interface ChallengeLibraryProps {
  copy: Dictionary;
  challenges: ChallengeCard[];
  completedChallengeIds: string[];
  onSelect: (challengeId: string) => void;
}

export function ChallengeLibrary({
  copy,
  challenges,
  completedChallengeIds,
  onSelect,
}: ChallengeLibraryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const grouped = challenges.reduce<Record<string, ChallengeCard[]>>((accumulator, challenge) => {
    accumulator[challenge.category] ??= [];
    accumulator[challenge.category].push(challenge);
    return accumulator;
  }, {});

  return (
    <section className="panel challenge-library-panel">
      <button
        type="button"
        aria-label={isOpen ? copy.closeChallengeLibrary : copy.openChallengeLibrary}
        aria-expanded={isOpen}
        className="challenge-library-toggle"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>
          <strong>{copy.challengeLibrary}</strong>
          <span className="challenge-library-toggle-hint">
            {isOpen ? copy.closeChallengeLibrary : copy.openChallengeLibrary}
          </span>
        </span>
        <span className="challenge-library-toggle-icon" aria-hidden="true">
          {isOpen ? '−' : '+'}
        </span>
      </button>

      {isOpen ? (
        <div className="challenge-library-content">
          <button
            type="button"
            className="ghost-button challenge-library-close"
            onClick={() => setIsOpen(false)}
          >
            {copy.collapseChallengeLibrary}
          </button>
          <div className="category-grid">
            {Object.entries(grouped).map(([category, categoryChallenges]) => (
              <div key={category}>
                <h3 className="category-title">{category}</h3>
                <div className="stack">
                  {categoryChallenges.map((challenge) => {
                    const completed = completedChallengeIds.includes(challenge.id);
                    return (
                      <button
                        className={`challenge-card ${completed ? 'is-completed' : ''}`}
                        key={challenge.id}
                        disabled={completed}
                        onClick={() => onSelect(challenge.id)}
                      >
                        <strong>{challenge.title}</strong>
                        <span>{challenge.prompt}</span>
                        <span>
                          {challenge.points} pts · {challenge.time}s {completed ? `· ${copy.completed}` : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
