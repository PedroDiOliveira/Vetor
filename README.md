# Vetor

Board de alocação da equipe estilo Kanban com drag and drop. Sincronização em tempo real via Firebase Firestore — sem backend próprio.

## Stack

- Angular 17 (standalone components, signals)
- Firebase Firestore (`onSnapshot`)
- `@angular/cdk/drag-drop`
- `@ng-icons/lucide` — apenas SVG, zero emojis
- Tema escuro minimalista (Inter + JetBrains Mono)

## Funcionalidades

- Login por senha única (definida em `environment.ts`, persistida em `sessionStorage`).
- Drag and drop entre 8 colunas fixas: Desenvolvimento, Comercial, Infra, Estudo, Reunião, Suporte, Gestão, Disponível.
- Card por membro com nome, descrição editável e avatar gerado da inicial.
- Atualização otimista no front + persistência em tempo real para todos os usuários conectados.
- Adicionar e remover membros direto do board.

## Como rodar

Veja [SETUP.md](SETUP.md) para o passo a passo completo (Firebase, deploy no Vercel, troca de senha).

```bash
npm install
npm start
```
