// jest + @testing-library/react test for RotatingJournal component
import { render, screen } from '@testing-library/react';
import RotatingJournal, { JournalPost } from '@/components/ui/RotatingJournal';

test('renders RotatingJournal with sample posts', () => {
  const samplePosts: JournalPost[] = [
    { date: '2023-01-01', tag: 'NOTE', title: 'Test Title', excerpt: 'Excerpt' },
  ];
  render(<RotatingJournal posts={samplePosts} />);
  expect(screen.getByText('Test Title')).toBeInTheDocument();
});