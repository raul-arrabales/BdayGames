import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../App';

describe('App', () => {
  it('shows landing and can enter setup flow', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Bday Games' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Empezar' }));

    expect(screen.getByRole('heading', { name: 'Configuracion de equipos' })).toBeInTheDocument();
  });
});
