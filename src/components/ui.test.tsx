import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { Button, Chip, ConfirmSheet, IntensitySlider, Switch } from './ui';

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
