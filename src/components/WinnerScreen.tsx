import type { CSSProperties } from 'react';
import type { Dictionary } from '../lib/i18n';
import type { Member, Team, WinnerEntry } from '../types';

interface WinnerScreenProps {
  copy: Dictionary;
  winner: WinnerEntry[];
  teams: Team[];
  members: Member[];
  onRestart: () => void;
  onResumeGame: () => void;
}

export function WinnerScreen({ copy, winner, teams, members, onRestart, onResumeGame }: WinnerScreenProps) {
  const champion = winner[0] ? teams.find((candidate) => candidate.id === winner[0].teamId) ?? null : null;
  const championMembers = champion ? members.filter((member) => member.teamId === champion.id) : [];

  return (
    <section className="panel podium-panel winner-panel">
      <div className="winner-sparkles" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="winner-header">
        <div>
          <p className="eyebrow">{copy.finalPodium}</p>
          <h2>{copy.winner}</h2>
        </div>
        <div className="winner-medal" aria-hidden="true">
          <span className="winner-medal-ribbon" />
          <span className="winner-medal-badge">★</span>
        </div>
      </div>
      {champion ? (
        <article className="winner-spotlight" style={{ '--champion-color': champion.color } as CSSProperties}>
          <p className="winner-label">{copy.winnerTeam}</p>
          <h3>{champion.name}</h3>
          <p className="winner-score">{winner[0]?.score ?? champion.score} pts</p>
          <div className="winner-member-list">
            <p className="winner-members-title">{copy.teamMembers}</p>
            <div className="winner-member-chips">
              {championMembers.length > 0 ? (
                championMembers.map((member) => (
                  <span key={member.id} className="winner-member-chip">
                    {member.name}
                  </span>
                ))
              ) : (
                <span className="winner-member-chip is-empty">-</span>
              )}
            </div>
          </div>
        </article>
      ) : null}
      <div className="podium-grid">
        {winner.slice(1, 3).map((entry, index) => {
          const team = teams.find((candidate) => candidate.id === entry.teamId);
          return (
            <article
              key={entry.teamId}
              className={`podium-card place-${index + 2}`}
              style={{ borderColor: team?.color }}
            >
              <span>{copy.podium[index + 1] ?? `${index + 2}`}</span>
              <strong>{team?.name}</strong>
              <p>{entry.score} pts</p>
            </article>
          );
        })}
      </div>
      <div className="action-row">
        <button className="primary-button" onClick={onRestart}>
          {copy.reset}
        </button>
        <button className="secondary-button" onClick={onResumeGame}>
          {copy.resumeGame}
        </button>
      </div>
    </section>
  );
}
