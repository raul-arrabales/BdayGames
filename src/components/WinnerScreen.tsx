import type { Dictionary } from '../lib/i18n';
import type { Team, WinnerEntry } from '../types';

interface WinnerScreenProps {
  copy: Dictionary;
  winner: WinnerEntry[];
  teams: Team[];
  onRestart: () => void;
}

export function WinnerScreen({ copy, winner, teams, onRestart }: WinnerScreenProps) {
  return (
    <section className="panel podium-panel">
      <p className="eyebrow">{copy.finalPodium}</p>
      <h2>{copy.winner}</h2>
      <div className="podium-grid">
        {winner.slice(0, 3).map((entry, index) => {
          const team = teams.find((candidate) => candidate.id === entry.teamId);
          return (
            <article
              key={entry.teamId}
              className={`podium-card place-${index + 1}`}
              style={{ borderColor: team?.color }}
            >
              <span>{copy.podium[index] ?? `${index + 1}`}</span>
              <strong>{team?.name}</strong>
              <p>{entry.score} pts</p>
            </article>
          );
        })}
      </div>
      <button className="primary-button" onClick={onRestart}>
        {copy.reset}
      </button>
    </section>
  );
}
