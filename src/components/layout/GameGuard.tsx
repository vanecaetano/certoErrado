import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getConsent } from '@/services/consent';

interface GameGuardProps {
  children: ReactNode;
}

export function GameGuard({ children }: GameGuardProps) {
  const consent = getConsent();
  const location = useLocation();

  // Only allow access if user explicitly accepted ads
  if (consent.ads !== 'personalized' && consent.ads !== 'non_personalized') {
    return <Navigate to="/" state={{ from: location, blockedReason: 'consent_required' }} replace />;
  }

  return <>{children}</>;
}

export default GameGuard;
