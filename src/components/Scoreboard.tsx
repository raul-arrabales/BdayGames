import type { Dictionary } from '../lib/i18n';
import type { Member, Team } from '../types';

interface ScoreboardProps {
  copy: Dictionary;
  teams: Team[];
  members: Member[];
  onAdjustTeamScore: (teamId: string, delta: number) => void;
}

export function Scoreboard({ copy, teams, members, onAdjustTeamScore }: ScoreboardProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{copy.scoreboard}</h2>
        <span className="badge">{copy.editScores}</span>
      </div>
      <div className="score-grid">
        {teams.map((team) => (
          <article className="score-card" key={team.id} style={{ borderColor: team.color }}>
            <div className="score-card-header">
              <h3>{team.name}</h3>
              <strong>{team.score}</strong>
            </div>
            <div className="score-actions">
              <button onClick={() => onAdjustTeamScore(team.id, 50)}>+50</button>
              <button onClick={() => onAdjustTeamScore(team.id, -50)}>-50</button>
            </div>
            <ul>
              {members
                .filter((member) => member.teamId === team.id)
                .map((member) => (
                  <li key={member.id}>
                    {member.name}: {member.points}
                  </li>
                ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
