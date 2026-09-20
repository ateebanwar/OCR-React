import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, User, Calendar, Check } from 'lucide-react';
import { useDocumentSession } from '@/application/orchestration/DocumentSessionContext';
import { Gender } from '@/domain/profile/UserProfile';
import { Button } from '@/components/ui/Button';
import './OnboardingPage.css';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useDocumentSession();

  const [step, setStep] = useState<1 | 2>(profile.isOnboarded ? 2 : 1);
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth || '');
  const [gender, setGender] = useState<Gender>(profile.gender || 'prefer-not-to-say');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (profile.isOnboarded) {
      navigate('/', { replace: true });
    }
  }, [profile.isOnboarded, navigate]);

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your full name or professional pseudonym to personalize your audit reports.');
      return;
    }

    updateProfile({
      fullName: fullName.trim(),
      dateOfBirth,
      gender,
      isOnboarded: true,
    });

    navigate('/');
  };

  return (
    <div className="onboarding-page-container">
      <div className="onboarding-card">
        {step === 1 ? (
          <div className="onboarding-step welcome-step">
            <div className="onboarding-icon-box">
              <ShieldCheck size={36} className="brand-primary-icon" />
            </div>

            <span className="onboarding-badge">ENTERPRISE FINANCIAL INTELLIGENCE</span>
            <h1 className="onboarding-title">Welcome to LedgerAI</h1>
            <p className="onboarding-text">
              Transform PDFs, scanned invoices, and complex financial statements into verified, audit-ready
              canonical Excel workbooks with deterministic decimal precision.
            </p>

            <div className="onboarding-highlights">
              <div className="highlight-item">
                <div className="highlight-check"><Check size={14} /></div>
                <span>Zero raw AI in financial datasets—deterministic validation only</span>
              </div>
              <div className="highlight-item">
                <div className="highlight-check"><Check size={14} /></div>
                <span>Subtotal arithmetic verification & balance reconciliation</span>
              </div>
              <div className="highlight-item">
                <div className="highlight-check"><Check size={14} /></div>
                <span>Genuine .xlsx generation with frozen headers & typed cells</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => setStep(2)}
              rightIcon={<ArrowRight size={18} />}
              className="w-full"
            >
              Get Started
            </Button>
          </div>
        ) : (
          <form className="onboarding-step profile-step" onSubmit={handleComplete}>
            <div className="step-header">
              <span className="onboarding-badge">STEP 2 OF 2</span>
              <h2 className="step-title">Analyst Profile Setup</h2>
              <p className="step-subtitle">
                Your profile is stored locally on this machine. No passwords, OTPs, or cloud accounts required.
              </p>
            </div>

            {error && (
              <div className="onboarding-error-banner" role="alert">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                <User size={15} />
                <span>Full Name / Title</span>
              </label>
              <input
                id="fullName"
                type="text"
                className="form-input"
                placeholder="e.g. Sarah Jenkins, Senior Financial Analyst"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setError(null);
                }}
                required
                autoFocus
              />
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label htmlFor="dateOfBirth" className="form-label">
                  <Calendar size={15} />
                  <span>Date of Birth</span>
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  className="form-input"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender" className="form-label">
                  <span>Gender</span>
                </label>
                <select
                  id="gender"
                  className="form-input"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                >
                  <option value="prefer-not-to-say">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </div>
            </div>

            <div className="step-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight size={18} />}
              >
                Save & Launch Workspace
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
