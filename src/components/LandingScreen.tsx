import type { ChangeEvent } from 'react';
import type { Dictionary } from '../lib/i18n';
import type { PackBundle } from '../lib/gamePacks';

interface LandingScreenProps {
  copy: Dictionary;
  builtInPacks: PackBundle[];
  hasSavedGame: boolean;
  landingError: string | null;
  savedPack: PackBundle | null;
  onChoosePack: (packId: string) => void;
  onUploadPack: (file: File) => void | Promise<void>;
  onResume: () => void;
  onReset: () => void;
}

export function LandingScreen({
  copy,
  builtInPacks,
  hasSavedGame,
  landingError,
  savedPack,
  onChoosePack,
  onUploadPack,
  onResume,
  onReset,
}: LandingScreenProps) {
  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    await onUploadPack(file);
  };

  return (
    <section className="hero-card landing-shell">
      <div className="landing-header">
        <p className="eyebrow">{copy.chooseGame}</p>
        <h1>{copy.appTitle}</h1>
        <p className="hero-summary">{copy.resumeSavedGame}</p>
        <p className="muted">{copy.savedGameInfo}</p>
      </div>

      {landingError ? <p className="error-banner">{landingError}</p> : null}

      <div className="landing-grid">
        <article className="landing-panel resume-panel">
          <div className="panel-header">
            <h2>{copy.resumeSavedGame}</h2>
            {hasSavedGame ? (
              <button className="ghost-button" onClick={onReset}>
                {copy.clearSavedGame}
              </button>
            ) : null}
          </div>

          {savedPack ? (
            <div className="resume-card">
              <p className="badge">{savedPack.fileName}</p>
              <h3>{savedPack.pack.title}</h3>
              <p className="muted">{savedPack.pack.summary}</p>
              <p className="muted">{savedPack.summary}</p>
              <button className="primary-button" onClick={onResume}>
                {copy.resume}
              </button>
            </div>
          ) : hasSavedGame ? (
            <p className="muted">{copy.missingPack}</p>
          ) : (
            <p className="muted">{copy.noSavedGame}</p>
          )}
        </article>

        <article className="landing-panel chooser-panel">
          <div className="panel-header">
            <h2>{copy.builtInPacks}</h2>
            <span className="badge">{builtInPacks.length}</span>
          </div>

          <div className="pack-list">
            {builtInPacks.map((bundle) => (
              <button key={bundle.pack.id} className="pack-card" onClick={() => onChoosePack(bundle.pack.id)}>
                <div className="pack-card-top">
                  <h3>{bundle.pack.title}</h3>
                  <span className="badge">{bundle.fileName}</span>
                </div>
                <p className="muted">{bundle.pack.summary}</p>
                <p className="muted">{bundle.summary}</p>
                <div className="pack-card-action">{copy.startPack}</div>
              </button>
            ))}
          </div>
        </article>

        <article className="landing-panel upload-panel">
          <div className="panel-header">
            <h2>{copy.uploadPack}</h2>
          </div>
          <p className="muted">{copy.uploadHint}</p>
          <input className="upload-input" type="file" accept=".md,text/markdown" onChange={handleUpload} />
        </article>
      </div>
    </section>
  );
}
