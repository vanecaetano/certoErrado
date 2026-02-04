export type AdsConsent = 'personalized' | 'non_personalized' | 'denied' | 'unknown';

const CONSENT_KEY = 'certo_errado_ads_consent_v1';

export function getConsent(): { ads: AdsConsent } {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return { ads: 'unknown' };
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.ads === 'personalized' || parsed.ads === 'non_personalized' || parsed.ads === 'denied')) {
      return { ads: parsed.ads };
    }
  } catch (e) {
    // ignore
  }
  return { ads: 'unknown' };
}

export function setConsentAds(value: AdsConsent) {
  try {
    if (value === 'unknown') {
      localStorage.removeItem(CONSENT_KEY);
    } else {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ ads: value }));
    }
    // Disparar evento customizado para sincronizar em tempo real
    window.dispatchEvent(new CustomEvent('consent-changed', { detail: { ads: value } }));
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
