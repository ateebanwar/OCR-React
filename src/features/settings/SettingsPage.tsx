import React, { useState } from 'react';
import {
  User,
  Palette,
  Cpu,
  Trash2,
  Check,
  Save,
  Sun,
  Moon,
} from 'lucide-react';
import { useDocumentSession } from '@/application/orchestration/DocumentSessionContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Gender } from '@/domain/profile/UserProfile';
import { ModelRoutingMode } from '@/domain/settings/ApplicationSettings';
import './SettingsPage.css';

export const SettingsPage: React.FC = () => {
  const { profile, settings, updateProfile, updateSettings, clearSession } = useDocumentSession();

  const [fullName, setFullName] = useState(profile.fullName);
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      dateOfBirth,
      gender,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="settings-page-container">
      <div className="settings-header">
        <h1 className="settings-title">Application Settings & Preferences</h1>
        <p className="settings-subtitle">
          Configure analyst identity, appearance, multi-signal AI routing tiers, and local data persistence.
        </p>
      </div>

      <div className="settings-sections-list">
        {/* Appearance Section (Theme) */}
        <Card className="settings-card">
          <div className="card-section-header">
            <div className="section-icon-box">
              <Palette size={20} />
            </div>
            <div>
              <h2 className="section-heading">Visual Appearance</h2>
              <p className="section-subtext">Toggle between Day (Light) and Night (Dark) mode.</p>
            </div>
          </div>

          <div className="theme-toggle-grid">
            <button
              type="button"
              className={`theme-option-card ${settings.theme === 'light' ? 'selected' : ''}`}
              onClick={() => updateSettings({ theme: 'light' })}
            >
              <Sun size={24} className="theme-icon light" />
              <span className="theme-name">Light / Day Mode</span>
              <span className="theme-sub">Default high-contrast paper aesthetics</span>
            </button>

            <button
              type="button"
              className={`theme-option-card ${settings.theme === 'dark' ? 'selected' : ''}`}
              onClick={() => updateSettings({ theme: 'dark' })}
            >
              <Moon size={24} className="theme-icon dark" />
              <span className="theme-name">Dark / Night Mode</span>
              <span className="theme-sub">Linear slate charcoal with reduced glare</span>
            </button>
          </div>
        </Card>

        {/* AI Model Routing Configuration (Section 10 & 11) */}
        <Card className="settings-card">
          <div className="card-section-header">
            <div className="section-icon-box">
              <Cpu size={20} />
            </div>
            <div>
              <h2 className="section-heading">AI Model Routing & Fallback</h2>
              <p className="section-subtext">
                Controls how documents are evaluated across OCR complexity, table count, and audit depth.
              </p>
            </div>
          </div>

          <div className="routing-modes-grid">
            {[
              {
                mode: 'balanced' as ModelRoutingMode,
                name: 'Intelligent Multi-Signal (Recommended)',
                desc: 'Routes to Flash for crisp digital documents; auto-escalates to Pro Specialist for scanned/noisy multi-currency tables.',
              },
              {
                mode: 'fast' as ModelRoutingMode,
                name: 'Maximum Speed (Gemini 2.5 Flash)',
                desc: 'Optimized for rapid turnaround. Fallback to Pro on extraction validation mismatch.',
              },
              {
                mode: 'deep-financial-audit' as ModelRoutingMode,
                name: 'Deep Financial Audit (Gemini 1.5 Pro)',
                desc: 'Exhaustive cross-table cell reconciliation and multi-pass financial arithmetic verification.',
              },
            ].map((option) => (
              <label
                key={option.mode}
                className={`routing-option-item ${settings.modelRoutingMode === option.mode ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="routingMode"
                  value={option.mode}
                  checked={settings.modelRoutingMode === option.mode}
                  onChange={() => updateSettings({ modelRoutingMode: option.mode })}
                  className="routing-radio"
                />
                <div className="routing-info">
                  <span className="routing-title">{option.name}</span>
                  <span className="routing-desc">{option.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Local Analyst Profile Editor (Section 17) */}
        <Card className="settings-card">
          <div className="card-section-header">
            <div className="section-icon-box">
              <User size={20} />
            </div>
            <div>
              <h2 className="section-heading">Analyst Profile</h2>
              <p className="section-subtext">
                Personalizes audit signatures and reports. Persisted exclusively to browser LocalStorage.
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="profile-form">
            <div className="form-group">
              <label htmlFor="settingsName" className="form-label">Full Name & Professional Role</label>
              <input
                id="settingsName"
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. David Vance, Senior Auditor"
                required
              />
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label htmlFor="settingsDOB" className="form-label">Date of Birth</label>
                <input
                  id="settingsDOB"
                  type="date"
                  className="form-input"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="settingsGender" className="form-label">Gender</label>
                <select
                  id="settingsGender"
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

            <div className="profile-save-row">
              {saveSuccess && (
                <span className="save-success-tag">
                  <Check size={14} /> Changes saved to LocalStorage
                </span>
              )}
              <Button type="submit" variant="primary" size="md" leftIcon={<Save size={16} />}>
                Save Profile
              </Button>
            </div>
          </form>
        </Card>

        {/* Local Data Management */}
        <Card className="settings-card">
          <div className="card-section-header">
            <div className="section-icon-box">
              <Trash2 size={20} className="text-danger" />
            </div>
            <div>
              <h2 className="section-heading">Data & Session Management</h2>
              <p className="section-subtext">
                Clear temporary datasets and active document state without deleting your analyst profile.
              </p>
            </div>
          </div>

          <div className="data-management-row">
            <div>
              <p className="data-action-desc">
                Unloads any active document, canonical table, and conversation history from memory.
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={clearSession}
              leftIcon={<Trash2 size={16} />}
            >
              Clear Active Session
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
