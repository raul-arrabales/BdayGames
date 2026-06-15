export type LocaleCode = 'es';

export type Screen =
  | 'landing'
  | 'setup'
  | 'draft'
  | 'dashboard'
  | 'winner';

export type ChallengeCategory = 'trivia' | 'skill' | 'creative' | 'duel' | 'chaos';

export interface ChallengeVariant {
  title?: string;
  prompt: string;
  rules?: string[];
  points?: number;
  time?: number;
  multipleChoice?: ChallengeMultipleChoice;
}

export interface ChallengeMultipleChoice {
  options: string[];
  answerIndex: number;
  explanation?: string;
}

export interface ChallengePreQuestionOption {
  label: string;
  challenge: ChallengeVariant;
}

export interface ChallengePreQuestion {
  prompt: string;
  options: ChallengePreQuestionOption[];
}

export type TwistEffectType =
  | 'steal_member'
  | 'bonus_points'
  | 'swap_scores'
  | 'double_round'
  | 'skip_turn'
  | 'shift_round_leader';

export interface ChallengeCard {
  id: string;
  category: ChallengeCategory;
  title: string;
  prompt: string;
  rules: string[];
  points: number;
  time: number;
  multipleChoice?: ChallengeMultipleChoice;
  preQuestion?: ChallengePreQuestion;
}

export interface TwistCard {
  id: string;
  title: string;
  description: string;
  effectType: TwistEffectType;
  value?: number;
}

export interface GamePack {
  id: string;
  title: string;
  locale: LocaleCode;
  summary?: string;
  rules: string[];
  challenges: ChallengeCard[];
  twists: TwistCard[];
}

export interface Member {
  id: string;
  name: string;
  teamId: string | null;
  points: number;
  isBirthdayPerson: boolean;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  captainId: string | null;
  memberIds: string[];
  score: number;
  skippedTurns: number;
}

export interface DraftPick {
  teamId: string;
  memberId: string;
  round: number;
  orderIndex: number;
}

export interface RevealedTwist {
  cardId: string;
  applied: boolean;
  appliedAtRound: number;
}

export interface WinnerEntry {
  teamId: string;
  score: number;
}

export interface EventState {
  version: number;
  gamePackId: string;
  locale: LocaleCode;
  screen: Screen;
  teams: Team[];
  members: Member[];
  birthdayPersonId: string | null;
  draftOrder: string[];
  draftRound: number;
  draftDirection: 'forward' | 'reverse';
  currentTurnTeamId: string | null;
  currentRoundLeaderTeamId: string | null;
  picks: DraftPick[];
  currentRound: number;
  activeChallengeId: string | null;
  activeChallengeChoiceTeamId: string | null;
  activeChallengeChoiceOptionIndex: number | null;
  activeChallengeSolutionRevealed: boolean;
  challengeAwarded: boolean;
  challengeTimerDurationSeconds: number;
  challengeTimerSecondsLeft: number;
  challengeTimerRunning: boolean;
  completedChallengeIds: string[];
  revealedTwists: RevealedTwist[];
  activeTwistId: string | null;
  activeDoubleRound: boolean;
  winner: WinnerEntry[] | null;
  lastUpdatedAt: string;
}

export type UndoAction =
  | {
      type: 'award_points';
      memberId: string;
      teamId: string;
      points: number;
      previousDoubleRound?: boolean;
    }
  | {
      type: 'award_team_points';
      teamId: string;
      points: number;
      previousTeamScore: number;
      previousMemberScores: Array<{ memberId: string; points: number }>;
      previousDoubleRound?: boolean;
    }
  | {
      type: 'manual_score_adjustment';
      teamId: string;
      points?: number;
      previousTeamScore?: number;
      memberId?: string;
      previousMemberScore?: number;
      previousMemberScores?: Array<{ memberId: string; points: number }>;
    }
  | {
      type: 'complete_challenge';
      challengeId: string;
      previousChoiceTeamId: string | null;
      previousChoiceOptionIndex: number | null;
      previousSolutionRevealed: boolean;
      previousRoundLeaderTeamId: string | null;
    }
  | {
    type: 'apply_twist';
    previousState: Pick<
      EventState,
      'teams' | 'members' | 'revealedTwists' | 'activeDoubleRound' | 'activeTwistId' | 'currentRoundLeaderTeamId'
    >;
  };

export interface PersistedEvent {
  version: number;
  state: EventState;
  undoAction: UndoAction | null;
  packMarkdown?: string;
  packFileName?: string;
}
