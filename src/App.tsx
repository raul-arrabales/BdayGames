import { useEffect, useState } from 'react';
import { DashboardScreen } from './components/DashboardScreen';
import { DraftScreen } from './components/DraftScreen';
import { LandingScreen } from './components/LandingScreen';
import { SetupScreen } from './components/SetupScreen';
import { WinnerScreen } from './components/WinnerScreen';
import { builtInGamePacks, createPackFromMarkdown, resolvePersistedPack, type PackBundle } from './lib/gamePacks';
import {
  applyManualTeamScore,
  applyTwist,
  assignMemberToTeam,
  awardPoints,
  canStartDraft,
  completeChallenge,
  computeWinner,
  createInitialState,
  createMember,
  createTeam,
  initializeDraft,
  revealRandomTwist,
  setActiveChallenge,
  setBirthdayPerson,
  undoLastAction,
} from './lib/gameState';
import { strings } from './lib/i18n';
import {
  clearPersistedEvent,
  loadPersistedEvent,
  savePersistedEvent,
  PERSISTED_EVENT_VERSION,
} from './lib/storage';
import type { EventState, PersistedEvent, UndoAction } from './types';

const defaultPack = builtInGamePacks[0];

interface SavedSession {
  persisted: PersistedEvent;
  pack: PackBundle;
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

  useEffect(() => {
    const persisted = loadPersistedEvent();
    setHasStoredSave(Boolean(persisted));
    if (persisted) {
      const resolvedPack = resolvePersistedPack(persisted);
      if (resolvedPack) {
        setSavedSession({ persisted, pack: resolvedPack });
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

  const gamePack = currentPack.pack;
  const activeChallenge = gamePack.challenges.find((challenge) => challenge.id === eventState.activeChallengeId) ?? null;
  const activeTwist = gamePack.twists.find((twist) => twist.id === eventState.activeTwistId) ?? null;
  const currentDraftTeam = eventState.teams.find((team) => team.id === eventState.currentTurnTeamId);

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
  };

  const resumeSavedGame = () => {
    if (!savedSession) {
      return;
    }

    setCurrentPack(savedSession.pack);
    setUndoAction(savedSession.persisted.undoAction);
    setLandingError(null);
    setEventState(savedSession.persisted.state);
  };

  const updateState = (updater: (current: EventState) => EventState) => {
    setEventState((current) => updater(current));
  };

  const finishGame = () => {
    setEventState((current) => ({
      ...current,
      winner: computeWinner(current.teams),
      screen: 'winner',
    }));
  };

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

  const uploadPack = async (file: File) => {
    try {
      const markdown = await file.text();
      const pack = createPackFromMarkdown(markdown, file.name);
      startNewGame(pack);
    } catch {
      setLandingError(copy.invalidPack);
    }
  };

  const clearSavedGame = () => {
    clearPersistedEvent();
    setSavedSession(null);
    setHasStoredSave(false);
    setUndoAction(null);
    setLandingError(null);
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
          activeChallenge={activeChallenge}
          completedChallengeIds={eventState.completedChallengeIds}
          challenges={gamePack.challenges}
          teams={eventState.teams}
          members={eventState.members}
          activeTwist={activeTwist}
          canUndo={Boolean(undoAction)}
          onSelectChallenge={(challengeId) => updateState((current) => setActiveChallenge(current, challengeId))}
          onAwardPoints={(teamId, memberId, points) =>
            setEventState((current) => {
              const result = awardPoints(current, teamId, memberId, points);
              setUndoAction(result.undoAction);
              return result.state;
            })
          }
          onCompleteChallenge={() =>
            setEventState((current) => {
              const result = completeChallenge(current);
              setUndoAction(result.undoAction);
              return result.state;
            })
          }
          onRevealTwist={() => updateState((current) => revealRandomTwist(current, gamePack.twists))}
          onApplyTwist={() =>
            activeTwist &&
            setEventState((current) => {
              const result = applyTwist(current, activeTwist);
              setUndoAction(result.undoAction);
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
          onAdjustTeamScore={(teamId, delta) =>
            setEventState((current) => {
              const result = applyManualTeamScore(current, teamId, delta);
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
