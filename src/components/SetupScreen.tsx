import type { Dictionary } from '../lib/i18n';
import type { Member, Team } from '../types';

interface SetupScreenProps {
  copy: Dictionary;
  teams: Team[];
  members: Member[];
  birthdayPersonId: string | null;
  onAddTeam: () => void;
  onAutoFillQuickSetup: () => void;
  onUpdateTeam: (teamId: string, field: 'name' | 'color', value: string) => void;
  onRemoveTeam: (teamId: string) => void;
  onAddMember: () => void;
  onUpdateMember: (memberId: string, value: string) => void;
  onRemoveMember: (memberId: string) => void;
  onSelectBirthdayPerson: (memberId: string) => void;
  onAssignCaptain: (teamId: string, memberId: string) => void;
  onContinue: () => void;
  canContinue: boolean;
}

export function SetupScreen({
  copy,
  teams,
  members,
  birthdayPersonId,
  onAddTeam,
  onAutoFillQuickSetup,
  onUpdateTeam,
  onRemoveTeam,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
  onSelectBirthdayPerson,
  onAssignCaptain,
  onContinue,
  canContinue,
}: SetupScreenProps) {
  return (
    <section className="screen-grid two-column">
      <div className="panel">
        <div className="panel-header">
          <h2>{copy.setupTitle}</h2>
          <div className="panel-actions">
            <button className="secondary-button" onClick={onAutoFillQuickSetup}>
              {copy.autoFillQuickSetup}
            </button>
            <button className="secondary-button" onClick={onAddTeam}>
              {copy.addTeam}
            </button>
          </div>
        </div>
        <div className="stack">
          {teams.map((team) => (
            <article className="team-card" key={team.id}>
              <div className="team-row">
                <input
                  className="team-name-input"
                  aria-label={`${copy.teams} ${team.name}`}
                  value={team.name}
                  onChange={(event) => onUpdateTeam(team.id, 'name', event.target.value)}
                />
                <div className="team-color-picker">
                  <span className="team-color-swatch" aria-hidden="true" style={{ backgroundColor: team.color }} />
                  <input
                    className="team-color-input"
                    aria-label={`${copy.teams} color`}
                    type="color"
                    value={team.color}
                    onChange={(event) => onUpdateTeam(team.id, 'color', event.target.value)}
                  />
                </div>
                <button className="ghost-button" onClick={() => onRemoveTeam(team.id)}>
                  X
                </button>
              </div>
              <label>
                {copy.captain}
                <select
                  value={team.captainId ?? ''}
                  onChange={(event) => onAssignCaptain(team.id, event.target.value)}
                >
                  <option value="">-</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name || 'Sin nombre'}
                    </option>
                  ))}
                </select>
              </label>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>{copy.members}</h2>
          <button className="secondary-button" onClick={onAddMember}>
            {copy.addMember}
          </button>
        </div>
        <div className="stack">
          {members.map((member) => (
            <article className="member-row" key={member.id}>
              <input
                aria-label={copy.members}
                value={member.name}
                onChange={(event) => onUpdateMember(member.id, event.target.value)}
              />
              <label className="inline-choice">
                {copy.birthdayPerson}
                <input
                  type="radio"
                  name="birthday-person"
                  checked={birthdayPersonId === member.id}
                  onChange={() => onSelectBirthdayPerson(member.id)}
                />
              </label>
              <button className="ghost-button" onClick={() => onRemoveMember(member.id)}>
                X
              </button>
            </article>
          ))}
        </div>
        <button className="primary-button" disabled={!canContinue} onClick={onContinue}>
          {copy.continueToDraft}
        </button>
      </div>
    </section>
  );
}
