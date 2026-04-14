// =====================================================================
// Vetor — TEMPLATE de configuração
// ---------------------------------------------------------------------
// Copie este arquivo para `environment.ts` (mesma pasta) e preencha os
// valores reais. O `environment.ts` está no .gitignore — nunca commite.
//
// Onde achar a `firebaseConfig`:
//   Firebase Console -> (seu projeto) -> Configurações do projeto
//   -> Seus apps -> Config
// =====================================================================

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: 'COLE_AQUI_SUA_API_KEY',
    authDomain: 'SEU_PROJETO.firebaseapp.com',
    projectId: 'SEU_PROJECT_ID',
    storageBucket: 'SEU_PROJETO.appspot.com',
    messagingSenderId: 'SEU_MESSAGING_SENDER_ID',
    appId: 'SEU_APP_ID'
  },
  // Senha única que todos os usuários da equipe devem usar para entrar.
  boardPassword: 'troque-esta-senha'
};
