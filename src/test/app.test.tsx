import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../App';
import { parseGamePack } from '../lib/content';
import { createInitialState } from '../lib/gameState';
import { PERSISTED_EVENT_VERSION, STORAGE_KEY } from '../lib/storage';
import rawPack from '../content/fiesta-cumple.es.md?raw';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe('App', () => {
  it('shows the landing chooser and can start from a built-in pack', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Bday Games' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fiesta Familiar de Cumpleanos/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Fiesta Familiar de Cumpleanos/ }));

    expect(await screen.findByRole('heading', { name: 'Configuracion de equipos' })).toBeInTheDocument();
  });

  it('offers resume for a saved game and restores the saved flow', async () => {
    const user = userEvent.setup();
    const pack = parseGamePack(rawPack);
    const state = {
      ...createInitialState(pack),
      screen: 'setup' as const,
    };
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: PERSISTED_EVENT_VERSION,
        state,
        undoAction: null,
        packMarkdown: rawPack,
        packFileName: 'fiesta-cumple.es.md',
      }),
    );

    render(<App />);

    expect(screen.getByRole('button', { name: 'Continuar partida' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continuar partida' }));

    expect(await screen.findByRole('heading', { name: 'Configuracion de equipos' })).toBeInTheDocument();
  });
});
