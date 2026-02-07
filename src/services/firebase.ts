import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Configuração do Firebase - SUBSTITUA com suas credenciais
// Obtenha em: https://console.firebase.google.com/ → Configurações do Projeto → Seus aplicativos
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKey123456789-SUBSTITUA_ESTA_CHAVE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "seu-projeto.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "seu-projeto-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "seu-projeto.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

/**
 * Inicializa o Firebase
 * Retorna null se as credenciais não estiverem configuradas corretamente
 */
export const initializeFirebase = (): { app: FirebaseApp | null; db: Firestore | null } => {
  // Verificar se as credenciais foram substituídas (não são mais os valores padrão)
  const isConfigured = 
    firebaseConfig.apiKey && 
    !firebaseConfig.apiKey.includes('SUBSTITUA') &&
    !firebaseConfig.apiKey.includes('Demo') &&
    firebaseConfig.projectId && 
    firebaseConfig.projectId !== 'seu-projeto-id';

  if (!isConfigured) {
    console.warn(
      '⚠️ Firebase não configurado!\n' +
      'Para habilitar compartilhamento de quizzes:\n' +
      '1. Acesse: https://console.firebase.google.com/\n' +
      '2. Crie um projeto e ative o Firestore\n' +
      '3. Copie as credenciais para src/services/firebase.ts\n' +
      '4. Ou adicione no arquivo .env\n\n' +
      'Veja instruções completas em: COMPARTILHAMENTO_QUIZ.md'
    );
    return { app: null, db: null };
  }

  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      console.log('✅ Firebase inicializado com sucesso! Compartilhamento de quizzes ativado.');
    }
    return { app, db };
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    return { app: null, db: null };
  }
};

/**
 * Retorna a instância do Firestore
 */
export const getFirestoreInstance = (): Firestore | null => {
  if (!db) {
    const { db: newDb } = initializeFirebase();
    return newDb;
  }
  return db;
};

/**
 * Verifica se o Firebase está configurado e disponível
 */
export const isFirebaseAvailable = (): boolean => {
  const firestore = getFirestoreInstance();
  return firestore !== null;
};
