#!/usr/bin/env node
/* Gera src/environments/environment.ts a partir das variáveis de ambiente.
   Usado no build do Vercel (onde o environment.ts não é versionado). */

const fs = require('fs');
const path = require('path');

const target = path.resolve(__dirname, '..', 'src', 'environments', 'environment.ts');

if (fs.existsSync(target) && !process.env['CI'] && !process.env['VERCEL']) {
  console.log('[generate-env] environment.ts já existe localmente — mantendo.');
  process.exit(0);
}

const required = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
  'BOARD_PASSWORD'
];

const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('[generate-env] Variáveis ausentes:', missing.join(', '));
  process.exit(1);
}

const content = `// Gerado automaticamente por scripts/generate-env.js — NÃO EDITAR.
export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: ${JSON.stringify(process.env['FIREBASE_API_KEY'])},
    authDomain: ${JSON.stringify(process.env['FIREBASE_AUTH_DOMAIN'])},
    projectId: ${JSON.stringify(process.env['FIREBASE_PROJECT_ID'])},
    storageBucket: ${JSON.stringify(process.env['FIREBASE_STORAGE_BUCKET'])},
    messagingSenderId: ${JSON.stringify(process.env['FIREBASE_MESSAGING_SENDER_ID'])},
    appId: ${JSON.stringify(process.env['FIREBASE_APP_ID'])}
  },
  boardPassword: ${JSON.stringify(process.env['BOARD_PASSWORD'])}
};
`;

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, content, 'utf8');
console.log('[generate-env] environment.ts gerado com sucesso.');
