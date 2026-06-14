import type {
  EventState,
  GamePack,
  Member,
  Team,
  UndoAction,
  WinnerEntry,
  TwistCard,
} from '../types';

export const APP_STATE_VERSION = 3;
export const DEFAULT_CHALLENGE_TIME_SECONDS = 90;

const QUICK_SETUP_MEMBER_NAMES = [
  'Luna',
  'Mateo',
  'Noa',
  'Leo',
  'Mia',
  'Iker',
  'Sara',
  'Dani',
  'Nora',
  'Pablo',
  'Elia',
  'Bruno',
  'Clara',
  'Tomas',
  'Vera',
  'Rita',
];

function now(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createInitialState(gamePack: GamePack): EventState {
  return {
    version: APP_STATE_VERSION,
    gamePackId: gamePack.id,
    locale: gamePack.locale,
    screen: 'landing',
    teams: [
      createTeam('Equipo Sol', '#ff6b35'),
      createTeam('Equipo Fiesta', '#00b3ff'),
    ],
    members: [],
    birthdayPersonId: null,
    draftOrder: [],
    draftRound: 1,
    draftDirection: 'forward',
    currentTurnTeamId: null,
    picks: [],
    currentRound: 1,
    activeChallengeId: null,
    challengeAwarded: false,
    challengeTimerDurationSeconds: DEFAULT_CHALLENGE_TIME_SECONDS,
    challengeTimerSecondsLeft: DEFAULT_CHALLENGE_TIME_SECONDS,
    challengeTimerRunning: false,
    completedChallengeIds: [],
    revealedTwists: [],
    activeTwistId: null,
    activeDoubleRound: false,
    winner: null,
    lastUpdatedAt: now(),
  };
}

export function createTeam(name = 'Nuevo equipo', color = '#ff6b35'): Team {
  return {
    id: createId('team'),
    name,
    color,
    captainId: null,
    memberIds: [],
    score: 0,
    skippedTurns: 0,
  };
}

export function createMember(name = ''): Member {
  return {
    id: createId('member'),
    name,
    teamId: null,
    points: 0,
    isBirthdayPerson: false,
  };
}

function pickRandomMemberNames(count: number): string[] {
  const pool = [...QUICK_SETUP_MEMBER_NAMES];
  const picked: string[] = [];

  while (picked.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    const [name] = pool.splice(index, 1);
    picked.push(name);
  }

  while (picked.length < count) {
    picked.push(`Participante ${picked.length + 1}`);
  }

  return picked;
}

export function fillQuickSetupTeams(state: EventState): EventState {
  const [firstTeamSeed, secondTeamSeed] = state.teams;
  const firstTeam = firstTeamSeed ?? createTeam('Equipo Sol', '#ff6b35');
  const secondTeam = secondTeamSeed ?? createTeam('Equipo Fiesta', '#00b3ff');
  const memberNames = pickRandomMemberNames(8);

  const members = memberNames.map((name, index) => ({
    ...createMember(name),
    teamId: index < 4 ? firstTeam.id : secondTeam.id,
    isBirthdayPerson: index === 0,
  }));

  const firstTeamMembers = members.slice(0, 4).map((member) => member.id);
  const secondTeamMembers = members.slice(4, 8).map((member) => member.id);

  return {
    ...state,
    screen: 'dashboard',
    teams: [
      {
        ...firstTeam,
        captainId: members[0].id,
        memberIds: firstTeamMembers,
        score: 0,
        skippedTurns: 0,
      },
      {
        ...secondTeam,
        captainId: members[4].id,
        memberIds: secondTeamMembers,
        score: 0,
        skippedTurns: 0,
      },
    ],
    members,
    birthdayPersonId: members[0].id,
    draftOrder: [],
    draftRound: 1,
    draftDirection: 'forward',
    currentTurnTeamId: null,
    picks: [],
    currentRound: 1,
    activeChallengeId: null,
    challengeAwarded: false,
    challengeTimerDurationSeconds: DEFAULT_CHALLENGE_TIME_SECONDS,
    challengeTimerSecondsLeft: DEFAULT_CHALLENGE_TIME_SECONDS,
    challengeTimerRunning: false,
    completedChallengeIds: [],
    revealedTwists: [],
    activeTwistId: null,
    activeDoubleRound: false,
    winner: null,
    lastUpdatedAt: now(),
  };
}

export function canStartDraft(state: EventState): boolean {
  return (
    state.teams.length >= 2 &&
    state.members.length >= state.teams.length &&
    state.birthdayPersonId !== null &&
    state.teams.every((team) => team.captainId !== null)
  );
}

export function initializeDraft(state: EventState): EventState {
  if (!canStartDraft(state)) {
    return state;
  }

  const birthdayPerson = state.members.find((member) => member.id === state.birthdayPersonId);
  const birthdayTeamId = birthdayPerson?.teamId;
  const order = birthdayTeamId
    ? [birthdayTeamId, ...state.teams.map((team) => team.id).filter((id) => id !== birthdayTeamId)]
    : state.teams.map((team) => team.id);

  return {
    ...state,
    draftOrder: order,
    currentTurnTeamId: order[0] ?? null,
    screen: 'draft',
    lastUpdatedAt: now(),
  };
}

export function getDraftSequence(state: EventState): string[] {
  return state.draftDirection === 'forward' ? state.draftOrder : [...state.draftOrder].reverse();
}

export function getUnassignedMembers(state: EventState): Member[] {
  return state.members.filter((member) => member.teamId === null);
}

export function assignMemberToTeam(state: EventState, memberId: string, teamId: string): EventState {
  const member = state.members.find((entry) => entry.id === memberId);
  if (!member || member.teamId) {
    return state;
  }

  const draftSequence = getDraftSequence(state);
  const currentTurnTeamId = state.currentTurnTeamId ?? draftSequence[0];

  if (currentTurnTeamId !== teamId) {
    return state;
  }

  const members = state.members.map((entry) =>
    entry.id === memberId ? { ...entry, teamId } : entry,
  );
  const teams = state.teams.map((team) =>
    team.id === teamId ? { ...team, memberIds: [...team.memberIds, memberId] } : team,
  );

  const currentIndex = draftSequence.findIndex((id) => id === teamId);
  const nextIndex = currentIndex + 1;
  const hasNext = nextIndex < draftSequence.length;
  const nextTurnTeamId = hasNext ? draftSequence[nextIndex] : getDraftSequence({
    ...state,
    draftDirection: state.draftDirection === 'forward' ? 'reverse' : 'forward',
  })[0];
  const unassignedAfterPick = members.filter((entry) => entry.teamId === null).length;

  return {
    ...state,
    members,
    teams,
    picks: [
      ...state.picks,
      {
        teamId,
        memberId,
        round: state.draftRound,
        orderIndex: currentIndex,
      },
    ],
    currentTurnTeamId: unassignedAfterPick === 0 ? null : nextTurnTeamId ?? null,
    draftRound: hasNext ? state.draftRound : state.draftRound + 1,
    draftDirection: hasNext ? state.draftDirection : state.draftDirection === 'forward' ? 'reverse' : 'forward',
    screen: unassignedAfterPick === 0 ? 'dashboard' : state.screen,
    lastUpdatedAt: now(),
  };
}

export function setBirthdayPerson(state: EventState, memberId: string): EventState {
  return {
    ...state,
    birthdayPersonId: memberId,
    members: state.members.map((member) => ({
      ...member,
      isBirthdayPerson: member.id === memberId,
    })),
    lastUpdatedAt: now(),
  };
}

export function awardPoints(
  state: EventState,
  teamId: string,
  memberId: string,
  points: number,
): { state: EventState; undoAction: UndoAction | null } {
  if (state.challengeAwarded) {
    return {
      state,
      undoAction: null,
    };
  }

  const multiplier = state.activeDoubleRound ? 2 : 1;
  const finalPoints = points * multiplier;

  const teams = state.teams.map((team) =>
    team.id === teamId ? { ...team, score: team.score + finalPoints } : team,
  );
  const members = state.members.map((member) =>
    member.id === memberId ? { ...member, points: member.points + finalPoints } : member,
  );

  return {
    state: {
      ...state,
      teams,
      members,
      activeDoubleRound: false,
      challengeAwarded: true,
      lastUpdatedAt: now(),
    },
    undoAction: {
      type: 'award_points',
      memberId,
      teamId,
      points: finalPoints,
      previousDoubleRound: state.activeDoubleRound,
    },
  };
}

function distributePointsAcrossMembers(points: number, memberCount: number): number[] {
  const baseDelta = Math.trunc(points / memberCount);
  let remainder = points - baseDelta * memberCount;

  return Array.from({ length: memberCount }, () => {
    const extra = remainder === 0 ? 0 : remainder > 0 ? 1 : -1;
    if (remainder !== 0) {
      remainder += remainder > 0 ? -1 : 1;
    }

    return baseDelta + extra;
  });
}

export function awardTeamPoints(
  state: EventState,
  teamId: string,
  points: number,
): { state: EventState; undoAction: UndoAction | null } {
  if (state.challengeAwarded) {
    return {
      state,
      undoAction: null,
    };
  }

  const multiplier = state.activeDoubleRound ? 2 : 1;
  const finalPoints = points * multiplier;
  const teamMembers = state.members.filter((member) => member.teamId === teamId);
  const targetTeam = state.teams.find((team) => team.id === teamId);
  const previousTeamScore = targetTeam?.score ?? 0;
  const previousMemberScores = teamMembers.map((member) => ({ memberId: member.id, points: member.points }));

  if (!targetTeam || teamMembers.length === 0) {
    return {
      state,
      undoAction: null,
    };
  }

  const memberAdjustments = distributePointsAcrossMembers(finalPoints, teamMembers.length);

  return {
    state: {
      ...state,
      teams: state.teams.map((team) =>
        team.id === teamId ? { ...team, score: team.score + finalPoints } : team,
      ),
      members: state.members.map((member) => {
        const memberIndex = teamMembers.findIndex((entry) => entry.id === member.id);
        const delta = memberIndex >= 0 ? memberAdjustments[memberIndex] : null;
        return typeof delta === 'number' ? { ...member, points: member.points + delta } : member;
      }),
      challengeAwarded: true,
      activeDoubleRound: false,
      lastUpdatedAt: now(),
    },
    undoAction: {
      type: 'award_team_points',
      teamId,
      points: finalPoints,
      previousTeamScore,
      previousMemberScores,
      previousDoubleRound: state.activeDoubleRound,
    },
  };
}

export function applyManualTeamScore(
  state: EventState,
  teamId: string,
  points: number,
): { state: EventState; undoAction: UndoAction } {
  const targetTeam = state.teams.find((team) => team.id === teamId);
  const previousTeamScore = targetTeam?.score ?? 0;

  return {
    state: {
      ...state,
      teams: state.teams.map((team) =>
        team.id === teamId ? { ...team, score: team.score + points } : team,
      ),
      lastUpdatedAt: now(),
    },
    undoAction: {
      type: 'manual_score_adjustment',
      teamId,
      points,
      previousTeamScore,
    },
  };
}

export function applyManualMemberScore(
  state: EventState,
  teamId: string,
  memberId: string,
  points: number,
): { state: EventState; undoAction: UndoAction } {
  const targetTeam = state.teams.find((team) => team.id === teamId);
  const targetMember = state.members.find((member) => member.id === memberId);
  const previousTeamScore = targetTeam?.score ?? 0;
  const previousMemberScore = targetMember?.points ?? 0;

  return {
    state: {
      ...state,
      teams: state.teams.map((team) =>
        team.id === teamId ? { ...team, score: team.score + points } : team,
      ),
      members: state.members.map((member) =>
        member.id === memberId ? { ...member, points: member.points + points } : member,
      ),
      lastUpdatedAt: now(),
    },
    undoAction: {
      type: 'manual_score_adjustment',
      teamId,
      memberId,
      points,
      previousTeamScore,
      previousMemberScore,
    },
  };
}

export function applyManualAllMembersScore(
  state: EventState,
  teamId: string,
  points: number,
): { state: EventState; undoAction: UndoAction } {
  const teamMembers = state.members.filter((member) => member.teamId === teamId);
  const previousTeam = state.teams.find((team) => team.id === teamId);
  const previousMemberScores = teamMembers.map((member) => ({ memberId: member.id, points: member.points }));
  const memberCount = teamMembers.length;

  if (!previousTeam || memberCount === 0) {
    return {
      state,
      undoAction: {
        type: 'manual_score_adjustment',
        teamId,
        points,
      },
    };
  }

  const memberDeltas = distributePointsAcrossMembers(points, memberCount);
  const memberAdjustments = teamMembers.map((member, index) => ({
    memberId: member.id,
    delta: memberDeltas[index],
  }));

  return {
    state: {
      ...state,
      teams: state.teams.map((team) =>
        team.id === teamId ? { ...team, score: team.score + points } : team,
      ),
      members: state.members.map((member) => {
        const adjustment = memberAdjustments.find((entry) => entry.memberId === member.id);
        return adjustment ? { ...member, points: member.points + adjustment.delta } : member;
      }),
      lastUpdatedAt: now(),
    },
    undoAction: {
      type: 'manual_score_adjustment',
      teamId,
      points,
      previousTeamScore: previousTeam.score,
      previousMemberScores,
    },
  };
}

export function setActiveChallenge(state: EventState, challengeId: string): EventState {
  return setActiveChallengeWithDuration(state, challengeId, DEFAULT_CHALLENGE_TIME_SECONDS);
}

export function setActiveChallengeWithDuration(
  state: EventState,
  challengeId: string,
  durationSeconds: number,
): EventState {
  const normalizedDuration = Math.max(1, Math.floor(durationSeconds));

  return {
    ...state,
    activeChallengeId: challengeId,
    challengeAwarded: false,
    challengeTimerDurationSeconds: normalizedDuration,
    challengeTimerSecondsLeft: normalizedDuration,
    challengeTimerRunning: false,
    screen: 'dashboard',
    lastUpdatedAt: now(),
  };
}

export function startChallengeTimer(state: EventState): EventState {
  if (!state.activeChallengeId || state.challengeTimerSecondsLeft <= 0) {
    return state;
  }

  return {
    ...state,
    challengeTimerRunning: true,
    lastUpdatedAt: now(),
  };
}

export function pauseChallengeTimer(state: EventState): EventState {
  if (!state.activeChallengeId || !state.challengeTimerRunning) {
    return state;
  }

  return {
    ...state,
    challengeTimerRunning: false,
    lastUpdatedAt: now(),
  };
}

export function resetChallengeTimer(state: EventState): EventState {
  if (!state.activeChallengeId) {
    return state;
  }

  return {
    ...state,
    challengeTimerSecondsLeft: state.challengeTimerDurationSeconds,
    challengeTimerRunning: false,
    lastUpdatedAt: now(),
  };
}

export function tickChallengeTimer(state: EventState): EventState {
  if (!state.activeChallengeId || !state.challengeTimerRunning || state.challengeTimerSecondsLeft <= 0) {
    return state;
  }

  const secondsLeft = Math.max(0, state.challengeTimerSecondsLeft - 1);

  return {
    ...state,
    challengeTimerSecondsLeft: secondsLeft,
    challengeTimerRunning: secondsLeft > 0,
    lastUpdatedAt: now(),
  };
}

export function completeChallenge(
  state: EventState,
): { state: EventState; undoAction: UndoAction | null } {
  if (!state.activeChallengeId || state.completedChallengeIds.includes(state.activeChallengeId)) {
    return { state, undoAction: null };
  }

  return {
    state: {
      ...state,
      completedChallengeIds: [...state.completedChallengeIds, state.activeChallengeId],
      activeChallengeId: null,
      challengeTimerRunning: false,
      currentRound: state.currentRound + 1,
      lastUpdatedAt: now(),
    },
    undoAction: {
      type: 'complete_challenge',
      challengeId: state.activeChallengeId,
    },
  };
}

export function revealRandomTwist(state: EventState, twists: TwistCard[]): EventState {
  const remaining = twists.filter(
    (twist) => !state.revealedTwists.some((revealed) => revealed.cardId === twist.id),
  );
  if (remaining.length === 0) {
    return state;
  }
  const card = remaining[Math.floor(Math.random() * remaining.length)];
  return {
    ...state,
    activeTwistId: card.id,
    revealedTwists: [
      ...state.revealedTwists,
      { cardId: card.id, applied: false, appliedAtRound: state.currentRound },
    ],
    lastUpdatedAt: now(),
  };
}

export function applyTwist(
  state: EventState,
  twist: TwistCard,
): { state: EventState; undoAction: UndoAction } {
  const snapshot: UndoAction = {
    type: 'apply_twist',
    previousState: {
      teams: state.teams,
      members: state.members,
      revealedTwists: state.revealedTwists,
      activeDoubleRound: state.activeDoubleRound,
      activeTwistId: state.activeTwistId,
    },
  };

  let nextState: EventState = {
    ...state,
    revealedTwists: state.revealedTwists.map((entry) =>
      entry.cardId === twist.id ? { ...entry, applied: true } : entry,
    ),
    activeTwistId: null,
  };

  switch (twist.effectType) {
    case 'bonus_points': {
      const targetTeam = nextState.teams[0];
      if (targetTeam) {
        nextState = {
          ...nextState,
          teams: nextState.teams.map((team) =>
            team.id === targetTeam.id
              ? { ...team, score: team.score + (twist.value ?? 100) }
              : team,
          ),
        };
      }
      break;
    }
    case 'swap_scores': {
      if (nextState.teams.length >= 2) {
        const [first, second, ...rest] = nextState.teams;
        nextState = {
          ...nextState,
          teams: [
            { ...first, score: second.score },
            { ...second, score: first.score },
            ...rest,
          ],
        };
      }
      break;
    }
    case 'double_round': {
      nextState = { ...nextState, activeDoubleRound: true };
      break;
    }
    case 'skip_turn': {
      const targetTeam = nextState.teams[0];
      if (targetTeam) {
        nextState = {
          ...nextState,
          teams: nextState.teams.map((team) =>
            team.id === targetTeam.id
              ? { ...team, skippedTurns: team.skippedTurns + 1 }
              : team,
          ),
        };
      }
      break;
    }
    case 'steal_member': {
      const donor = nextState.teams.find((team) => team.memberIds.length > 1);
      const receiver = nextState.teams.find((team) => team.id !== donor?.id);
      const stolenMemberId = donor?.memberIds.at(-1);
      if (donor && receiver && stolenMemberId) {
        nextState = {
          ...nextState,
          teams: nextState.teams.map((team) => {
            if (team.id === donor.id) {
              return { ...team, memberIds: team.memberIds.filter((id) => id !== stolenMemberId) };
            }
            if (team.id === receiver.id) {
              return { ...team, memberIds: [...team.memberIds, stolenMemberId] };
            }
            return team;
          }),
          members: nextState.members.map((member) =>
            member.id === stolenMemberId ? { ...member, teamId: receiver.id } : member,
          ),
        };
      }
      break;
    }
  }

  return {
    state: {
      ...nextState,
      lastUpdatedAt: now(),
    },
    undoAction: snapshot,
  };
}

export function undoLastAction(state: EventState, undoAction: UndoAction | null): EventState {
  if (!undoAction) {
    return state;
  }

  switch (undoAction.type) {
    case 'award_points':
      return {
        ...state,
        teams: state.teams.map((team) =>
          team.id === undoAction.teamId ? { ...team, score: Math.max(0, team.score - undoAction.points) } : team,
        ),
        members: state.members.map((member) =>
          member.id === undoAction.memberId
            ? { ...member, points: Math.max(0, member.points - undoAction.points) }
            : member,
        ),
        activeDoubleRound:
          typeof undoAction.previousDoubleRound === 'boolean'
            ? undoAction.previousDoubleRound
            : state.activeDoubleRound,
        challengeAwarded: false,
        lastUpdatedAt: now(),
      };
    case 'award_team_points':
      return {
        ...state,
        teams: state.teams.map((team) =>
          team.id === undoAction.teamId
            ? {
                ...team,
                score:
                  typeof undoAction.previousTeamScore === 'number'
                    ? undoAction.previousTeamScore
                    : Math.max(0, team.score - undoAction.points),
              }
            : team,
        ),
        members: state.members.map((member) => {
          const snapshot = undoAction.previousMemberScores.find((entry) => entry.memberId === member.id);
          return snapshot ? { ...member, points: snapshot.points } : member;
        }),
        activeDoubleRound:
          typeof undoAction.previousDoubleRound === 'boolean'
            ? undoAction.previousDoubleRound
            : state.activeDoubleRound,
        challengeAwarded: false,
        lastUpdatedAt: now(),
      };
    case 'manual_score_adjustment':
      return {
        ...state,
        teams: state.teams.map((team) =>
          team.id === undoAction.teamId
            ? {
                ...team,
                score:
                  typeof undoAction.previousTeamScore === 'number'
                    ? undoAction.previousTeamScore
                    : Math.max(0, team.score - (undoAction.points ?? 0)),
              }
            : team,
        ),
        members: undoAction.memberId
          ? state.members.map((member) =>
              member.id === undoAction.memberId
                ? {
                    ...member,
                    points:
                      typeof undoAction.previousMemberScore === 'number'
                        ? undoAction.previousMemberScore
                        : Math.max(0, member.points - (undoAction.points ?? 0)),
                  }
                : member,
            )
          : undoAction.previousMemberScores
            ? state.members.map((member) => {
                const snapshot = undoAction.previousMemberScores?.find((entry) => entry.memberId === member.id);
                return snapshot ? { ...member, points: snapshot.points } : member;
              })
          : state.members,
        lastUpdatedAt: now(),
      };
    case 'complete_challenge':
      return {
        ...state,
        completedChallengeIds: state.completedChallengeIds.filter((id) => id !== undoAction.challengeId),
        activeChallengeId: undoAction.challengeId,
        challengeTimerSecondsLeft: state.challengeTimerDurationSeconds,
        challengeTimerRunning: false,
        currentRound: Math.max(1, state.currentRound - 1),
        lastUpdatedAt: now(),
      };
    case 'apply_twist':
      return {
        ...state,
        ...undoAction.previousState,
        lastUpdatedAt: now(),
      };
  }
}

export function computeWinner(teams: Team[]): WinnerEntry[] {
  return [...teams]
    .sort((a, b) => b.score - a.score)
    .map((team) => ({ teamId: team.id, score: team.score }));
}
