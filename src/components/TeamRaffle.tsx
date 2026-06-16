import { useEffect, useRef, useState } from 'react';
import type { Dictionary } from '../lib/i18n';
import type { Team } from '../types';

interface TeamRaffleProps {
  copy: Dictionary;
  teams: Team[];
  prompt: string;
  isLocked?: boolean;
  showRandomButton?: boolean;
  onSelectTeam: (teamId: string) => void;
}

export function TeamRaffle({
  copy,
  teams,
  prompt,
  isLocked = false,
  showRandomButton = true,
  onSelectTeam,
}: TeamRaffleProps) {
  const [rollingTeamId, setRollingTeamId] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const rollTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (rollTimerRef.current !== null) {
        window.clearInterval(rollTimerRef.current);
      }
    },
    [],
  );

  const rollForTeam = () => {
    if (rollTimerRef.current !== null || teams.length === 0) {
      return;
    }

    const totalSteps = Math.max(10, teams.length * 4);
    let step = 0;
    setIsRolling(true);
    setRollingTeamId(teams[0]?.id ?? null);
    rollTimerRef.current = window.setInterval(() => {
      const nextTeam = teams[step % teams.length];
      setRollingTeamId(nextTeam?.id ?? null);
      step += 1;

      if (step >= totalSteps) {
        if (rollTimerRef.current !== null) {
          window.clearInterval(rollTimerRef.current);
        }
        rollTimerRef.current = null;
        setIsRolling(false);

        const winner = teams[Math.floor(Math.random() * teams.length)] ?? null;
        setRollingTeamId(winner?.id ?? null);
        if (winner) {
          onSelectTeam(winner.id);
        }
      }
    }, 90);
  };

  return (
    <div className="team-raffle">
      <p className="muted">{prompt}</p>
      <div className="prequestion-team-grid">
        {teams.map((team) => (
          <button
            key={team.id}
            className={`team-chip prequestion-team-chip ${rollingTeamId === team.id ? 'is-rolling' : ''} ${isLocked && rollingTeamId === team.id ? 'is-selected' : ''}`.trim()}
            style={{ background: team.color }}
            disabled={isRolling || isLocked}
            onClick={() => onSelectTeam(team.id)}
          >
            {team.name}
          </button>
      ))}
      </div>
      {showRandomButton ? (
        <div className="action-row">
          <button className="primary-button" disabled={isRolling || isLocked || teams.length === 0} onClick={rollForTeam}>
            {copy.randomTeamChoice}
          </button>
        </div>
      ) : null}
    </div>
  );
}
