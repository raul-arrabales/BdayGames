import { useEffect, useId, useMemo, useState } from 'react';
import type { Dictionary } from '../lib/i18n';
import type { Member, Team } from '../types';

interface ScoreboardProps {
  copy: Dictionary;
  teams: Team[];
  members: Member[];
  onAdjustManualScore: (teamId: string, targetId: string, delta: number) => void;
}

interface ManualAdjustmentFormProps {
  copy: Dictionary;
  teamId: string;
  teamMembers: Member[];
  onSubmit: (teamId: string, targetId: string, delta: number) => void;
}

function ManualAdjustmentForm({ copy, teamId, teamMembers, onSubmit }: ManualAdjustmentFormProps) {
  const [selectedTargetId, setSelectedTargetId] = useState(teamMembers[0]?.id ?? '');
  const [delta, setDelta] = useState('0');

  useEffect(() => {
    if (teamMembers.length === 0) {
      setSelectedTargetId('');
      return;
    }

    const hasSelectedTarget =
      selectedTargetId === 'all' || teamMembers.some((member) => member.id === selectedTargetId);

    if (!hasSelectedTarget) {
      setSelectedTargetId(teamMembers[0].id);
    }
  }, [selectedTargetId, teamMembers]);

  const parsedDelta = Number(delta);
  const canSubmit =
    teamMembers.length > 0 && selectedTargetId !== '' && Number.isFinite(parsedDelta) && parsedDelta !== 0;

  return (
    <form
      className="manual-adjustment-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) {
          return;
        }

        onSubmit(teamId, selectedTargetId, Math.trunc(parsedDelta));
        setDelta('0');
      }}
    >
      <div className="manual-adjustment-header">
        <strong>{copy.customAdjustment}</strong>
        <span>{copy.customAdjustmentHint}</span>
      </div>
      {teamMembers.length > 0 ? (
        <>
          <label className="manual-adjustment-field">
            <span>{copy.selectMember}</span>
            <select value={selectedTargetId} onChange={(event) => setSelectedTargetId(event.target.value)}>
              <option value="all">{copy.allMembers}</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label className="manual-adjustment-field">
            <span>{copy.adjustmentPoints}</span>
            <input
              inputMode="numeric"
              step="1"
              type="number"
              value={delta}
              onChange={(event) => setDelta(event.target.value)}
            />
          </label>
          <button className="secondary-button" disabled={!canSubmit} type="submit">
            {copy.applyAdjustment}
          </button>
        </>
      ) : (
        <p className="muted">{copy.noMembersInTeam}</p>
      )}
    </form>
  );
}

interface TeamScoreCardProps {
  copy: Dictionary;
  team: Team;
  teamMembers: Member[];
  onAdjustManualScore: (teamId: string, targetId: string, delta: number) => void;
}

function TeamScoreCard({ copy, team, teamMembers, onAdjustManualScore }: TeamScoreCardProps) {
  const [isManualAdjustmentOpen, setIsManualAdjustmentOpen] = useState(false);
  const manualAdjustmentPanelId = useId();

  return (
    <article className="score-card" style={{ borderColor: team.color }}>
      <div className="score-card-header">
        <h3>{team.name}</h3>
        <strong>{team.score}</strong>
      </div>
      <div className="manual-adjustment-toggle-row">
        <button
          aria-controls={manualAdjustmentPanelId}
          aria-expanded={isManualAdjustmentOpen}
          aria-label={isManualAdjustmentOpen ? copy.hideCustomAdjustment : copy.showCustomAdjustment}
          className="manual-adjustment-toggle"
          name="toggle-manual-adjustment"
          type="button"
          onClick={() => setIsManualAdjustmentOpen((current) => !current)}
        >
          <span>{copy.customAdjustment}</span>
          <span className="manual-adjustment-toggle-icon" aria-hidden="true">
            {isManualAdjustmentOpen ? (
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path d="M7 14l5-5 5 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
              </svg>
            )}
          </span>
        </button>
      </div>
      {isManualAdjustmentOpen ? (
        <div id={manualAdjustmentPanelId}>
          <ManualAdjustmentForm
            copy={copy}
            teamId={team.id}
            teamMembers={teamMembers}
            onSubmit={onAdjustManualScore}
          />
        </div>
      ) : null}
      <ul>
        {teamMembers.map((member) => (
          <li key={member.id}>
            {member.name}: {member.points}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function Scoreboard({ copy, teams, members, onAdjustManualScore }: ScoreboardProps) {
  const teamEntries = useMemo(
    () =>
      teams.map((team) => ({
        team,
        members: members.filter((member) => member.teamId === team.id),
      })),
    [members, teams],
  );
  const orderedTeams = useMemo(
    () => [...teamEntries].sort((left, right) => right.team.score - left.team.score || left.team.name.localeCompare(right.team.name)),
    [teamEntries],
  );
  const highestScore = orderedTeams[0]?.team.score ?? 0;

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{copy.scoreboard}</h2>
        <span className="badge">{copy.editScores}</span>
      </div>
      <div className="score-summary">
        <div className="score-summary-header">
          <h3>{copy.scoreSummary}</h3>
          <span className="muted">
            {copy.scoreLead}: {orderedTeams[0]?.team.name ?? '-'}
          </span>
        </div>
        <ul className="score-summary-list">
          {orderedTeams.map(({ team }) => {
            const deltaFromLeader = highestScore - team.score;
            const fillWidth = highestScore > 0 ? (team.score / highestScore) * 100 : 100;

            return (
              <li className="score-summary-item" key={team.id}>
                <div className="score-summary-label">
                  <span className="score-summary-swatch" style={{ backgroundColor: team.color }} />
                  <strong>{team.name}</strong>
                  <span>{team.score}</span>
                </div>
                <div className="score-summary-bar" aria-hidden="true">
                  <div
                    className="score-summary-fill"
                    style={{ backgroundColor: team.color, width: `${Math.max(0, Math.min(100, fillWidth))}%` }}
                  />
                </div>
                <span className="score-summary-delta">
                  {deltaFromLeader === 0 ? copy.scoreLead : `${copy.scoreDifference} -${deltaFromLeader}`}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="score-grid">
        {teamEntries.map(({ team, members: membersForTeam }) => (
          <TeamScoreCard
            key={team.id}
            copy={copy}
            team={team}
            teamMembers={membersForTeam}
            onAdjustManualScore={onAdjustManualScore}
          />
        ))}
      </div>
    </section>
  );
}
