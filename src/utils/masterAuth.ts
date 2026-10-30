import { User } from 'firebase/auth';
import { safeStorage } from './storage';
import { googleSignIn as firebaseGoogleSignIn, logoutGoogle as firebaseLogoutGoogle, auth } from './googleAuth';

export interface MasterUser {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  authProvider: 'google' | 'hmhs';
  token: string;
  loggedInAt: number;
}

export const HMHS_AGENTS_METRIC = [
  { id: 1, name: 'Dr. Alistair Vance', role: 'Spacetime Metric & Quantum Field Lead', status: 'ONLINE', latency: '0.12ms' },
  { id: 2, name: 'Prof. Kaelen Thorne', role: 'Thermodynamics & Non-Equilibrium Energy', status: 'ONLINE', latency: '0.18ms' },
  { id: 3, name: 'Dr. Lyra Sterling', role: 'Molecular Nanotech & Web Recon Lead', status: 'ONLINE', latency: '0.14ms' },
  { id: 4, name: 'Prof. Zephyr Vance', role: 'Network Topology & Dark Sector Physics', status: 'ONLINE', latency: '0.11ms' },
  { id: 5, name: 'Dr. Nyx Thorne', role: 'Quantum Coherence & Information Bounds', status: 'ONLINE', latency: '0.15ms' },
  { id: 6, name: 'Prof. Orion Voss', role: 'Vacuum Energy & High-Velocity Propulsion', status: 'ONLINE', latency: '0.19ms' },
  { id: 7, name: 'Dr. Vespera Cruz', role: 'Biological Integrity & OAuth Security Gatekeeper', status: 'ONLINE', latency: '0.09ms' },
  { id: 8, name: 'Prof. Silas Drake', role: 'Autonomous Cloud Computer & Pipeline Director', status: 'ONLINE', latency: '0.08ms' },
  { id: 9, name: 'Dr. Thalia Rey', role: 'Sub-Quantum Reverse-Engineering Lead', status: 'ONLINE', latency: '0.13ms' },
  { id: 10, name: 'Prof. Magnus Kane', role: '54PB Data Matrix Director & Consensus Lead', status: 'ONLINE', latency: '0.07ms' },
];

// Synchronously read Master User from persistent safeStorage
export function getMasterUser(): MasterUser | null {
  try {
    const raw = safeStorage.getItem('hmhs_master_auth_user');
    if (raw) {
      return JSON.parse(raw);
    }
    const googleUserRaw = safeStorage.getItem('hmhs_google_user');
    const googleToken = safeStorage.getItem('hmhs_google_access_token');
    if (googleUserRaw && googleToken) {
      const parsed = JSON.parse(googleUserRaw);
      return {
        id: parsed.uid || 'google_user',
        email: parsed.email || 'user@gmail.com',
        displayName: parsed.displayName || 'Authorized User',
        photoURL: parsed.photoURL,
        authProvider: 'google',
        token: googleToken,
        loggedInAt: Date.now(),
      };
    }
  } catch (e) {
    console.warn('Error reading master user:', e);
  }
  return null;
}

// Synchronously read Master / Google Token
export function getMasterToken(): string | null {
  return (
    safeStorage.getItem('hmhs_google_access_token') ||
    safeStorage.getItem('hmhs_master_token') ||
    null
  );
}

// Check if user is authenticated once and for all
export function isMasterAuthenticated(): boolean {
  return getMasterToken() !== null || getMasterUser() !== null;
}

// Auto-sync Google connectors when Google login happens
export function syncGoogleConnectorsToStorage(accountEmail: string) {
  try {
    const saved = safeStorage.getItem('hmhs_connectors_v2');
    if (saved) {
      const list = JSON.parse(saved);
      if (Array.isArray(list)) {
        const updated = list.map((c: any) => {
          if (c.id === 'gmail' || c.id === 'google_drive' || c.id === 'google_calendar') {
            return {
              ...c,
              connected: true,
              connectedAccount: accountEmail,
              connectedAt: Date.now(),
            };
          }
          return c;
        });
        safeStorage.setItem('hmhs_connectors_v2', JSON.stringify(updated));
      }
    }
  } catch (e) {
    console.warn('Could not sync google connectors:', e);
  }
}

// Real One-Time Sign-in with Google OAuth
export async function masterSignInWithGoogle(): Promise<MasterUser> {
  const result = await firebaseGoogleSignIn();
  if (!result || !result.user) {
    throw new Error('Google Sign-In was cancelled or failed.');
  }

  const token = result.accessToken || 'oauth_authorized_token';
  const masterUser: MasterUser = {
    id: result.user.uid,
    email: result.user.email || 'user@gmail.com',
    displayName: result.user.displayName || 'Verified Google Account',
    photoURL: result.user.photoURL || undefined,
    authProvider: 'google',
    token,
    loggedInAt: Date.now(),
  };

  // Save to persistent storage permanently
  safeStorage.setItem('hmhs_master_auth_user', JSON.stringify(masterUser));
  safeStorage.setItem('hmhs_master_token', token);
  safeStorage.setItem('hmhs_google_access_token', token);
  safeStorage.setItem(
    'hmhs_google_user',
    JSON.stringify({
      email: masterUser.email,
      displayName: masterUser.displayName,
      photoURL: masterUser.photoURL,
      uid: masterUser.id,
    })
  );

  syncGoogleConnectorsToStorage(masterUser.email);
  return masterUser;
}

// One-Time Sign-in with HMHS Bot Master Agent Account
export function masterSignInWithHMHS(email: string, name?: string, customToken?: string): MasterUser {
  const token = customToken?.trim() || `hmhs_agent_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const masterUser: MasterUser = {
    id: `hmhs_agent_${Date.now()}`,
    email: email.trim() || 'agent.master@hmhs-box.internal',
    displayName: name?.trim() || 'HMHS Master Operator',
    authProvider: 'hmhs',
    token,
    loggedInAt: Date.now(),
  };

  safeStorage.setItem('hmhs_master_auth_user', JSON.stringify(masterUser));
  safeStorage.setItem('hmhs_master_token', token);
  safeStorage.setItem('hmhs_google_access_token', token);
  safeStorage.setItem(
    'hmhs_google_user',
    JSON.stringify({
      email: masterUser.email,
      displayName: masterUser.displayName,
      uid: masterUser.id,
    })
  );

  syncGoogleConnectorsToStorage(masterUser.email);
  return masterUser;
}

// Permanent Sign-out
export async function masterSignOut() {
  await firebaseLogoutGoogle();
  safeStorage.removeItem('hmhs_master_auth_user');
  safeStorage.removeItem('hmhs_master_token');
  safeStorage.removeItem('hmhs_google_access_token');
  safeStorage.removeItem('hmhs_google_user');
}
