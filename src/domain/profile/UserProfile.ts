export type Gender = 'female' | 'male' | 'non-binary' | 'prefer-not-to-say';

export interface UserProfile {
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: Gender;
  isOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export const defaultUserProfile: UserProfile = {
  fullName: '',
  dateOfBirth: '',
  gender: 'prefer-not-to-say',
  isOnboarded: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
