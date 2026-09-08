import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders the home screen', async () => {
  render(<App />);
  expect(await screen.findByText('Thought Records')).toBeInTheDocument();
});
