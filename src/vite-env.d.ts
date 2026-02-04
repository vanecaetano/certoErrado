/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_CLAUDE_API_KEY?: string; // Mantido para compatibilidade
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
