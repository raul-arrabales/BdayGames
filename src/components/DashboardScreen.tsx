import { useEffect, useState } from 'react';
import type { Dictionary } from '../lib/i18n';
import type { ChallengeCard, Member, Team, TwistCard } from '../types';
import { ChallengeLibrary } from './ChallengeLibrary';
import { Scoreboard } from './Scoreboard';

interface DashboardScreenProps {
  copy: Dictionary;
  round: number;
  activeChallenge: ChallengeCard | null;
  completedChallengeIds: string[];
  challenges: ChallengeCard[];
  teams: Team[];
  members: Member[];
  activeTwist: TwistCard | null;
  canUndo: boolean;
  onSelectChallenge: (challengeId: string) => void;
  onAwardPoints: (teamId: string, memberId: string, points: number) => void;
  onCompleteChallenge: () => void;
  onRevealTwist: () => void;
  onApplyTwist: () => void;
  onUndo: () => void;
  onAdjustTeamScore: (teamId: string, delta: number) => void;
  onFinish: () => void;
}

export function DashboardScreen({
  copy,
  round,
  activeChallenge,
  completedChallengeIds,
  challenges,
  teams,
  members,
  activeTwist,
  canUndo,
  onSelectChallenge,
  onAwardPoints,
  onCompleteChallenge,
  onRevealTwist,
  onApplyTwist,
  onUndo,
  onAdjustTeamScore,
  onFinish,
}: DashboardScreenProps) {
  const [secondsLeft, setSecondsLeft] = useState(90);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => (value > 0 ? value - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setSecondsLeft(90);
  }, [activeChallenge?.id]);

  return (
    <div className="dashboard-layout">
      <section className="panel spotlight">
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
            <div className="timer-ring">
              <span>{secondsLeft}s</span>
              <small>{copy.timer}</small>
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
      <Scoreboard copy={copy} teams={teams} members={members} onAdjustTeamScore={onAdjustTeamScore} />
    </div>
  );
}
