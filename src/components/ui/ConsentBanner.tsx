import { useEffect, useState } from 'react';
import { Button } from './Button';
import { getConsent, setConsent } from '@/services/consent';

export function ConsentBanner() {
  const [consent, setLocalConsent] = useState(getConsent());

  useEffect(() => {
    setLocalConsent(getConsent());
  }, []);

  if (consent === 'granted' || consent === 'denied') return null;

  const accept = () => {
    setConsent('granted');
    setLocalConsent('granted');
    // trigger ads push if available
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  };

  const decline = () => {
    setConsent('denied');
    setLocalConsent('denied');
  };

  return (
    <div className="fixed bottom-6 right-6 z-60 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
      <div className="text-sm text-gray-800 dark:text-gray-100 mb-3">
        Usamos anúncios para manter o serviço gratuito. Aceita o uso de cookies e anúncios personalizados?
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={decline}>Recusar</Button>
        <Button variant="primary" size="sm" onClick={accept}>Aceitar</Button>
      </div>
    </div>
  );
}
