import { describe, expect, it } from 'vitest';
import rawPack from '../content/fiesta-cumple.es.md?raw';
import { parseGamePack } from '../lib/content';
import {
  applyTwist,
  assignMemberToTeam,
  awardPoints,
  computeWinner,
  createInitialState,
  createMember,
  createTeam,
  initializeDraft,
  pauseChallengeTimer,
  resetChallengeTimer,
  setActiveChallengeWithDuration,
  setBirthdayPerson,
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

  it('awards points and supports undo', () => {
    const { state } = seededState();
    const member = state.members[0];
    const team = state.teams[0];

    const result = awardPoints(state, team.id, member.id, 100);
    expect(result.state.teams[0].score).toBe(100);
    expect(result.state.members[0].points).toBe(100);

    const reverted = undoLastAction(result.state, result.undoAction);
    expect(reverted.teams[0].score).toBe(0);
    expect(reverted.members[0].points).toBe(0);
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
});
