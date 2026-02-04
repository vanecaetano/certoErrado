import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Link } from 'react-router-dom';
import { getConsent, setConsentAds } from '@/services/consent';

export function ConsentBanner() {
  const [consentState, setConsentState] = useState(() => getConsent().ads);
  const [isVisible, setIsVisible] = useState(true);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const newConsent = getConsent().ads;
      setConsentState(newConsent);
      if (newConsent === 'personalized' || newConsent === 'non_personalized') {
        setIsVisible(false);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Only show banner if user has NOT yet accepted
  if (!isVisible || consentState === 'personalized' || consentState === 'non_personalized') return null;

  const acceptPersonalized = () => {
    setConsentAds('personalized');
    setConsentState('personalized');
    setIsVisible(false);
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  };

  const acceptNonPersonalized = () => {
    setConsentAds('non_personalized');
    setConsentState('non_personalized');
    setIsVisible(false);
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  };

  const declineAll = () => {
    setConsentAds('denied');
    setConsentState('denied');
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-60 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
      <div className="text-sm text-gray-800 dark:text-gray-100 mb-3">
        Usamos anúncios para manter o serviço gratuito. Escolha entre anúncios personalizados, não personalizados ou recusar anúncios.
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Button variant="primary" size="sm" onClick={acceptPersonalized}>Aceitar anúncios personalizados</Button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button variant="secondary" size="sm" onClick={acceptNonPersonalized}>Aceitar somente não personalizados</Button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button variant="secondary" size="sm" onClick={declineAll}>Recusar todos</Button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          <Link to="/privacy" className="underline">Ver política de privacidade</Link>
        </div>
      </div>
    </div>
  );
}
