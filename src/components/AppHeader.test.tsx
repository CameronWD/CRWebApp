import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { expect, test } from 'vitest';
import AppHeader, { BackLink } from './AppHeader';

test('renders title, left and right slots inside a sticky header', () => {
  const { container } = render(
    <HashRouter>
      <AppHeader title="Thought Records" left={<span>L</span>} right={<span>R</span>} />
    </HashRouter>,
  );
  expect(screen.getByRole('heading', { name: 'Thought Records' })).toBeInTheDocument();
  expect(screen.getByText('L')).toBeInTheDocument();
  expect(screen.getByText('R')).toBeInTheDocument();
  const header = container.querySelector('header');
  expect(header?.className).toContain('sticky');
  expect(header?.className).toContain('backdrop-blur');
});

test('BackLink is an accessible link back home', () => {
  render(
    <HashRouter>
      <BackLink />
    </HashRouter>,
  );
  const link = screen.getByRole('link', { name: 'Back' });
  expect(link).toHaveAttribute('href', '#/');
});
