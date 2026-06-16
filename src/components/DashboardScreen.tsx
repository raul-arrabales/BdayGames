import { useEffect, useState, type CSSProperties } from 'react';
import type { Dictionary } from '../lib/i18n';
import type { ChallengeCard, Member, Team, TwistCard } from '../types';
import { ChallengeLibrary } from './ChallengeLibrary';
import { RoundProgress } from './RoundProgress';
import { Scoreboard } from './Scoreboard';
import { TeamRaffle } from './TeamRaffle';

interface DashboardScreenProps {
  copy: Dictionary;
  round: number;
  currentRoundChallengeCount: number;
  currentRoundTeam: Team | null;
  activeChallenge: ChallengeCard | null;
  resolvedChallenge: ChallengeCard | null;
  activeChallengeChoiceTeamId: string | null;
  activeChallengeChoiceOptionIndex: number | null;
  activeChallengeSolutionRevealed: boolean;
  timerDurationSeconds: number;
  timerSecondsLeft: number;
  timerRunning: boolean;
  timerVolume: number;
  completedChallengeIds: string[];
  challenges: ChallengeCard[];
  teams: Team[];
  members: Member[];
  activeTwist: TwistCard | null;
  challengeAwarded: boolean;
  canUndo: boolean;
  onSelectChallenge: (challengeId: string) => void;
  onSelectCurrentRoundTeam: (teamId: string) => void;
  onSelectPreQuestionOption: (optionIndex: number) => void;
  onAwardPoints: (teamId: string, memberId: string, points: number) => void;
  onAwardTeamPoints: (teamId: string, points: number) => void;
  onCompleteChallenge: () => void;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  onStopTimer: () => void;
  onRevealSolution: () => void;
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
  currentRoundTeam,
  activeChallenge,
  resolvedChallenge,
  activeChallengeChoiceTeamId,
  activeChallengeChoiceOptionIndex,
  activeChallengeSolutionRevealed,
  timerDurationSeconds,
  timerSecondsLeft,
  timerRunning,
  timerVolume,
  completedChallengeIds,
  challenges,
  teams,
  members,
  activeTwist,
  challengeAwarded,
  canUndo,
  onSelectChallenge,
  onSelectCurrentRoundTeam,
  onSelectPreQuestionOption,
  onAwardPoints,
  onAwardTeamPoints,
  onCompleteChallenge,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onStopTimer,
  onRevealSolution,
  onChangeTimerVolume,
  onRevealTwist,
  onApplyTwist,
  onUndo,
  onAdjustManualScore,
  onFinish,
}: DashboardScreenProps) {
  const [isTwistModalOpen, setIsTwistModalOpen] = useState(false);
  const timerProgress = timerDurationSeconds > 0 ? timerSecondsLeft / timerDurationSeconds : 0;
  const timerEmptyProgress = 1 - timerProgress;
  const timerUrgencyClass =
    timerSecondsLeft <= 5 ? 'is-critical' : timerSecondsLeft <= 15 ? 'is-warning' : '';
  const preQuestion = activeChallenge?.preQuestion ?? null;
  const triviaMultipleChoice = resolvedChallenge?.category === 'trivia' ? resolvedChallenge.multipleChoice : undefined;
  const triviaQuestion = resolvedChallenge?.prompt ?? activeChallenge?.prompt ?? '';
  const triviaAnswerIndex = triviaMultipleChoice?.answerIndex ?? null;
  const triviaSolutionVisible = Boolean(
    triviaMultipleChoice &&
      timerSecondsLeft <= 0 &&
      activeChallengeSolutionRevealed &&
      triviaAnswerIndex !== null,
  );
  const canRevealSolution = Boolean(triviaMultipleChoice && timerSecondsLeft <= 0);
  const twistButtonLabel = preQuestion ? copy.preQuestionTwistChoice : copy.randomTwist;
  useEffect(() => {
    if (activeTwist) {
      setIsTwistModalOpen(true);
      return;
    }

    setIsTwistModalOpen(false);
  }, [activeTwist]);

  useEffect(() => {
    if (!isTwistModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsTwistModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTwistModalOpen]);

  const openTwistModal = () => {
    if (activeTwist) {
      setIsTwistModalOpen(true);
      return;
    }

    onRevealTwist();
  };

  const applyTwistAndClose = () => {
    onApplyTwist();
    setIsTwistModalOpen(false);
  };

  return (
    <div className="dashboard-layout">
      <section className="panel spotlight">
        <RoundProgress
          copy={copy}
          currentRound={round}
          totalRounds={currentRoundChallengeCount}
          completedRounds={completedChallengeIds.length}
          currentTeam={currentRoundTeam}
        />
        {!currentRoundTeam ? (
          <TeamRaffle
            copy={copy}
            teams={teams}
            prompt={copy.chooseRoundTeam}
            onSelectTeam={onSelectCurrentRoundTeam}
          />
        ) : null}
        <div className="panel-header">
          <div>
            <h2>{copy.dashboardTitle}</h2>
          </div>
          <div className="action-row">
            <button className="secondary-button" onClick={openTwistModal}>
              {twistButtonLabel}
            </button>
            <button className="ghost-button" disabled={!canUndo} onClick={onUndo}>
              {copy.undo}
            </button>
          </div>
        </div>

        {activeChallenge ? (
          <div className="active-card">
            {preQuestion && activeChallengeChoiceOptionIndex === null ? (
              <div className="prequestion-panel">
                <div className="prequestion-header">
                  <div>
                    <p className="eyebrow">{copy.preQuestionLabel}</p>
                    <h3>{activeChallenge.title}</h3>
                  </div>
                </div>
                <p className="prequestion-prompt">{preQuestion.prompt}</p>
                {activeChallengeChoiceTeamId ? (
                  <p className="badge selected-team-badge">
                    {copy.selectedTeam}: {teams.find((team) => team.id === activeChallengeChoiceTeamId)?.name ?? copy.unknownTeam}
                  </p>
                ) : null}
                <div className="prequestion-choice-step">
                  <div className="prequestion-option-grid">
                    {preQuestion.options.map((option, index) => (
                      <button
                        key={`${option.label}-${index}`}
                        className="prequestion-option-card"
                        onClick={() => onSelectPreQuestionOption(index)}
                      >
                        <strong>{option.label}</strong>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="active-challenge-summary">
                  {activeChallengeChoiceTeamId ? (
                    <p className="badge selected-team-badge">
                      {copy.selectedTeam}: {teams.find((team) => team.id === activeChallengeChoiceTeamId)?.name ?? copy.unknownTeam}
                    </p>
                  ) : null}
                  {triviaMultipleChoice ? (
                    <div className="trivia-question-hero">
                      <p className="eyebrow">{copy.triviaQuestion}</p>
                      <h3>{triviaQuestion}</h3>
                    </div>
                  ) : (
                    <div className="challenge-question-hero">
                      <h3>{resolvedChallenge?.title ?? activeChallenge.title}</h3>
                      <p>{triviaQuestion}</p>
                    </div>
                  )}
                </div>
                {triviaMultipleChoice ? (
                  <div className="trivia-options-panel">
                    <div className="trivia-options-grid" role="list" aria-label={copy.triviaOptions}>
                      {triviaMultipleChoice.options.map((option, index) => {
                        const isCorrect = triviaSolutionVisible && index === triviaAnswerIndex;
                        const isHidden = triviaSolutionVisible && index !== triviaAnswerIndex;
                        return (
                          <div
                            key={`${option}-${index}`}
                            className={`trivia-option-card ${isCorrect ? 'is-correct' : ''} ${isHidden ? 'is-hidden' : ''}`.trim()}
                            role="listitem"
                          >
                            <span className="trivia-option-badge">{String.fromCharCode(65 + index)}</span>
                            <strong>{option}</strong>
                          </div>
                        );
                      })}
                    </div>
                    {canRevealSolution ? (
                      <div className="solution-row">
                        <button className="secondary-button" onClick={onRevealSolution}>
                          {activeChallengeSolutionRevealed ? copy.hideSolution : copy.showSolution}
                        </button>
                      </div>
                    ) : null}
                    {triviaSolutionVisible && triviaAnswerIndex !== null ? (
                      <div className="solution-box">
                        <p className="eyebrow">{copy.solution}</p>
                        <h4>{triviaMultipleChoice.options[triviaAnswerIndex]}</h4>
                        {triviaMultipleChoice.explanation ? <p>{triviaMultipleChoice.explanation}</p> : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <div className="rules-box">
                  <strong>{copy.rules}</strong>
                  <ul>
                    {(resolvedChallenge?.rules ?? activeChallenge.rules).map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </div>
                <div className="timer-panel">
                  <div className="timer-card">
                    <div className="timer-display">
                      <div
                        className={`timer-ring ${timerUrgencyClass}`.trim()}
                        aria-live="polite"
                        style={{ '--timer-empty-progress': timerEmptyProgress } as CSSProperties}
                      >
                        <div className="timer-ring-core" />
                        <span>{timerSecondsLeft}s</span>
                      </div>
                      <div className="timer-meta">
                        <strong>{timerRunning ? copy.pauseTimer : copy.startTimer}</strong>
                        <span>
                          {timerSecondsLeft}/{timerDurationSeconds}s
                        </span>
                      </div>
                    </div>
                    <div className="timer-controls">
                      <div className="timer-action-grid">
                        <button className="primary-button" disabled={timerRunning || timerSecondsLeft <= 0} onClick={onStartTimer}>
                          {copy.startTimer}
                        </button>
                        <button className="secondary-button" disabled={!timerRunning} onClick={onPauseTimer}>
                          {copy.pauseTimer}
                        </button>
                        <button className="ghost-button" onClick={onResetTimer}>
                          {copy.resetTimer}
                        </button>
                        <button className="ghost-button" disabled={timerSecondsLeft <= 0} onClick={onStopTimer}>
                          {copy.stopTimer}
                        </button>
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
                              disabled={challengeAwarded}
                              onClick={() => onAwardPoints(team.id, member.id, resolvedChallenge?.points ?? activeChallenge.points)}
                            >
                              {member.name}
                            </button>
                          ))}
                      </div>
                      <button
                        className="secondary-button award-team-button"
                        disabled={challengeAwarded || members.every((member) => member.teamId !== team.id)}
                        onClick={() => onAwardTeamPoints(team.id, resolvedChallenge?.points ?? activeChallenge.points)}
                      >
                        {copy.awardWholeTeam}
                      </button>
                    </article>
                  ))}
                </div>
                {challengeAwarded ? <p className="muted">{copy.pointsAlreadyAssigned}</p> : null}
                <div className="action-row">
                  <button className="primary-button" onClick={onCompleteChallenge}>
                    {copy.markCompleted}
                  </button>
                  <button className="secondary-button" onClick={onFinish}>
                    {copy.finishGame}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <h3>{copy.noChallenge}</h3>
            <p>{copy.selectChallenge}</p>
          </div>
        )}

        {activeTwist && isTwistModalOpen ? (
          <div
            className="twist-modal-backdrop"
            role="presentation"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setIsTwistModalOpen(false);
              }
            }}
          >
            <section
              aria-describedby="twist-modal-description"
              aria-labelledby="twist-modal-title"
              aria-modal="true"
              className="twist-modal"
              role="dialog"
            >
              <div className="twist-modal-card">
                <p className="eyebrow">{copy.surprise}</p>
                <h3 id="twist-modal-title">{activeTwist.title}</h3>
                <p id="twist-modal-description">{activeTwist.description}</p>
                <div className="twist-modal-actions">
                  <button className="primary-button" onClick={applyTwistAndClose}>
                    {copy.applyTwist}
                  </button>
                  <button className="ghost-button" onClick={() => setIsTwistModalOpen(false)}>
                    {copy.cancel}
                  </button>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </section>

      <Scoreboard
        copy={copy}
        teams={teams}
        members={members}
        onAdjustManualScore={onAdjustManualScore}
      />
      <ChallengeLibrary
        copy={copy}
        challenges={challenges}
        completedChallengeIds={completedChallengeIds}
        onSelect={onSelectChallenge}
      />
    </div>
  );
}
