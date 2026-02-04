interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Carregando próxima pergunta...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 flex flex-col items-center gap-4">
        <div className="loader w-12 h-12 rounded-full border-4 border-t-primary-600 border-gray-200 animate-spin" />
        <div className="text-sm text-gray-700 dark:text-gray-300">{message}</div>
      </div>
    </div>
  );
}

export default LoadingOverlay;
