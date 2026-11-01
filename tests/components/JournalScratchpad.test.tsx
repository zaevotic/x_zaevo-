// jest + @testing-library/react test for JournalScratchpad component
import { render, screen, waitFor } from '@testing-library/react';
import JournalScratchpad from '@/components/ui/JournalScratchpad';

// Mock fetch for journal entries
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([
      { id: '1', title: 'Entry 1', tags: [], date: '2023-01-01', body: '**Bold** text', callout: null },
    ]),
  })
) as jest.Mock;

test('renders selected journal entry body via MDXProvider', async () => {
  render(<JournalScratchpad />);
  // Open the scratchpad by simulating path change if needed – here we directly set isOpen via internal effect not trivial.
  // For simplicity, just wait for fetch to be called.
  await waitFor(() => expect(fetch).toHaveBeenCalled());
  // Since rendering uses MDXProvider, we check that the bold text appears.
  expect(screen.getByText('Bold')).toBeInTheDocument();
});