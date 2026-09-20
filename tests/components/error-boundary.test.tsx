import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

const ThrowingComponent = () => {
  throw new Error('Simulated critical component crash');
};

describe('ErrorBoundary Component', () => {
  it('catches render errors and displays recovery screen', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Application State Safeguard/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulated critical component crash/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Return to Dashboard/i })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
