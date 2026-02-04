/**
 * Componente reservado para futuras propagandas
 * 
 * Estratégias de monetização sugeridas:
 * 1. Banner fixo na parte inferior (não interfere no jogo)
 * 2. Recompensas: assistir anúncio para ganhar pistas
 * 3. Anúncios intersticiais entre rodadas (após X perguntas)
 * 4. Anúncios de recompensa: dobrar pontuação ao assistir anúncio
 * 5. Anúncios nativos que se integram ao design
 */

import { useEffect, useRef, useState } from 'react';
import { getConsent } from '@/services/consent';
import { ConsentBanner } from '@/components/ui/ConsentBanner';

interface AdSpaceProps {
  position?: 'bottom' | 'top' | 'sidebar';
  className?: string;
}

export function AdSpace({ position = 'bottom', className = '' }: AdSpaceProps) {
  const adRef = useRef<HTMLDivElement | null>(null);

  // Read AdSense config from environment variables (Vite):
  const client = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;
  const slot = import.meta.env.VITE_ADSENSE_SLOT as string | undefined;
  const isDev = import.meta.env.MODE === 'development';
  const isTest = isDev || import.meta.env.VITE_ADSENSE_TEST === 'true';
  const [consent] = useState<'granted' | 'denied' | 'unknown'>(() => getConsent());

  useEffect(() => {
    if (!client || !slot) return;
    if (consent !== 'granted') return;

    // Avoid injecting script multiple times
    const scriptId = 'adsbygoogle-js';
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.id = scriptId;
      s.async = true;
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      s.crossOrigin = 'anonymous';
      document.head.appendChild(s);
    }

    // Push the ad when the ins is rendered
    const tryPush = () => {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // ignore
      }
    };

    // Small timeout to ensure script executes
    const t = setTimeout(tryPush, 500);
    return () => clearTimeout(t);
  }, [client, slot, consent, isTest]);

  const outerClasses = `
    ${position === 'bottom' ? 'left-0 right-0 md:fixed md:bottom-0' : ''}
    ${position === 'top' ? 'w-full' : ''}
    ${position === 'sidebar' ? 'w-full md:w-64' : ''}
    bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700
    ${className}
  `;

  const minHeightStyle = position === 'bottom' ? (isDev ? '100px' : '100px') : 'auto';

  return (
    <div className={outerClasses} style={{ minHeight: position === 'bottom' ? minHeightStyle : 'auto' }}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-center">
        {client && slot && consent === 'granted' ? (
          <div ref={adRef} className="w-full flex items-center justify-center">
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client={client}
              data-ad-slot={slot}
              data-ad-format="auto"
              data-full-width-responsive="true"
              {...(isTest ? { 'data-adtest': 'on' } : {})}
            />
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            <p className="text-xs">Espaço para anúncios</p>
            <div className="mt-2 w-full h-16 bg-gray-200 dark:bg-gray-700 rounded flex flex-col items-center justify-center">
              <span className="text-xs text-gray-400">320x100</span>
              <small className="text-xs text-gray-400 mt-1">Configure VITE_ADSENSE_CLIENT e VITE_ADSENSE_SLOT e aceite anúncios</small>
            </div>
          </div>
        )}
      </div>
      <ConsentBanner />
    </div>
  );
}
