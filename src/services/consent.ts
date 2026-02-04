export type ConsentState = 'granted' | 'denied' | 'unknown';

const CONSENT_KEY = 'ads_consent';

export function getConsent(): ConsentState {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    if (v === 'granted' || v === 'denied') return v;
  } catch (e) {
    // ignore
  }
  return 'unknown';
}

export function setConsent(state: ConsentState) {
  try {
    if (state === 'unknown') {
      localStorage.removeItem(CONSENT_KEY);
    } else {
      localStorage.setItem(CONSENT_KEY, state);
    }
  } catch (e) {
    // ignore
  }
}

export function clearConsent() {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch (e) {
    // ignore
  }
}
