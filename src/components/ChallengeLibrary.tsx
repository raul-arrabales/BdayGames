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
  const grouped = challenges.reduce<Record<string, ChallengeCard[]>>((accumulator, challenge) => {
    accumulator[challenge.category] ??= [];
    accumulator[challenge.category].push(challenge);
    return accumulator;
  }, {});

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{copy.challengeLibrary}</h2>
      </div>
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
    </section>
  );
}
