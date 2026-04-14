# Vetor — Setup

Board de alocação da equipe estilo Kanban. Tempo real via Firestore, sem backend próprio.

---

## 1. Criar projeto no Firebase Console

1. Acesse [console.firebase.google.com](https://console.firebase.google.com/) e clique em **Adicionar projeto**.
2. Dê um nome (ex: `vetor-board`) e siga o assistente. Pode desativar Google Analytics.
3. No painel do projeto, em **Visão geral do projeto**, clique no ícone **Web (`</>`)** para registrar um app web.
4. Dê um apelido (ex: `vetor-web`) e clique em **Registrar app**. Não precisa adicionar Hosting agora.
5. Copie o objeto `firebaseConfig` que aparece. Algo como:

   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "vetor-board.firebaseapp.com",
     projectId: "vetor-board",
     storageBucket: "vetor-board.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123:web:abc"
   };
   ```

6. Copie [src/environments/environment.example.ts](src/environments/environment.example.ts) para `src/environments/environment.ts` e cole os valores reais. O `environment.ts` está no `.gitignore` — nunca o commite.

---

## 2. Ativar Firestore e aplicar as regras

1. No menu lateral do Firebase Console, vá em **Firestore Database** → **Criar banco de dados**.
2. Escolha **Iniciar em modo de produção** e selecione a região mais próxima (ex: `southamerica-east1`).
3. Aguarde a criação. Vá na aba **Regras** e cole o conteúdo de [firestore.rules](firestore.rules):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

4. Clique em **Publicar**.

> **Atenção:** Essas regras liberam leitura e escrita pública. Como o app usa senha única no front-end, isso é aceitável para uso interno. Para qualquer cenário sensível, restrinja as regras (ex: por App Check ou autenticação).

A coleção `members` é criada automaticamente quando você adicionar o primeiro membro pelo app.

---

## 3. Rodar localmente

```bash
npm install
npm start
```

A aplicação fica disponível em [http://localhost:4200](http://localhost:4200).

A tela de login pede a senha definida em `boardPassword` no `src/environments/environment.ts` local.

---

## 4. Deploy gratuito no Vercel

1. Faça push do repositório no GitHub.
2. Acesse [vercel.com](https://vercel.com/) e clique em **Add New → Project**.
3. Importe o repositório do Vetor.
4. O Vercel detecta o `vercel.json` automaticamente. Os campos devem ficar:
   - **Framework Preset:** Other
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/vetor/browser`
5. Clique em **Deploy**. Pronto — você terá uma URL pública (`https://vetor-xxx.vercel.app`).

> Cada push na branch principal dispara um novo deploy automaticamente.

---

## 5. Trocar a senha do board

Edite o campo `boardPassword` em [src/environments/environment.ts](src/environments/environment.ts):

```ts
export const environment = {
  // ...
  boardPassword: 'minha-nova-senha'
};
```

Faça commit e push. O Vercel reimplanta. Todas as sessões ativas continuam válidas até o usuário fazer logout (a sessão fica salva em `sessionStorage` e não consulta a senha após o login).

---

## Estrutura de dados (Firestore)

Coleção: `members`

```
{
  name:        string,   // "Pedro"
  column:      string,   // "desenvolvimento" | "comercial" | "infra" | "estudo" | "reuniao" | "suporte" | "gestao" | "disponivel"
  description: string,   // texto livre do que está fazendo
  avatar:      string,   // primeira letra do nome em maiúsculo
  createdAt:   number    // timestamp em ms
}
```

O Vetor escuta a coleção via `onSnapshot`, então toda mudança aparece em tempo real para todos os usuários conectados.
