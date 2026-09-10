import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { Button, Chip, ConfirmSheet, InfoSheet, IntensitySlider, StepShell, Switch } from './ui';
import { STEP_HELP } from '../lib/stepHelp';

test('Button fires onClick and respects disabled', async () => {
  const onClick = vi.fn();
  const { rerender } = render(<Button onClick={onClick}>Go</Button>);
  await userEvent.click(screen.getByRole('button', { name: 'Go' }));
  expect(onClick).toHaveBeenCalledOnce();
  rerender(<Button onClick={onClick} disabled>Go</Button>);
  expect(screen.getByRole('button', { name: 'Go' })).toBeDisabled();
});

test('Chip fires onTap', async () => {
  const onTap = vi.fn();
  render(<Chip label="Anxious" selected={false} onTap={onTap} />);
  await userEvent.click(screen.getByRole('button', { name: 'Anxious' }));
  expect(onTap).toHaveBeenCalledOnce();
});

test('IntensitySlider shows label and value', () => {
  render(<IntensitySlider label="Anxious" value={70} onChange={() => {}} />);
  expect(screen.getByText('Anxious')).toBeInTheDocument();
  expect(screen.getByText('70')).toBeInTheDocument();
  expect(screen.getByRole('slider')).toHaveValue('70');
});

test('ConfirmSheet renders only when open and wires both buttons', async () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const { rerender } = render(
    <ConfirmSheet open={false} title="Delete?" body="Gone forever." confirmLabel="Delete" onConfirm={onConfirm} onCancel={onCancel} />,
  );
  expect(screen.queryByText('Delete?')).not.toBeInTheDocument();
  rerender(
    <ConfirmSheet open title="Delete?" body="Gone forever." confirmLabel="Delete" onConfirm={onConfirm} onCancel={onCancel} />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
  expect(onConfirm).toHaveBeenCalledOnce();
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onCancel).toHaveBeenCalledOnce();
});

test('Switch reflects and toggles its state', async () => {
  const onChange = vi.fn();
  render(<Switch checked={false} onChange={onChange} label="Name the thinking pattern" />);
  const sw = screen.getByRole('switch', { name: /Name the thinking pattern/ });
  expect(sw).toHaveAttribute('aria-checked', 'false');
  await userEvent.click(sw);
  expect(onChange).toHaveBeenCalledWith(true);
});

describe('InfoSheet', () => {
  test('renders title, paragraphs and example when open', () => {
    render(<InfoSheet open help={STEP_HELP.situation} onClose={() => {}} />);
    expect(screen.getByText('The situation')).toBeInTheDocument();
    expect(screen.getByText(/camera recorded it/)).toBeInTheDocument();
    expect(screen.getByText(/criticised my report/)).toBeInTheDocument();
  });

  test('renders nothing when closed and closes via the Got it button', () => {
    const onClose = vi.fn();
    const { rerender } = render(<InfoSheet open={false} help={STEP_HELP.rerate} onClose={onClose} />);
    expect(screen.queryByText('Rating the feelings again')).not.toBeInTheDocument();
    rerender(<InfoSheet open help={STEP_HELP.rerate} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(onClose).toHaveBeenCalled();
  });

  test('omits the example block when the entry has none', () => {
    render(<InfoSheet open help={STEP_HELP.rerate} onClose={() => {}} />);
    expect(screen.queryByText(/Example:/)).not.toBeInTheDocument();
  });
});

describe('StepShell help', () => {
  test('renders an About this step button that opens the sheet', () => {
    render(<StepShell title="T" help={STEP_HELP.situation} />);
    expect(screen.queryByText('The situation')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'About this step' }));
    expect(screen.getByText('The situation')).toBeInTheDocument();
  });

  test('renders no info button without help', () => {
    render(<StepShell title="T" />);
    expect(screen.queryByRole('button', { name: 'About this step' })).not.toBeInTheDocument();
  });
});
