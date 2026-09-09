import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

function Boom(): never {
  throw new Error('kaboom');
}

let consoleSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleSpy.mockRestore();
});

test('renders fallback copy and recovery links when a child throws', () => {
  render(
    <ErrorBoundary>
      <Boom />
    </ErrorBoundary>,
  );
  expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  expect(screen.getByText('Your records are still on this device.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Back home' })).toHaveAttribute('href', '#/');
  expect(screen.getByRole('link', { name: 'Go to Settings' })).toHaveAttribute('href', '#/settings');
});
