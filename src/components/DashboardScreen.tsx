import { useEffect, useId, useState, type RefObject, type CSSProperties } from 'react';
import type { Dictionary } from '../lib/i18n';
import type { ChallengeCard, Member, Team, TwistCard } from '../types';
import { ChallengeLibrary } from './ChallengeLibrary';
import { RoundProgress } from './RoundProgress';
import { Scoreboard } from './Scoreboard';
import { TeamRaffle } from './TeamRaffle';

interface DashboardScreenProps {
  copy: Dictionary;
  gamePanelRef?: RefObject<HTMLElement | null>;
  round: number;
  currentRoundChallengeCount: number;
  currentRoundTeam: Team | null;
  activeChallenge: ChallengeCard | null;
  resolvedChallenge: ChallengeCard | null;
  activeChallengePhaseIndex: number | null;
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
  onAdvancePhase: () => void;
  onGoBackPhase: () => void;
  onSelectCurrentRoundTeam: (teamId: string) => void;
  onSelectPreQuestionOption: (optionIndex: number) => void;
  onAwardPoints: (teamId: string, memberId: string, points: number) => void;
  onAwardTeamPoints: (teamId: string, points: number) => void;
  onCompleteChallenge: () => void;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  onStopTimer: () => void;
  onSetTimerDuration: (durationSeconds: number) => void;
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
  gamePanelRef,
  round,
  currentRoundChallengeCount,
  currentRoundTeam,
  activeChallenge,
  resolvedChallenge,
  activeChallengePhaseIndex,
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
  onAdvancePhase,
  onGoBackPhase,
  onSelectCurrentRoundTeam,
  onSelectPreQuestionOption,
  onAwardPoints,
  onAwardTeamPoints,
  onCompleteChallenge,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onStopTimer,
  onSetTimerDuration,
  onRevealSolution,
  onChangeTimerVolume,
  onRevealTwist,
  onApplyTwist,
  onUndo,
  onAdjustManualScore,
  onFinish,
}: DashboardScreenProps) {
  const [isTwistModalOpen, setIsTwistModalOpen] = useState(false);
  const [isChallengeActionsExpanded, setIsChallengeActionsExpanded] = useState(false);
  const [isTimerExpanded, setIsTimerExpanded] = useState(false);
  const timerPanelId = useId();
  const challengeActionsPanelId = useId();
  const timerProgress = timerDurationSeconds > 0 ? timerSecondsLeft / timerDurationSeconds : 0;
  const timerEmptyProgress = 1 - timerProgress;
  const timerUrgencyClass =
    timerSecondsLeft <= 5 ? 'is-critical' : timerSecondsLeft <= 15 ? 'is-warning' : '';
  const preQuestion = activeChallenge?.preQuestion ?? null;
  const activePhases = resolvedChallenge?.phases ?? activeChallenge?.phases ?? [];
  const hasPhasedChallenge = activePhases.length > 0;
  const currentPhaseIndex = hasPhasedChallenge ? Math.min(activeChallengePhaseIndex ?? 0, activePhases.length - 1) : null;
  const currentPhase = currentPhaseIndex !== null ? activePhases[currentPhaseIndex] : null;
  const isFirstPhase = currentPhaseIndex === null || currentPhaseIndex <= 0;
  const isLastPhase = currentPhaseIndex === null || currentPhaseIndex >= activePhases.length - 1;
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
  const timerMinutes = Math.floor(timerDurationSeconds / 60);
  const timerSeconds = timerDurationSeconds % 60;

  const formatTimerValue = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const handleTimerMinutesChange = (value: string) => {
    const nextMinutes = Math.max(0, Number.parseInt(value || '0', 10) || 0);
    onSetTimerDuration(nextMinutes * 60 + timerSeconds);
  };

  const handleTimerSecondsChange = (value: string) => {
    const parsedSeconds = Number.parseInt(value || '0', 10) || 0;
    const nextSeconds = Math.min(59, Math.max(0, parsedSeconds));
    onSetTimerDuration(timerMinutes * 60 + nextSeconds);
  };

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
      <section className="panel spotlight" ref={gamePanelRef}>
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
                  ) : hasPhasedChallenge && currentPhase ? (
                    <div className="challenge-question-hero phased-challenge-hero">
                      <p className="eyebrow">{copy.phaseChallengeLabel}</p>
                      <h3>{resolvedChallenge?.title ?? activeChallenge.title}</h3>
                      <p>{triviaQuestion}</p>
                      <p className="badge phase-progress-badge">
                        {copy.phaseProgress} {currentPhaseIndex! + 1} / {activePhases.length}
                      </p>
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
                {hasPhasedChallenge && currentPhase ? (
                  <div className="rules-box phase-box">
                    <div className="phase-box-header">
                      <strong>{copy.phase}</strong>
                      <span>
                        {currentPhaseIndex! + 1} / {activePhases.length}
                      </span>
                    </div>
                    <h4>{currentPhase.title}</h4>
                    <p>{currentPhase.description}</p>
                    {currentPhase.rules.length > 0 ? (
                      <>
                        <strong>{copy.phaseRules}</strong>
                        <ul>
                          {currentPhase.rules.map((rule) => (
                            <li key={rule}>{rule}</li>
                          ))}
                        </ul>
                      </>
                    ) : null}
                    <div className="phase-actions">
                      <button className="secondary-button" disabled={isFirstPhase} onClick={onGoBackPhase}>
                        {copy.previousPhase}
                      </button>
                      <button className="primary-button" disabled={isLastPhase} onClick={onAdvancePhase}>
                        {copy.nextPhase}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rules-box">
                    <strong>{copy.rules}</strong>
                    <ul>
                      {(resolvedChallenge?.rules ?? activeChallenge.rules).map((rule) => (
                        <li key={rule}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="timer-panel">
                  <button
                    aria-controls={timerPanelId}
                    aria-expanded={isTimerExpanded}
                    aria-label={isTimerExpanded ? copy.hideTimer : copy.showTimer}
                    className="timer-toggle"
                    type="button"
                    onClick={() => setIsTimerExpanded((value) => !value)}
                  >
                    <span>{copy.timer}</span>
                    <span className="timer-toggle-icon" aria-hidden="true">
                      {isTimerExpanded ? (
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
                  {isTimerExpanded ? (
                    <div className="timer-card" id={timerPanelId}>
                      <div className="timer-display">
                        <div
                          className={`timer-ring ${timerUrgencyClass}`.trim()}
                          aria-live="polite"
                          style={{ '--timer-empty-progress': timerEmptyProgress } as CSSProperties}
                        >
                          <div className="timer-ring-core" />
                          <span>{formatTimerValue(timerSecondsLeft)}</span>
                        </div>
                        <div className="timer-meta">
                          <strong>{timerRunning ? copy.pauseTimer : copy.startTimer}</strong>
                          <span>
                            {formatTimerValue(timerSecondsLeft)} / {formatTimerValue(timerDurationSeconds)}
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
                        <div className="timer-settings-row">
                          <div className="timer-duration-control">
                            <span>{copy.timerSetTime}</span>
                            <div className="timer-duration-inputs">
                              <label className="timer-duration-field">
                                <span>{copy.timerMinutes}</span>
                                <input
                                  aria-label={copy.timerMinutes}
                                  disabled={timerRunning}
                                  inputMode="numeric"
                                  min="0"
                                  type="number"
                                  value={timerMinutes}
                                  onChange={(event) => handleTimerMinutesChange(event.target.value)}
                                />
                              </label>
                              <label className="timer-duration-field">
                                <span>{copy.timerSeconds}</span>
                                <input
                                  aria-label={copy.timerSeconds}
                                  disabled={timerRunning}
                                  inputMode="numeric"
                                  max="59"
                                  min="0"
                                  type="number"
                                  value={timerSeconds}
                                  onChange={(event) => handleTimerSecondsChange(event.target.value)}
                                />
                              </label>
                            </div>
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
                  ) : null}
                </div>
                <div className="timer-panel challenge-actions-panel">
                  <button
                    aria-controls={challengeActionsPanelId}
                    aria-expanded={isChallengeActionsExpanded}
                    aria-label={isChallengeActionsExpanded ? copy.hideChallengeActions : copy.showChallengeActions}
                    className="timer-toggle challenge-actions-toggle"
                    type="button"
                    onClick={() => setIsChallengeActionsExpanded((value) => !value)}
                  >
                    <span>{copy.challengeActions}</span>
                    <span className="timer-toggle-icon challenge-actions-toggle-icon" aria-hidden="true">
                      {isChallengeActionsExpanded ? (
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
                  {isChallengeActionsExpanded ? (
                    <div className="timer-card challenge-actions-card" id={challengeActionsPanelId}>
                      <div className="challenge-actions-body">
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
                      </div>
                    </div>
                  ) : null}
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
