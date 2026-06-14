import { useEffect, useRef, useState } from 'react';
import { DashboardScreen } from './components/DashboardScreen';
import { DraftScreen } from './components/DraftScreen';
import { LandingScreen } from './components/LandingScreen';
import { SetupScreen } from './components/SetupScreen';
import { WinnerScreen } from './components/WinnerScreen';
import { builtInGamePacks, createPackFromMarkdown, resolvePersistedPack, type PackBundle } from './lib/gamePacks';
import {
  DEFAULT_CHALLENGE_TIME_SECONDS,
  applyManualAllMembersScore,
  applyManualMemberScore,
  applyTwist,
  assignMemberToTeam,
  awardPoints,
  awardTeamPoints,
  canStartDraft,
  completeChallenge,
  computeWinner,
  createInitialState,
  createMember,
  createTeam,
  initializeDraft,
  revealRandomTwist,
  setActiveChallenge,
  setActiveChallengeWithDuration,
  setBirthdayPerson,
  pauseChallengeTimer,
  resetChallengeTimer,
  startChallengeTimer,
  tickChallengeTimer,
  undoLastAction,
} from './lib/gameState';
import { getTimerCue, playTimerCue, unlockTimerAudio } from './lib/timerAudio';
import { strings } from './lib/i18n';
import {
  clearPersistedEvent,
  loadPersistedEvent,
  savePersistedEvent,
  PERSISTED_EVENT_VERSION,
} from './lib/storage';
import type { EventState, PersistedEvent, UndoAction } from './types';

const defaultPack = builtInGamePacks[0];
const TIMER_VOLUME_STORAGE_KEY = 'bday-games-timer-volume';

interface SavedSession {
  persisted: PersistedEvent;
  pack: PackBundle;
}

function finalizeGameState(state: EventState): EventState {
  return {
    ...state,
    winner: computeWinner(state.teams),
    screen: 'winner',
  };
}

function App() {
  const copy = strings.es;
  const [eventState, setEventState] = useState<EventState>(() => createInitialState(defaultPack.pack));
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);
  const [currentPack, setCurrentPack] = useState<PackBundle>(defaultPack);
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);
  const [hasStoredSave, setHasStoredSave] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [landingError, setLandingError] = useState<string | null>(null);
  const [timerVolume, setTimerVolume] = useState<number>(() => {
    try {
      const stored = window.localStorage.getItem(TIMER_VOLUME_STORAGE_KEY);
      const parsed = stored ? Number(stored) : NaN;
      return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0.6;
    } catch {
      return 0.6;
    }
  });
  const timerSnapshotRef = useRef<{ challengeId: string | null; secondsLeft: number }>({
    challengeId: null,
    secondsLeft: DEFAULT_CHALLENGE_TIME_SECONDS,
  });

  useEffect(() => {
    const persisted = loadPersistedEvent();
    setHasStoredSave(Boolean(persisted));
    if (persisted) {
      const resolvedPack = resolvePersistedPack(persisted);
      if (resolvedPack) {
        setSavedSession({
          persisted: {
            ...persisted,
            state: normalizeTimerState(persisted.state, resolvedPack.pack),
          },
          pack: resolvedPack,
        });
      } else {
        setLandingError(copy.missingPack);
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || eventState.screen === 'landing') {
      return;
    }

    const payload: PersistedEvent = {
      version: PERSISTED_EVENT_VERSION,
      state: eventState,
      undoAction,
      packMarkdown: currentPack.markdown,
      packFileName: currentPack.fileName,
    };
    savePersistedEvent(payload);
  }, [currentPack, eventState, hydrated, undoAction]);

  useEffect(() => {
    try {
      window.localStorage.setItem(TIMER_VOLUME_STORAGE_KEY, String(timerVolume));
    } catch {
      // Ignore storage failures for this preference.
    }
  }, [timerVolume]);

  useEffect(() => {
    if (
      eventState.screen !== 'dashboard' ||
      !eventState.activeChallengeId ||
      !eventState.challengeTimerRunning ||
      eventState.challengeTimerSecondsLeft <= 0
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setEventState((current) => tickChallengeTimer(current));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [
    eventState.activeChallengeId,
    eventState.challengeTimerRunning,
    eventState.challengeTimerSecondsLeft,
    eventState.screen,
  ]);

  useEffect(() => {
    const snapshot = timerSnapshotRef.current;
    const currentChallengeId = eventState.activeChallengeId;
    const currentSecondsLeft = eventState.challengeTimerSecondsLeft;

    if (snapshot.challengeId !== currentChallengeId) {
      timerSnapshotRef.current = { challengeId: currentChallengeId, secondsLeft: currentSecondsLeft };
      return;
    }

    if (eventState.screen !== 'dashboard') {
      timerSnapshotRef.current = { challengeId: currentChallengeId, secondsLeft: currentSecondsLeft };
      return;
    }

    const cue = getTimerCue(snapshot.secondsLeft, currentSecondsLeft);
    if (cue) {
      playTimerCue(cue, timerVolume);
    }

    timerSnapshotRef.current = { challengeId: currentChallengeId, secondsLeft: currentSecondsLeft };
  }, [eventState.activeChallengeId, eventState.challengeTimerSecondsLeft, eventState.screen, timerVolume]);

  const gamePack = currentPack.pack;
  const activeChallenge = gamePack.challenges.find((challenge) => challenge.id === eventState.activeChallengeId) ?? null;
  const activeTwist = gamePack.twists.find((twist) => twist.id === eventState.activeTwistId) ?? null;
  const currentDraftTeam = eventState.teams.find((team) => team.id === eventState.currentTurnTeamId);
  const hasCompletedAllRounds =
    gamePack.challenges.length > 0 && eventState.completedChallengeIds.length >= gamePack.challenges.length;

  const startNewGame = (pack: PackBundle) => {
    clearPersistedEvent();
    setCurrentPack(pack);
    setUndoAction(null);
    setSavedSession(null);
    setHasStoredSave(false);
    setLandingError(null);
    setEventState({
      ...createInitialState(pack.pack),
      screen: 'setup',
    });
    timerSnapshotRef.current = { challengeId: null, secondsLeft: DEFAULT_CHALLENGE_TIME_SECONDS };
  };

  const resumeSavedGame = () => {
    if (!savedSession) {
      return;
    }

    setCurrentPack(savedSession.pack);
    setUndoAction(savedSession.persisted.undoAction);
    setLandingError(null);
    setEventState(normalizeTimerState(savedSession.persisted.state, savedSession.pack.pack));
    timerSnapshotRef.current = {
      challengeId: savedSession.persisted.state.activeChallengeId,
      secondsLeft: savedSession.persisted.state.challengeTimerSecondsLeft,
    };
  };

  const updateState = (updater: (current: EventState) => EventState) => {
    setEventState((current) => updater(current));
  };

  const finishGame = () => {
    setEventState((current) => finalizeGameState(current));
  };

  useEffect(() => {
    if (eventState.screen !== 'dashboard' || !hasCompletedAllRounds) {
      return;
    }

    setEventState((current) => (current.screen === 'winner' ? current : finalizeGameState(current)));
  }, [eventState.screen, hasCompletedAllRounds]);

  const assignCaptain = (teamId: string, memberId: string) => {
    updateState((current) => {
      const selectedMemberId = memberId || null;

      return {
        ...current,
        teams: current.teams.map((team) => {
          const withoutSelected = team.memberIds.filter((id) => id !== selectedMemberId);
          if (team.id === teamId) {
            return {
              ...team,
              captainId: selectedMemberId,
              memberIds:
                selectedMemberId && !withoutSelected.includes(selectedMemberId)
                  ? [...withoutSelected, selectedMemberId]
                  : withoutSelected,
            };
          }

          return {
            ...team,
            captainId: team.captainId === selectedMemberId ? null : team.captainId,
            memberIds: withoutSelected,
          };
        }),
        members: current.members.map((member) =>
          member.id === selectedMemberId
            ? { ...member, teamId }
            : member.teamId === teamId && current.teams.find((team) => team.id === teamId)?.captainId === member.id
              ? { ...member, teamId: null }
              : member,
        ),
        lastUpdatedAt: new Date().toISOString(),
      };
    });
  };

  const startBuiltInPack = (packId: string) => {
    const pack = builtInGamePacks.find((entry) => entry.pack.id === packId);
    if (!pack) {
      setLandingError(copy.missingPack);
      return;
    }

    startNewGame(pack);
  };

  const normalizeTimerState = (state: EventState, pack: PackBundle['pack']): EventState => {
    const challenge = pack.challenges.find((entry) => entry.id === state.activeChallengeId);
    if (!challenge) {
      return state;
    }

    const duration = challenge.time ?? DEFAULT_CHALLENGE_TIME_SECONDS;
    const secondsLeft = Math.min(
      duration,
      Math.max(0, state.challengeTimerSecondsLeft ?? duration),
    );

    return {
      ...state,
      challengeTimerDurationSeconds: duration,
      challengeTimerSecondsLeft: secondsLeft,
      challengeTimerRunning: state.challengeTimerRunning && secondsLeft > 0,
    };
  };

  const uploadPack = async (file: File) => {
    try {
      const markdown = await file.text();
      const pack = createPackFromMarkdown(markdown, file.name);
      startNewGame(pack);
    } catch {
      setLandingError(copy.invalidPack);
    }
  };

  const startTimer = () => {
    void unlockTimerAudio();
    updateState((current) => startChallengeTimer(current));
  };

  const clearSavedGame = () => {
    clearPersistedEvent();
    setSavedSession(null);
    setHasStoredSave(false);
    setUndoAction(null);
    setLandingError(null);
    timerSnapshotRef.current = { challengeId: null, secondsLeft: DEFAULT_CHALLENGE_TIME_SECONDS };
    setEventState((current) => ({
      ...createInitialState(currentPack.pack),
      screen: 'landing',
    }));
  };

  return (
    <main className="app-shell">
      <div className="background-glow background-glow-a" />
      <div className="background-glow background-glow-b" />

      {eventState.screen === 'landing' ? (
        <LandingScreen
          copy={copy}
          builtInPacks={builtInGamePacks}
          hasSavedGame={hasStoredSave}
          landingError={landingError}
          savedPack={savedSession?.pack ?? null}
          onChoosePack={startBuiltInPack}
          onUploadPack={uploadPack}
          onResume={resumeSavedGame}
          onReset={clearSavedGame}
        />
      ) : null}

      {eventState.screen === 'setup' ? (
        <SetupScreen
          copy={copy}
          teams={eventState.teams}
          members={eventState.members}
          birthdayPersonId={eventState.birthdayPersonId}
          onAddTeam={() => updateState((current) => ({ ...current, teams: [...current.teams, createTeam()], lastUpdatedAt: new Date().toISOString() }))}
          onUpdateTeam={(teamId, field, value) =>
            updateState((current) => ({
              ...current,
              teams: current.teams.map((team) => (team.id === teamId ? { ...team, [field]: value } : team)),
              lastUpdatedAt: new Date().toISOString(),
            }))
          }
          onRemoveTeam={(teamId) =>
            updateState((current) => ({
              ...current,
              teams: current.teams.filter((team) => team.id !== teamId),
              members: current.members.map((member) =>
                member.teamId === teamId ? { ...member, teamId: null } : member,
              ),
              lastUpdatedAt: new Date().toISOString(),
            }))
          }
          onAddMember={() =>
            updateState((current) => ({
              ...current,
              members: [...current.members, createMember()],
              lastUpdatedAt: new Date().toISOString(),
            }))
          }
          onUpdateMember={(memberId, value) =>
            updateState((current) => ({
              ...current,
              members: current.members.map((member) =>
                member.id === memberId ? { ...member, name: value } : member,
              ),
              lastUpdatedAt: new Date().toISOString(),
            }))
          }
          onRemoveMember={(memberId) =>
            updateState((current) => ({
              ...current,
              members: current.members.filter((member) => member.id !== memberId),
              teams: current.teams.map((team) => ({
                ...team,
                memberIds: team.memberIds.filter((id) => id !== memberId),
                captainId: team.captainId === memberId ? null : team.captainId,
              })),
              birthdayPersonId: current.birthdayPersonId === memberId ? null : current.birthdayPersonId,
              lastUpdatedAt: new Date().toISOString(),
            }))
          }
          onSelectBirthdayPerson={(memberId) => updateState((current) => setBirthdayPerson(current, memberId))}
          onAssignCaptain={assignCaptain}
          onContinue={() => updateState((current) => initializeDraft(current))}
          canContinue={canStartDraft(eventState)}
        />
      ) : null}

      {eventState.screen === 'draft' ? (
        <DraftScreen
          copy={copy}
          currentRound={eventState.draftRound}
          currentTeam={currentDraftTeam}
          availableMembers={eventState.members.filter((member) => member.teamId === null)}
          teams={eventState.teams}
          onPick={(memberId, teamId) => updateState((current) => assignMemberToTeam(current, memberId, teamId))}
          onBack={() => updateState((current) => ({ ...current, screen: 'setup' }))}
        />
      ) : null}

      {eventState.screen === 'dashboard' ? (
        <DashboardScreen
          copy={copy}
          round={eventState.currentRound}
          currentRoundChallengeCount={gamePack.challenges.length}
          activeChallenge={activeChallenge}
          timerDurationSeconds={eventState.challengeTimerDurationSeconds}
          timerSecondsLeft={eventState.challengeTimerSecondsLeft}
          timerRunning={eventState.challengeTimerRunning}
          timerVolume={timerVolume}
          completedChallengeIds={eventState.completedChallengeIds}
          challenges={gamePack.challenges}
          teams={eventState.teams}
          members={eventState.members}
          activeTwist={activeTwist}
          challengeAwarded={eventState.challengeAwarded}
          canUndo={Boolean(undoAction)}
          onSelectChallenge={(challengeId) =>
            updateState((current) => {
              const challenge = gamePack.challenges.find((entry) => entry.id === challengeId);
              return challenge
                ? setActiveChallengeWithDuration(current, challengeId, challenge.time ?? DEFAULT_CHALLENGE_TIME_SECONDS)
                : setActiveChallenge(current, challengeId);
            })
          }
          onAwardPoints={(teamId, memberId, points) =>
            setEventState((current) => {
              const result = awardPoints(current, teamId, memberId, points);
              if (result.undoAction) {
                setUndoAction(result.undoAction);
              }
              return result.state;
            })
          }
          onAwardTeamPoints={(teamId, points) =>
            setEventState((current) => {
              const result = awardTeamPoints(current, teamId, points);
              if (result.undoAction) {
                setUndoAction(result.undoAction);
              }
              return result.state;
            })
          }
          onCompleteChallenge={() =>
            setEventState((current) => {
              const result = completeChallenge(current);
              if (result.undoAction) {
                setUndoAction(result.undoAction);
              }
              return result.state;
            })
          }
          onStartTimer={startTimer}
          onPauseTimer={() => updateState((current) => pauseChallengeTimer(current))}
          onResetTimer={() => updateState((current) => resetChallengeTimer(current))}
          onChangeTimerVolume={setTimerVolume}
          onRevealTwist={() => updateState((current) => revealRandomTwist(current, gamePack.twists))}
          onApplyTwist={() =>
            activeTwist &&
            setEventState((current) => {
              const result = applyTwist(current, activeTwist);
              if (result.undoAction) {
                setUndoAction(result.undoAction);
              }
              return result.state;
            })
          }
          onUndo={() =>
            setEventState((current) => {
              const reverted = undoLastAction(current, undoAction);
              setUndoAction(null);
              return reverted;
            })
          }
          onAdjustManualScore={(teamId, targetId, delta) =>
            setEventState((current) => {
              const result =
                targetId === 'all'
                  ? applyManualAllMembersScore(current, teamId, delta)
                  : applyManualMemberScore(current, teamId, targetId, delta);
              setUndoAction(result.undoAction);
              return result.state;
            })
          }
          onFinish={finishGame}
        />
      ) : null}

      {eventState.screen === 'winner' && eventState.winner ? (
        <WinnerScreen
          copy={copy}
          winner={eventState.winner}
          teams={eventState.teams}
          onRestart={() => startNewGame(currentPack)}
        />
      ) : null}
    </main>
  );
}

export default App;
