import type { Dictionary } from '../lib/i18n';
import type { Team } from '../types';

interface RoundProgressProps {
  copy: Dictionary;
  currentRound: number;
  totalRounds: number;
  completedRounds: number;
  currentTeam: Team | null;
}

export function RoundProgress({
  copy,
  currentRound,
  totalRounds,
  completedRounds,
  currentTeam,
}: RoundProgressProps) {
  const safeTotalRounds = Math.max(0, totalRounds);
  const currentRoundIndex = currentRound >= 1 && currentRound <= safeTotalRounds ? currentRound - 1 : null;
  const rounds = Array.from({ length: safeTotalRounds }, (_, index) => {
    const roundNumber = index + 1;
    const state =
      completedRounds >= roundNumber
        ? 'completed'
        : currentRoundIndex === index
          ? 'current'
          : 'pending';

    return {
      roundNumber,
      state,
    } as const;
  });

  return (
    <section className="round-progress" aria-label={`${copy.roundProgressTitle}: ${copy.round} ${currentRound}`}>
      <div className="round-progress-header">
        <div>
          <p className="eyebrow">{copy.roundProgressTitle}</p>
          <h3>
            {copy.round} {currentRound} {copy.roundProgressOf} {safeTotalRounds}
          </h3>
        </div>
        {currentTeam ? (
          <p className="badge round-progress-team-badge">
            {copy.roundLeader}: <strong>{currentTeam.name}</strong>
          </p>
        ) : null}
      </div>

      <ol className="round-progress-track">
        {rounds.map((round) => (
          <li key={round.roundNumber} className={`round-progress-step is-${round.state}`}>
            <span
              className="round-progress-node"
              aria-current={round.state === 'current' ? 'step' : undefined}
            >
              {round.state === 'completed' ? '✓' : round.roundNumber}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
