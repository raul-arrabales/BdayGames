import type { Dictionary } from '../lib/i18n';
import type { Member, Team } from '../types';

interface DraftScreenProps {
  copy: Dictionary;
  currentRound: number;
  currentTeam: Team | undefined;
  availableMembers: Member[];
  teams: Team[];
  onPick: (memberId: string, teamId: string) => void;
  onBack: () => void;
}

export function DraftScreen({
  copy,
  currentRound,
  currentTeam,
  availableMembers,
  teams,
  onPick,
  onBack,
}: DraftScreenProps) {
  return (
    <section className="screen-grid two-column">
      <div className="panel">
        <div className="panel-header">
          <h2>{copy.draftTitle}</h2>
          <button className="ghost-button" onClick={onBack}>
            {copy.backToSetup}
          </button>
        </div>
        <p className="muted">
          {copy.round} {currentRound}
        </p>
        <h3>{copy.currentPick}</h3>
        <div className="turn-banner" style={{ borderColor: currentTeam?.color }}>
          <strong>{currentTeam?.name ?? '-'}</strong>
        </div>
        <div className="team-chip-row">
          {teams.map((team) => (
            <span className="team-chip" key={team.id} style={{ backgroundColor: team.color }}>
              {team.name}
            </span>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3>{copy.availableMembers}</h3>
        <div className="stack">
          {availableMembers.map((member) => (
            <button
              className="draft-member"
              key={member.id}
              disabled={!currentTeam}
              onClick={() => currentTeam && onPick(member.id, currentTeam.id)}
            >
              {member.name || 'Sin nombre'}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
