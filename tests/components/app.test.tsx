import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '@/app/App';

describe('LedgerAI Application Component & Routing Tests', () => {
  it('renders onboarding welcome screen for first-time launch', () => {
    localStorage.clear();
    render(<App />);

    expect(screen.getByText(/Welcome to LedgerAI/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Transform PDFs, scanned invoices, and complex financial statements/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument();
  });

  it('renders dashboard with query bar and benchmark fixtures when onboarded', () => {
    window.history.pushState({}, 'Test', '/');
    localStorage.setItem(
      'ledgerai_user_profile_v1',
      JSON.stringify({
        fullName: 'Sarah Jenkins, Senior Auditor',
        dateOfBirth: '1988-04-12',
        gender: 'female',
        isOnboarded: true,
      })
    );

    render(<App />);

    expect(screen.getByText(/Ingest any financial document/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask a financial question/i)).toBeInTheDocument();
    expect(screen.getByText(/TechCorp_Q4_Consolidated_Financials.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/Apex_Global_Logistics_Inv9044.pdf/i)).toBeInTheDocument();
  });
});
