import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { safeStorage } from './storage';

// Reuse existing app instance if already initialized
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
];

const provider = new GoogleAuthProvider();
for (const scope of SCOPES) {
  provider.addScope(scope);
}
provider.setCustomParameters({
  prompt: 'select_account',
});

// Persistent token cache so sign-in is strictly ONE-TIME
let cachedAccessToken: string | null = safeStorage.getItem('hmhs_google_access_token');
let isSigningIn = false;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  const savedToken = cachedAccessToken || safeStorage.getItem('hmhs_google_access_token');
  if (savedToken) cachedAccessToken = savedToken;

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const activeToken = cachedAccessToken || safeStorage.getItem('hmhs_google_access_token') || 'oauth_authorized_token';
      cachedAccessToken = activeToken;
      safeStorage.setItem('hmhs_google_access_token', activeToken);
      safeStorage.setItem(
        'hmhs_google_user',
        JSON.stringify({
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          uid: user.uid,
        })
      );
      if (onAuthSuccess) onAuthSuccess(user, activeToken);
    } else {
      const savedUserStr = safeStorage.getItem('hmhs_google_user');
      const savedTok = safeStorage.getItem('hmhs_google_access_token');
      if (savedUserStr && savedTok && onAuthSuccess) {
        try {
          const parsed = JSON.parse(savedUserStr);
          cachedAccessToken = savedTok;
          onAuthSuccess(parsed as any, savedTok);
          return;
        } catch {
          // ignore
        }
      }
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup (Firebase Auth)
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || 'oauth_authorized_token';

    cachedAccessToken = token;
    safeStorage.setItem('hmhs_google_access_token', token);
    safeStorage.setItem(
      'hmhs_google_user',
      JSON.stringify({
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        uid: result.user.uid,
      })
    );

    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Retrieve access token
export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;
  const stored = safeStorage.getItem('hmhs_google_access_token');
  if (stored) {
    cachedAccessToken = stored;
    return stored;
  }
  return null;
};

// Manually set access token (permanently saved)
export const setManualAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  if (token) {
    safeStorage.setItem('hmhs_google_access_token', token);
  } else {
    safeStorage.removeItem('hmhs_google_access_token');
  }
};

// Sign out and clear stored token
export const logoutGoogle = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    // ignore
  }
  cachedAccessToken = null;
  safeStorage.removeItem('hmhs_google_access_token');
  safeStorage.removeItem('hmhs_google_user');
};
