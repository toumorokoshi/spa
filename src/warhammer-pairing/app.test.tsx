import { render, fireEvent, waitFor } from '@testing-library/preact';
import { describe, it, expect } from 'vitest';
import { App } from './app';

describe('Warhammer Pairing Solver App', () => {
  it('renders app brand, tabs, and default 8v8 matrix', () => {
    const { getByText, getByRole, getByDisplayValue } = render(<App />);
    expect(getByText('Warhammer Pairing Solver')).toBeTruthy();
    expect(getByRole('button', { name: /score matrix/i })).toBeTruthy();
    expect(getByRole('button', { name: /draft assistant/i })).toBeTruthy();
    expect(getByRole('button', { name: /about & guide/i })).toBeTruthy();
    expect(getByRole('button', { name: /solve draft/i })).toBeTruthy();
    expect(getByDisplayValue('Alice')).toBeTruthy();
    expect(getByDisplayValue('Karl')).toBeTruthy();
  });

  it('switches to About & Guide tab and displays tournament writeup', () => {
    const { getByRole, getByText } = render(<App />);
    const guideTab = getByRole('button', { name: /about & guide/i });
    fireEvent.click(guideTab);
    expect(getByText('About Warhammer Pairing Solver')).toBeTruthy();
    expect(getByText('1. Tournament Purpose & Context')).toBeTruthy();
    expect(getByText('2. The 4-Round WTC Pairing Process')).toBeTruthy();
  });

  it('opens and closes the paste modal', () => {
    const { getByRole, queryByText } = render(<App />);
    const pasteBtn = getByRole('button', { name: /paste from spreadsheet/i });
    fireEvent.click(pasteBtn);
    expect(queryByText('Paste from Google Sheets or Excel')).toBeTruthy();

    const cancelBtn = getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(queryByText('Paste from Google Sheets or Excel')).toBeNull();
  });

  it('loads 4v4 sample and solves draft', async () => {
    const { getByRole, findByText, queryByDisplayValue, queryByText } = render(
      <App />
    );
    const load4v4Btn = getByRole('button', { name: /load 4v4 sample/i });
    fireEvent.click(load4v4Btn);

    expect(queryByDisplayValue('Hans')).toBeNull();
    const solveBtn = getByRole('button', { name: /solve draft/i });
    fireEvent.click(solveBtn);

    const heading = await findByText('Game Expected Total');
    expect(heading).toBeTruthy();
    expect(queryByText('Best Pure Defender')).toBeTruthy();
  });

  it('switches to Draft Assistant tab and locks in a round', async () => {
    const { getByRole, findByText } = render(<App />);
    const draftTab = getByRole('button', { name: /draft assistant/i });
    fireEvent.click(draftTab);

    expect(await findByText('At-the-Table Draft Assistant')).toBeTruthy();
    expect(await findByText('Round 1 Setup & Choices')).toBeTruthy();

    const lockInBtn = getByRole('button', { name: /lock in round 1 choices/i });
    fireEvent.click(lockInBtn);

    await waitFor(() => {
      expect(findByText('Formed Matchups (2 / 8)')).toBeTruthy();
    });
  });
});
