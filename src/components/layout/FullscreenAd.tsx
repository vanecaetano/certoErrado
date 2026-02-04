import { useState } from 'react';
import { getConsent } from '@/services/consent';

interface FullscreenAdProps {
  onClose: () => void;
}

export function FullscreenAd({ onClose }: FullscreenAdProps) {
  const consent = getConsent();
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  // If user denied or never accepted ads, immediately close
  if (consent.ads === 'denied' || consent.ads === 'unknown') {
    onClose();
    return null;
  }

  const handleClose = () => {
    setVisible(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-3xl p-6 text-center">
        <h3 className="text-xl font-bold mb-4">Patrocinado</h3>
        <div className="mb-4">
          {/* Placeholder ad area. Replace with real interstitial from your ad provider. */}
          <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
            <span className="text-gray-500">Anúncio de página inteira</span>
          </div>
        </div>
        <div className="flex justify-center">
          <button className="px-4 py-2 rounded bg-primary-600 text-white" onClick={handleClose}>Fechar anúncio</button>
        </div>
      </div>
    </div>
  );
}

export default FullscreenAd;
