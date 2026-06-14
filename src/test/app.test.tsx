import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../App';
import { parseGamePack } from '../lib/content';
import { createInitialState, createMember } from '../lib/gameState';
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

  it('can auto-fill a quick two-team setup from the setup screen', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Fiesta Familiar de Cumpleanos/ }));
    expect(await screen.findByRole('heading', { name: 'Configuracion de equipos' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Rellenar prueba 2x4' }));

    expect(await screen.findByRole('heading', { name: 'Panel del juego' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ningun reto activo' })).toBeInTheDocument();
    expect(document.querySelectorAll('.score-card')).toHaveLength(2);
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

  it('shows timer controls for an active challenge', async () => {
    const user = userEvent.setup();
    const pack = parseGamePack(rawPack);
    const challenge = pack.challenges[0];

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: PERSISTED_EVENT_VERSION,
        state: {
          ...createInitialState(pack),
          screen: 'dashboard',
          activeChallengeId: challenge.id,
          challengeTimerDurationSeconds: challenge.time,
          challengeTimerSecondsLeft: 15,
          challengeTimerRunning: false,
        },
        undoAction: null,
        packMarkdown: rawPack,
        packFileName: 'fiesta-cumple.es.md',
      }),
    );

    render(<App />);

    expect(await screen.findByRole('button', { name: 'Continuar partida' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continuar partida' }));

    expect(await screen.findByRole('button', { name: 'Iniciar temporizador' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pausar temporizador' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reiniciar temporizador' })).toBeInTheDocument();
    expect(screen.getByLabelText('Volumen')).toBeInTheDocument();
    expect(document.querySelector('.timer-ring.is-warning')).toBeInTheDocument();
  });

  it('shows the round progress track with past, current and pending rounds', async () => {
    const user = userEvent.setup();
    const pack = parseGamePack(rawPack);
    const firstChallenge = pack.challenges[0];
    const secondChallenge = pack.challenges[1];
    const state = createInitialState(pack);

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: PERSISTED_EVENT_VERSION,
        state: {
          ...state,
          screen: 'dashboard',
          currentRound: 2,
          activeChallengeId: secondChallenge.id,
          completedChallengeIds: [firstChallenge.id],
        },
        undoAction: null,
        packMarkdown: rawPack,
        packFileName: 'fiesta-cumple.es.md',
      }),
    );

    render(<App />);

    expect(await screen.findByRole('button', { name: 'Continuar partida' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continuar partida' }));

    const steps = document.querySelectorAll('.round-progress-step');
    expect(steps[0]).toHaveClass('is-completed');
    expect(steps[1]).toHaveClass('is-current');
    expect(steps[1].querySelector('.round-progress-node')).toHaveAttribute('aria-current', 'step');
    expect(steps[2]).toHaveClass('is-pending');
    expect(screen.getByRole('heading', { name: /Ronda 2 de/ })).toBeInTheDocument();
  });

  it('moves to the final results screen once all rounds are completed', async () => {
    const user = userEvent.setup();
    const pack = parseGamePack(rawPack);
    const finalChallenge = pack.challenges[pack.challenges.length - 1];
    const completedChallengeIds = pack.challenges.slice(0, -1).map((challenge) => challenge.id);
    const state = createInitialState(pack);
    const winningTeam = state.teams[0];
    const runnerUpTeam = state.teams[1];
    const winnerMemberA = { ...createMember('Luna'), teamId: winningTeam.id };
    const winnerMemberB = { ...createMember('Noa'), teamId: winningTeam.id };
    const runnerUpMember = { ...createMember('Iris'), teamId: runnerUpTeam.id };

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: PERSISTED_EVENT_VERSION,
        state: {
          ...state,
          screen: 'dashboard',
          teams: state.teams.map((team, index) =>
            index === 0
              ? { ...team, score: 120, memberIds: [winnerMemberA.id, winnerMemberB.id] }
              : { ...team, score: 80, memberIds: [runnerUpMember.id] },
          ),
          members: [winnerMemberA, winnerMemberB, runnerUpMember, ...state.members.slice(3)],
          currentRound: pack.challenges.length,
          activeChallengeId: finalChallenge.id,
          challengeTimerDurationSeconds: finalChallenge.time,
          challengeTimerSecondsLeft: finalChallenge.time,
          challengeTimerRunning: false,
          completedChallengeIds,
        },
        undoAction: null,
        packMarkdown: rawPack,
        packFileName: 'fiesta-cumple.es.md',
      }),
    );

    render(<App />);

    expect(await screen.findByRole('button', { name: 'Continuar partida' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continuar partida' }));

    await user.click(screen.getByRole('button', { name: 'Marcar como completado' }));

    expect(await screen.findByRole('heading', { name: 'Ganador' })).toBeInTheDocument();
    expect(screen.getByText('Podio final')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: winningTeam.name })).toBeInTheDocument();
    expect(screen.getByText(winnerMemberA.name)).toBeInTheDocument();
    expect(screen.getByText(winnerMemberB.name)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Empezar desde cero' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver al juego' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Volver al juego' }));

    expect(await screen.findByRole('heading', { name: 'Panel del juego' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Marcar como completado' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: finalChallenge.title })).toBeInTheDocument();
  });

  it('applies a custom member score correction from the scoreboard', async () => {
    const user = userEvent.setup();
    const pack = parseGamePack(rawPack);
    const state = createInitialState(pack);
    const team = state.teams[0];
    const memberA = { ...createMember('Luna'), teamId: team.id, points: 0 };
    const memberB = { ...createMember('Noa'), teamId: team.id, points: 0 };
    const memberC = { ...createMember('Iris'), teamId: team.id, points: 0 };
    const secondTeam = state.teams[1];

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: PERSISTED_EVENT_VERSION,
        state: {
          ...state,
          screen: 'dashboard',
          teams: state.teams.map((entry, index) =>
            index === 0
              ? {
                  ...entry,
                  memberIds: [memberA.id, memberB.id, memberC.id],
                  score: 20,
                }
              : {
                  ...entry,
                  score: 5,
                }
          ),
          members: [memberA, memberB, memberC, ...state.members.slice(3)],
        },
        undoAction: null,
        packMarkdown: rawPack,
        packFileName: 'fiesta-cumple.es.md',
      }),
    );

    render(<App />);

    expect(await screen.findByRole('button', { name: 'Continuar partida' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continuar partida' }));

    const summaryList = screen.getByText('Resumen de puntos').closest('.score-summary')?.querySelector('.score-summary-list');
    expect(summaryList).not.toBeNull();
    const summaryItems = summaryList?.querySelectorAll('.score-summary-item');
    expect(summaryItems?.[0]).toHaveTextContent(team.name);
    expect(summaryItems?.[1]).toHaveTextContent(secondTeam.name);
    expect(summaryItems?.[0]?.querySelector('.score-summary-fill')).toHaveStyle({ width: '100%' });
    expect(summaryItems?.[1]?.querySelector('.score-summary-fill')).toHaveStyle({ width: '25%' });
    expect(screen.queryByLabelText('Miembro')).not.toBeInTheDocument();
    const teamCard = screen.getByRole('heading', { name: team.name }).closest('.score-card');
    expect(teamCard).not.toBeNull();
    await user.click(
      teamCard!.querySelector('button[name="toggle-manual-adjustment"]') ??
        screen.getAllByRole('button', { name: 'Mostrar correccion personalizada' })[0],
    );
    await user.selectOptions(screen.getByLabelText('Miembro'), 'all');
    await user.clear(screen.getByLabelText('Puntos a aplicar'));
    await user.type(screen.getByLabelText('Puntos a aplicar'), '25');
    await user.click(screen.getByRole('button', { name: 'Aplicar correccion' }));

    expect(teamCard?.querySelector('.score-card-header strong')).toHaveTextContent('45');
    expect(screen.getByText(`${memberA.name}: 9`)).toBeInTheDocument();
    expect(screen.getByText(`${memberB.name}: 8`)).toBeInTheDocument();
    expect(screen.getByText(`${memberC.name}: 8`)).toBeInTheDocument();
    await user.click(
      teamCard!.querySelector('button[name="toggle-manual-adjustment"]') ??
        screen.getByRole('button', { name: 'Ocultar correccion personalizada' }),
    );
    expect(screen.queryByLabelText('Miembro')).not.toBeInTheDocument();
  });

  it('awards points to a whole team and disables the rest of the challenge controls', async () => {
    const user = userEvent.setup();
    const pack = parseGamePack(rawPack);
    const state = createInitialState(pack);
    const challenge = pack.challenges[0];
    const firstTeam = state.teams[0];
    const secondTeam = state.teams[1];
    const memberA = { ...createMember('Luna'), teamId: firstTeam.id, points: 0 };
    const memberB = { ...createMember('Noa'), teamId: firstTeam.id, points: 0 };
    const memberC = { ...createMember('Iris'), teamId: secondTeam.id, points: 0 };

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: PERSISTED_EVENT_VERSION,
        state: {
          ...state,
          screen: 'dashboard',
          activeChallengeId: challenge.id,
          challengeTimerDurationSeconds: challenge.time,
          challengeTimerSecondsLeft: challenge.time,
          challengeTimerRunning: false,
          teams: state.teams.map((entry, index) =>
            index === 0
              ? {
                  ...entry,
                  memberIds: [memberA.id, memberB.id],
                  score: 0,
                }
              : {
                  ...entry,
                  memberIds: [memberC.id],
                  score: 0,
                },
          ),
          members: [memberA, memberB, memberC, ...state.members.slice(3)],
        },
        undoAction: null,
        packMarkdown: rawPack,
        packFileName: 'fiesta-cumple.es.md',
      }),
    );

    render(<App />);

    expect(await screen.findByRole('button', { name: 'Continuar partida' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continuar partida' }));

    const firstTeamCard = screen.getByRole('heading', { name: firstTeam.name, level: 4 }).closest('.award-card') as HTMLElement | null;
    expect(firstTeamCard).not.toBeNull();
    await user.click(within(firstTeamCard!).getByRole('button', { name: 'Todo el equipo' }));

    expect(screen.getByText(`${memberA.name}: 50`)).toBeInTheDocument();
    expect(screen.getByText(`${memberB.name}: 50`)).toBeInTheDocument();
    expect(screen.getByText(`${memberC.name}: 0`)).toBeInTheDocument();
    expect(within(firstTeamCard!).getByRole('button', { name: memberA.name })).toBeDisabled();
    expect(within(firstTeamCard!).getByRole('button', { name: memberB.name })).toBeDisabled();
    expect(within(firstTeamCard!).getByRole('button', { name: 'Todo el equipo' })).toBeDisabled();
    const secondTeamCard = screen.getByRole('heading', { name: secondTeam.name, level: 4 }).closest('.award-card') as HTMLElement | null;
    expect(secondTeamCard).not.toBeNull();
    expect(within(secondTeamCard!).getByRole('button', { name: 'Todo el equipo' })).toBeDisabled();
    expect(screen.getByRole('button', { name: memberC.name })).toBeDisabled();
    expect(screen.getByText('Ya se asignaron los puntos de este reto')).toBeInTheDocument();
  });
});
