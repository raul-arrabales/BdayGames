import type { Dictionary, } from '../lib/i18n';
import type { GamePack } from '../types';

interface LandingScreenProps {
  copy: Dictionary;
  hasSavedGame: boolean;
  pack: GamePack;
  packSummary: string;
  onStart: () => void;
  onResume: () => void;
  onReset: () => void;
}

export function LandingScreen({
  copy,
  hasSavedGame,
  pack,
  packSummary,
  onStart,
  onResume,
  onReset,
}: LandingScreenProps) {
  return (
    <section className="hero-card">
      <p className="eyebrow">{copy.choosePack}</p>
      <h1>{copy.appTitle}</h1>
      <p className="hero-summary">{pack.title}</p>
      <p className="muted">{pack.summary}</p>
      <p className="muted">{packSummary}</p>

      <div className="cta-row">
        <button className="primary-button" onClick={onStart}>
          {copy.start}
        </button>
        {hasSavedGame ? (
          <>
            <button className="secondary-button" onClick={onResume}>
              {copy.resume}
            </button>
            <button className="ghost-button" onClick={onReset}>
              {copy.reset}
            </button>
          </>
        ) : null}
      </div>

      {hasSavedGame ? <p className="muted">{copy.resetPrompt}</p> : null}
    </section>
  );
}
