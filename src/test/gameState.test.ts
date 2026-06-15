import { describe, expect, it } from 'vitest';
import rawPack from '../content/fiesta-cumple.es.md?raw';
import { parseGamePack, resolveChallengeCard } from '../lib/content';
import {
  applyManualAllMembersScore,
  applyTwist,
  applyManualTeamScore,
  applyManualMemberScore,
  clearChallengePreQuestionSelection,
  assignMemberToTeam,
  awardPoints,
  awardTeamPoints,
  computeWinner,
  createInitialState,
  createMember,
  createTeam,
  fillQuickSetupTeams,
  initializeDraft,
  completeChallenge,
  pauseChallengeTimer,
  resetChallengeTimer,
  setActiveChallengeWithDuration,
  setCurrentRoundLeaderTeam,
  setBirthdayPerson,
  selectChallengePreQuestionOption,
  selectChallengePreQuestionTeam,
  startChallengeTimer,
  tickChallengeTimer,
  undoLastAction,
} from '../lib/gameState';

function seededState() {
  const pack = parseGamePack(rawPack);
  let state = createInitialState(pack);
  const firstTeamId = state.teams[0].id;
  const secondTeamId = state.teams[1].id;

  const memberA = createMember('Ana');
  const memberB = createMember('Beto');
  const memberC = createMember('Cris');
  const memberD = createMember('Dani');

  state = {
    ...state,
    members: [
      { ...memberA, teamId: firstTeamId },
      { ...memberB, teamId: secondTeamId },
      memberC,
      memberD,
    ],
    teams: state.teams.map((team, index) => ({
      ...team,
      captainId: index === 0 ? memberA.id : memberB.id,
      memberIds: [index === 0 ? memberA.id : memberB.id],
    })),
  };

  state = setBirthdayPerson(state, memberA.id);
  return { pack, state, memberC, memberD };
}

describe('game state helpers', () => {
  it('starts snake draft with the birthday persons team', () => {
    const { state, memberC } = seededState();
    const started = initializeDraft(state);

    expect(started.currentTurnTeamId).toBe(started.teams[0].id);

    const afterPick = assignMemberToTeam(started, memberC.id, started.teams[0].id);
    expect(afterPick.currentTurnTeamId).toBe(started.teams[1].id);
  });

  it('tracks the current round leader team separately from the draft turn', () => {
    const { state } = seededState();
    const updated = setCurrentRoundLeaderTeam(state, state.teams[1].id);

    expect(updated.currentRoundLeaderTeamId).toBe(state.teams[1].id);
    expect(updated.currentTurnTeamId).toBeNull();
  });

  it('fills a quick test setup with two teams and four members each', () => {
    const { state } = seededState();
    const filled = fillQuickSetupTeams(state);

    expect(filled.teams).toHaveLength(2);
    expect(filled.members).toHaveLength(8);
    expect(filled.birthdayPersonId).toBe(filled.members[0].id);
    expect(filled.teams[0].captainId).toBe(filled.members[0].id);
    expect(filled.teams[1].captainId).toBe(filled.members[4].id);
    expect(filled.teams[0].memberIds).toHaveLength(4);
    expect(filled.teams[1].memberIds).toHaveLength(4);
    expect(filled.members.slice(0, 4).every((member) => member.teamId === filled.teams[0].id)).toBe(true);
    expect(filled.members.slice(4).every((member) => member.teamId === filled.teams[1].id)).toBe(true);
    expect(new Set(filled.members.map((member) => member.name)).size).toBe(8);
  });

  it('awards points and supports undo', () => {
    const { state } = seededState();
    const member = state.members[0];
    const team = state.teams[0];

    const result = awardPoints(state, team.id, member.id, 100);
    expect(result.state.teams[0].score).toBe(100);
    expect(result.state.members[0].points).toBe(100);
    expect(result.state.challengeAwarded).toBe(true);

    const reverted = undoLastAction(result.state, result.undoAction);
    expect(reverted.teams[0].score).toBe(0);
    expect(reverted.members[0].points).toBe(0);
    expect(reverted.challengeAwarded).toBe(false);
  });

  it('awards points to an entire team and supports undo', () => {
    const { state } = seededState();
    const team = state.teams[0];
    const memberA = state.members[0];
    const memberB = createMember('Elia');
    const memberC = createMember('Noa');
    const adjustedState = {
      ...state,
      teams: state.teams.map((entry, index) => (index === 0 ? { ...entry, memberIds: [memberA.id, memberB.id, memberC.id] } : entry)),
      members: [
        { ...memberA, teamId: team.id, points: 10 },
        { ...memberB, teamId: team.id, points: 5 },
        { ...memberC, teamId: team.id, points: 1 },
        ...state.members.slice(3),
      ],
    };

    const result = awardTeamPoints(adjustedState, team.id, 7);
    expect(result.state.teams[0].score).toBe(7);
    expect(result.state.members[0].points).toBe(13);
    expect(result.state.members[1].points).toBe(7);
    expect(result.state.members[2].points).toBe(3);
    expect(result.state.challengeAwarded).toBe(true);

    const reverted = undoLastAction(result.state, result.undoAction);
    expect(reverted.teams[0].score).toBe(0);
    expect(reverted.members[0].points).toBe(10);
    expect(reverted.members[1].points).toBe(5);
    expect(reverted.members[2].points).toBe(1);
    expect(reverted.challengeAwarded).toBe(false);
  });

  it('applies a manual team score correction and supports undo', () => {
    const { state } = seededState();
    const team = state.teams[0];
    const adjustedState = {
      ...state,
      teams: state.teams.map((entry, index) => (index === 0 ? { ...entry, score: 20 } : entry)),
    };

    const result = applyManualTeamScore(adjustedState, team.id, -50);
    expect(result.state.teams[0].score).toBe(-30);

    const reverted = undoLastAction(result.state, result.undoAction);
    expect(reverted.teams[0].score).toBe(20);
  });

  it('applies a manual member score correction and supports undo', () => {
    const { state } = seededState();
    const member = state.members[0];
    const team = state.teams[0];
    const adjustedState = {
      ...state,
      teams: state.teams.map((entry, index) => (index === 0 ? { ...entry, score: 10 } : entry)),
      members: state.members.map((entry, index) => (index === 0 ? { ...entry, points: 8 } : entry)),
    };

    const result = applyManualMemberScore(adjustedState, team.id, member.id, -30);
    expect(result.state.teams[0].score).toBe(-20);
    expect(result.state.members[0].points).toBe(-22);

    const reverted = undoLastAction(result.state, result.undoAction);
    expect(reverted.teams[0].score).toBe(10);
    expect(reverted.members[0].points).toBe(8);
  });

  it('splits a manual correction across all team members and supports undo', () => {
    const { state } = seededState();
    const team = state.teams[0];
    const firstMember = state.members[0];
    const secondMember = createMember('Elia');
    const thirdMember = createMember('Noa');
    const teamMembers = [
      { ...firstMember, teamId: team.id, points: 10 },
      { ...secondMember, teamId: team.id, points: 5 },
      { ...thirdMember, teamId: team.id, points: 1 },
    ];
    const adjustedState = {
      ...state,
      teams: state.teams.map((entry, index) => (index === 0 ? { ...entry, score: 16 } : entry)),
      members: [...teamMembers, ...state.members.slice(3)],
    };

    const result = applyManualAllMembersScore(adjustedState, team.id, 7);
    expect(result.state.teams[0].score).toBe(23);
    expect(result.state.members[0].points).toBe(13);
    expect(result.state.members[1].points).toBe(7);
    expect(result.state.members[2].points).toBe(3);

    const reverted = undoLastAction(result.state, result.undoAction);
    expect(reverted.teams[0].score).toBe(16);
    expect(reverted.members[0].points).toBe(10);
    expect(reverted.members[1].points).toBe(5);
    expect(reverted.members[2].points).toBe(1);
  });

  it('applies twist effects and ranks winners', () => {
    const { pack, state } = seededState();
    const twist = pack.twists.find((entry) => entry.effectType === 'bonus_points');
    expect(twist).toBeDefined();

    const result = applyTwist(state, twist!);
    expect(result.state.teams[0].score).toBeGreaterThan(0);

    const ranking = computeWinner(result.state.teams);
    expect(ranking[0].score).toBe(result.state.teams[0].score);
  });

  it('shifts the round leader twist forward and supports undo', () => {
    const { pack, state } = seededState();
    const twist = pack.twists.find((entry) => entry.effectType === 'shift_round_leader');
    expect(twist).toBeDefined();

    const preparedState = {
      ...state,
      currentRoundLeaderTeamId: state.teams[0].id,
    };

    const result = applyTwist(preparedState, twist!);
    expect(result.state.currentRoundLeaderTeamId).toBe(state.teams[1].id);

    const reverted = undoLastAction(result.state, result.undoAction);
    expect(reverted.currentRoundLeaderTeamId).toBe(state.teams[0].id);
  });

  it('manages the challenge timer lifecycle', () => {
    const { pack, state } = seededState();
    const challenge = pack.challenges.find((entry) => entry.time === 45);
    expect(challenge).toBeDefined();

    const activated = setActiveChallengeWithDuration(state, challenge!.id, challenge!.time);
    expect(activated.challengeTimerDurationSeconds).toBe(45);
    expect(activated.challengeTimerSecondsLeft).toBe(45);
    expect(activated.challengeTimerRunning).toBe(false);

    const running = startChallengeTimer(activated);
    expect(running.challengeTimerRunning).toBe(true);

    const ticked = tickChallengeTimer(running);
    expect(ticked.challengeTimerSecondsLeft).toBe(44);

    const paused = pauseChallengeTimer(ticked);
    expect(paused.challengeTimerRunning).toBe(false);

    const reset = resetChallengeTimer(paused);
    expect(reset.challengeTimerSecondsLeft).toBe(45);
    expect(reset.challengeTimerRunning).toBe(false);
  });

  it('parses trivia multiple choice options from the pack', () => {
    const { pack } = seededState();
    const triviaChallenge = pack.challenges.find((challenge) => challenge.preQuestion);
    const resolvedChallenge = triviaChallenge ? resolveChallengeCard(triviaChallenge, 0) : null;

    expect(triviaChallenge?.preQuestion?.options).toHaveLength(2);
    expect(resolvedChallenge?.prompt).toBe('Que planeta se conoce como el planeta rojo?');
    expect(resolvedChallenge?.time).toBe(60);
  });

  it('resolves pre-question challenge branches and preserves undo state', () => {
    const { pack, state } = seededState();
    const challenge = pack.challenges[0];
    expect(challenge.preQuestion).toBeDefined();

    const selectedTeamState = selectChallengePreQuestionTeam(
      setActiveChallengeWithDuration(state, challenge.id, challenge.time),
      state.teams[0].id,
    );
    expect(selectedTeamState.activeChallengeChoiceTeamId).toBe(state.teams[0].id);

    const clearedState = clearChallengePreQuestionSelection(selectedTeamState);
    expect(clearedState.activeChallengeChoiceTeamId).toBeNull();
    expect(clearedState.activeChallengeChoiceOptionIndex).toBeNull();
    expect(clearedState.activeChallengeSolutionRevealed).toBe(false);

    const resolvedState = selectChallengePreQuestionOption(selectedTeamState, 0, challenge.time);
    expect(resolvedState.activeChallengeChoiceOptionIndex).toBe(0);
    expect(resolvedState.activeChallengeSolutionRevealed).toBe(false);

    const resolvedChallenge = resolveChallengeCard(challenge, resolvedState.activeChallengeChoiceOptionIndex);
    expect(resolvedChallenge.prompt).toContain('planeta');

    const finished = {
      ...resolvedState,
      activeChallengeChoiceTeamId: state.teams[1].id,
      activeChallengeChoiceOptionIndex: 1,
      currentRoundLeaderTeamId: state.teams[0].id,
    };
    const completion = completeChallenge(finished);
    expect(completion.state.activeChallengeId).toBeNull();
    expect(completion.state.currentRoundLeaderTeamId).toBe(state.teams[1].id);
    const reverted = undoLastAction(completion.state, completion.undoAction);
    expect(reverted.activeChallengeId).toBe(challenge.id);
    expect(reverted.activeChallengeChoiceTeamId).toBe(state.teams[1].id);
    expect(reverted.activeChallengeChoiceOptionIndex).toBe(1);
    expect(reverted.currentRoundLeaderTeamId).toBe(state.teams[0].id);
  });
});
