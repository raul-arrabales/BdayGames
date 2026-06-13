import { useEffect, useMemo, useState } from 'react';
import { DashboardScreen } from './components/DashboardScreen';
import { DraftScreen } from './components/DraftScreen';
import { LandingScreen } from './components/LandingScreen';
import { SetupScreen } from './components/SetupScreen';
import { WinnerScreen } from './components/WinnerScreen';
import { parseGamePack, summarizePack } from './lib/content';
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
import { clearPersistedEvent, loadPersistedEvent, savePersistedEvent } from './lib/storage';
import type { EventState, PersistedEvent, UndoAction } from './types';
import rawPack from './content/fiesta-cumple.es.md?raw';

const gamePack = parseGamePack(rawPack);

function App() {
  const copy = strings.es;
  const packSummary = useMemo(() => summarizePack(gamePack), []);
  const [eventState, setEventState] = useState<EventState>(() => createInitialState(gamePack));
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  useEffect(() => {
    const persisted = loadPersistedEvent();
    setHasSavedGame(Boolean(persisted));
  }, []);

  useEffect(() => {
    if (eventState.screen === 'landing' && !hasSavedGame) {
      return;
    }

    const payload: PersistedEvent = {
      version: eventState.version,
      state: eventState,
      undoAction,
    };
    savePersistedEvent(payload);
    setHasSavedGame(true);
  }, [eventState, undoAction, hasSavedGame]);

  const activeChallenge = gamePack.challenges.find((challenge) => challenge.id === eventState.activeChallengeId) ?? null;
  const activeTwist = gamePack.twists.find((twist) => twist.id === eventState.activeTwistId) ?? null;
  const currentDraftTeam = eventState.teams.find((team) => team.id === eventState.currentTurnTeamId);

  const startFresh = () => {
    clearPersistedEvent();
    setUndoAction(null);
    setEventState({
      ...createInitialState(gamePack),
      screen: 'setup',
    });
    setHasSavedGame(false);
  };

  const resumeSavedGame = () => {
    const persisted = loadPersistedEvent();
    if (persisted) {
      setEventState(persisted.state);
      setUndoAction(persisted.undoAction);
    }
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

  return (
    <main className="app-shell">
      <div className="background-glow background-glow-a" />
      <div className="background-glow background-glow-b" />

      {eventState.screen === 'landing' ? (
        <LandingScreen
          copy={copy}
          hasSavedGame={hasSavedGame}
          pack={gamePack}
          packSummary={packSummary}
          onStart={startFresh}
          onResume={resumeSavedGame}
          onReset={startFresh}
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
        <WinnerScreen copy={copy} winner={eventState.winner} teams={eventState.teams} onRestart={startFresh} />
      ) : null}
    </main>
  );
}

export default App;
