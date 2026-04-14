# Vetor

Vetor é um board de alocação em tempo real que construí para gerir a equipe de engenharia que lidero no desenvolvimento de um SaaS. Como gestor, precisava de uma forma rápida e honesta de visualizar onde cada pessoa está atuando agora — desenvolvimento, suporte, reunião, estudo, infraestrutura — sem reuniões de status, sem planilhas, sem ferramentas pesadas. O Vetor é a resposta a essa necessidade: um único board kanban, drag-and-drop, sincronizado em tempo real entre toda a equipe.

O projeto também é um exercício deliberado de execução: front-end moderno em Angular 17, backend zero, sincronização realtime via Firestore, deploy contínuo no Vercel, e um padrão de design intencionalmente minimalista. Da decisão arquitetural ao último detalhe de tipografia, tudo aqui é uma escolha consciente.

---

## Decisões de arquitetura

| Decisão | Por quê |
|---|---|
| **Sem backend próprio** | Eliminei toda a superfície operacional. O front-end conversa direto com o Firestore via SDK oficial; não há servidor para manter, escalar ou monitorar. |
| **Firestore com `onSnapshot`** | Sincronização em tempo real nativa. Toda mutação é propagada para todos os clientes conectados em milissegundos, sem WebSocket próprio nem polling. |
| **Update otimista** | A UI reflete a mudança no instante em que o usuário solta o card; a confirmação do Firestore vem em segundo plano. Latência percebida ≈ 0. |
| **Autenticação por senha única** | A equipe é pequena e confiável; o overhead de gerenciar usuários individuais não se justifica. A senha mora em `environment.ts` (fora do versionamento) e a sessão persiste em `sessionStorage`. |
| **Standalone components + signals** | Sem `NgModules`, sem `BehaviorSubject` para estado. O modelo de signals do Angular 17 dá change detection granular e leitura natural. |
| **`OnPush` por padrão** | Todos os componentes usam `ChangeDetectionStrategy.OnPush`. Combinado com signals, o framework só re-renderiza o que mudou. |
| **Design system inline** | Sem dependência de UI kit. Todas as cores, espaçamentos e tipografia vivem em variáveis CSS no `styles.scss` global. Manutenção previsível, bundle enxuto. |

## Stack

- **Angular 17** (standalone components, signals, control flow nativo `@if`/`@for`)
- **Firebase Firestore** para persistência e sincronização realtime
- **`@angular/cdk/drag-drop`** para o kanban
- **`@ng-icons/lucide`** — biblioteca de ícones SVG (zero emojis em qualquer lugar do produto)
- **TypeScript 5.4**, modo `strict` total, incluindo `strictTemplates`
- **SCSS** com variáveis CSS custom para tema e cores por coluna
- **Vercel** para hospedagem estática + deploy contínuo

## Modelo de dados

Coleção única no Firestore (`members`):

```ts
interface Member {
  id:          string;   // doc id (gerado pelo Firestore)
  name:        string;
  column:      string;   // 'desenvolvimento' | 'comercial' | 'infra' | ...
  description: string;   // texto livre — no que está trabalhando agora
  avatar:      string;   // primeira letra do nome
  createdAt:   number;   // epoch ms — usado para ordenação estável
}
```

As 8 colunas (Desenvolvimento, Comercial, Infra, Estudo, Reunião, Suporte, Gestão, Disponível) são fixas e ficam declaradas em [src/app/config/columns.ts](src/app/config/columns.ts) — fonte única da verdade para id, label, ícone e cor de destaque.

## Estrutura

```
src/app/
├── components/
│   ├── login/          login por senha única, animação de entrada
│   ├── board/          orquestração do kanban e estado do modal
│   ├── column/         drop list do CDK, header com contador
│   ├── member-card/    drag handle, avatar, descrição truncada
│   └── member-modal/   edição inline com backdrop blur
├── services/
│   ├── firebase.service.ts   bootstrap do app Firebase
│   ├── members.service.ts    signals + onSnapshot + updates otimistas
│   ├── auth.service.ts       senha única + sessionStorage
│   └── auth.guard.ts         CanActivateFn funcional
├── config/columns.ts         declaração das 8 colunas
└── models/member.model.ts    interface tipada
```

## Princípios de design

A interface foi construída em torno de quatro princípios:

- **Tema escuro como base.** `#0A0A0A` no fundo, `#111` em superfícies, `#1A1A1A` em cards. Cada coluna recebe uma cor de destaque (azul, âmbar, esmeralda, violeta…), mas usada com parcimônia — só um traço de 1px e o avatar tingido com baixa opacidade.
- **Tipografia precisa.** Inter para a UI, JetBrains Mono para detalhes técnicos (contadores, metadados). `font-feature-settings` ativando variantes que melhoram leitura em telas escuras.
- **Espaço sobre densidade.** Colunas de 260px com folga interna; cards com hierarquia tipográfica clara entre nome e descrição.
- **Zero emojis.** Toda iconografia é SVG, via Lucide. Decisão estética, mas também acessibilidade e consistência cross-platform.

## Setup

Instruções operacionais (Firebase, deploy no Vercel, troca de senha) estão em [SETUP.md](SETUP.md).

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
# preencher firebaseConfig e boardPassword
npm install
npm start
```

## Não-objetivos

Algumas escolhas conscientes do que **não** entrou no escopo:

- **Histórico de movimentações.** O board reflete o agora. Auditoria não é objetivo.
- **Permissões granulares.** Quem tem a senha pode tudo. A equipe é pequena e confiável.
- **Notificações.** Sincronização realtime já basta — quem está com o board aberto vê.
- **Mobile-first.** É uma ferramenta de gestor, usada em desktop. O layout é responsivo o suficiente para tablets, mas não é prioridade.

---

Construído por [Pedro Di Oliveira](https://github.com/PedroDiOliveira) durante a operação de uma equipe de engenharia em desenvolvimento de SaaS.
