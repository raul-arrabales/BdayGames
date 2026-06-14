import type { CSSProperties } from 'react';
import type { Dictionary } from '../lib/i18n';
import type { ChallengeCard, Member, Team, TwistCard } from '../types';
import { ChallengeLibrary } from './ChallengeLibrary';
import { RoundProgress } from './RoundProgress';
import { Scoreboard } from './Scoreboard';

interface DashboardScreenProps {
  copy: Dictionary;
  round: number;
  currentRoundChallengeCount: number;
  activeChallenge: ChallengeCard | null;
  timerDurationSeconds: number;
  timerSecondsLeft: number;
  timerRunning: boolean;
  timerVolume: number;
  completedChallengeIds: string[];
  challenges: ChallengeCard[];
  teams: Team[];
  members: Member[];
  activeTwist: TwistCard | null;
  canUndo: boolean;
  onSelectChallenge: (challengeId: string) => void;
  onAwardPoints: (teamId: string, memberId: string, points: number) => void;
  onCompleteChallenge: () => void;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  onChangeTimerVolume: (volume: number) => void;
  onRevealTwist: () => void;
  onApplyTwist: () => void;
  onUndo: () => void;
  onAdjustManualScore: (teamId: string, targetId: string, delta: number) => void;
  onFinish: () => void;
}

export function DashboardScreen({
  copy,
  round,
  currentRoundChallengeCount,
  activeChallenge,
  timerDurationSeconds,
  timerSecondsLeft,
  timerRunning,
  timerVolume,
  completedChallengeIds,
  challenges,
  teams,
  members,
  activeTwist,
  canUndo,
  onSelectChallenge,
  onAwardPoints,
  onCompleteChallenge,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onChangeTimerVolume,
  onRevealTwist,
  onApplyTwist,
  onUndo,
  onAdjustManualScore,
  onFinish,
}: DashboardScreenProps) {
  const timerProgress = timerDurationSeconds > 0 ? timerSecondsLeft / timerDurationSeconds : 0;
  const timerEmptyProgress = 1 - timerProgress;
  const timerUrgencyClass =
    timerSecondsLeft <= 5 ? 'is-critical' : timerSecondsLeft <= 15 ? 'is-warning' : '';

  return (
    <div className="dashboard-layout">
      <section className="panel spotlight">
        <RoundProgress
          copy={copy}
          currentRound={round}
          totalRounds={currentRoundChallengeCount}
          completedRounds={completedChallengeIds.length}
        />
        <div className="panel-header">
          <div>
            <p className="eyebrow">
              {copy.round} {round}
            </p>
            <h2>{copy.dashboardTitle}</h2>
          </div>
          <div className="action-row">
            <button className="secondary-button" onClick={onRevealTwist}>
              {copy.randomTwist}
            </button>
            <button className="ghost-button" disabled={!canUndo} onClick={onUndo}>
              {copy.undo}
            </button>
          </div>
        </div>

        {activeChallenge ? (
          <div className="active-card">
            <h3>{activeChallenge.title}</h3>
            <p>{activeChallenge.prompt}</p>
            <div className="rules-box">
              <strong>{copy.rules}</strong>
              <ul>
                {activeChallenge.rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
            <div className="timer-panel">
              <div className="timer-row">
                <div
                  className={`timer-ring ${timerUrgencyClass}`.trim()}
                  aria-live="polite"
                  style={{ '--timer-empty-progress': timerEmptyProgress } as CSSProperties}
                >
                  <div className="timer-ring-core" />
                  <span>{timerSecondsLeft}s</span>
                </div>
                <label className="timer-volume-control">
                  <span>{copy.timerVolume}</span>
                  <input
                    aria-label={copy.timerVolume}
                    className="timer-volume-slider"
                    max="1"
                    min="0"
                    step="0.05"
                    type="range"
                    value={timerVolume}
                    onChange={(event) => onChangeTimerVolume(Number(event.target.value))}
                  />
                  <strong>{Math.round(timerVolume * 100)}%</strong>
                </label>
              </div>
              <div className="timer-meta">
                <strong>{timerRunning ? copy.pauseTimer : copy.startTimer}</strong>
                <span>
                  {timerSecondsLeft}/{timerDurationSeconds}s
                </span>
              </div>
              <div className="action-row">
                <button className="primary-button" disabled={timerRunning || timerSecondsLeft <= 0} onClick={onStartTimer}>
                  {copy.startTimer}
                </button>
                <button className="secondary-button" disabled={!timerRunning} onClick={onPauseTimer}>
                  {copy.pauseTimer}
                </button>
                <button className="ghost-button" onClick={onResetTimer}>
                  {copy.resetTimer}
                </button>
              </div>
            </div>
            <div className="award-grid">
              {teams.map((team) => (
                <article key={team.id} className="award-card" style={{ borderColor: team.color }}>
                  <h4>{team.name}</h4>
                  <div className="member-pills">
                    {members
                      .filter((member) => member.teamId === team.id)
                      .map((member) => (
                        <button
                          key={member.id}
                          onClick={() => onAwardPoints(team.id, member.id, activeChallenge.points)}
                        >
                          {member.name}
                        </button>
                      ))}
                  </div>
                </article>
              ))}
            </div>
            <div className="action-row">
              <button className="primary-button" onClick={onCompleteChallenge}>
                {copy.markCompleted}
              </button>
              <button className="secondary-button" onClick={onFinish}>
                {copy.finishGame}
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <h3>{copy.noChallenge}</h3>
            <p>{copy.selectChallenge}</p>
          </div>
        )}

        {activeTwist ? (
          <div className="twist-banner">
            <p className="eyebrow">{copy.surprise}</p>
            <h3>{activeTwist.title}</h3>
            <p>{activeTwist.description}</p>
            <button className="primary-button" onClick={onApplyTwist}>
              {copy.applyTwist}
            </button>
          </div>
        ) : null}
      </section>

      <ChallengeLibrary
        copy={copy}
        challenges={challenges}
        completedChallengeIds={completedChallengeIds}
        onSelect={onSelectChallenge}
      />
      <Scoreboard
        copy={copy}
        teams={teams}
        members={members}
        onAdjustManualScore={onAdjustManualScore}
      />
    </div>
  );
}
