import { ReactNode } from 'react';

interface GameGuardProps {
  children: ReactNode;
}

export function GameGuard({ children }: GameGuardProps) {
  // Consent is now managed by Google CMP, allow all access
  return <>{children}</>;
}

export default GameGuard;
