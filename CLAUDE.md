# CLAUDE.md — Recepção IA

> Guia oficial de engenharia para qualquer agente de IA (Claude Code) ou desenvolvedor que atue neste repositório.
> **Leia este documento por completo antes de qualquer alteração.** As regras aqui descritas são obrigatórias.

---

## 1. Visão Geral do Produto

**Recepção IA** é uma plataforma **SaaS de recepção virtual com Inteligência Artificial**, voltada para clínicas, consultórios, empresas e prestadores de serviço.

A plataforma automatiza o primeiro atendimento, qualifica leads, agenda consultas, responde clientes via WhatsApp e centraliza a gestão comercial (CRM, agenda, financeiro e insights) em um único painel.

### Proposta de valor
- **Atendimento 24/7** com IA que responde, qualifica e agenda automaticamente.
- **CRM integrado** para acompanhar leads do primeiro contato ao fechamento.
- **Multicanal**, com foco inicial no WhatsApp Business.
- **Multi-tenant** (cada clínica/empresa é um cliente isolado da plataforma).

---

## 2. Estado Atual do Projeto

> O projeto está na fase de **frontend / protótipo navegável**. Não há backend real ainda — os dados vêm de mocks (`src/data/`) e o `axios` aponta para um backend local ainda inexistente.

- **Frontend:** funcional, com landing page pública e painel administrativo (dashboard).
- **Backend:** **ainda não implementado** (planejado — ver Roadmap).
- **Integrações:** **ainda não implementadas** (planejadas — ver Roadmap).
- **Deploy atual:** GitHub Pages (estático), via `gh-pages` e `HashRouter`.

---

## 3. Stack Tecnológica

### Atual (implementada)
| Camada | Tecnologia | Versão |
| --- | --- | --- |
| Biblioteca UI | React | 19 |
| Build / Dev server | Vite | 8 |
| Estilização | Tailwind CSS | 4 (via `@tailwindcss/vite`) |
| Roteamento | React Router DOM | 7 (`HashRouter`) |
| HTTP client | Axios | 1 |
| Ícones | react-icons | 5 |
| Deploy estático | gh-pages | 6 |

### Futura (planejada — ainda NÃO presente no código)
- **Backend:** Node.js, Express
- **ORM / Banco:** Prisma + PostgreSQL
- **Autenticação:** JWT
- **Containers:** Docker
- **Automação:** n8n
- **IA:** OpenAI
- **Mensageria:** WhatsApp Business Cloud API
- **Agenda:** Google Calendar
- **Pagamentos:** Mercado Pago, Stripe
- **Integração odontológica:** Dental Office API

> ⚠️ Ao implementar qualquer item "futuro", **proponha a estrutura antes de codar** e siga o Roadmap (seção 12).

---

## 4. Estrutura de Diretórios

```
recepcao-ia/
├── public/                  # Estáticos (favicon, ícones, política de privacidade)
├── src/
│   ├── assets/              # Imagens e SVGs importados
│   ├── components/          # Componentes reutilizáveis (UI compartilhada)
│   ├── data/                # Dados mockados (ex.: leads.js)
│   ├── hooks/               # Custom hooks (useLeads, useConfiguracoes)
│   ├── pages/               # Páginas/telas conectadas às rotas
│   ├── services/            # Camada de acesso à API (axios)
│   ├── utils/               # Funções utilitárias puras (formatadores, helpers)
│   ├── App.jsx              # Definição das rotas (NÃO alterar sem justificar)
│   ├── main.jsx             # Bootstrap React (StrictMode)
│   ├── index.css            # Estilos globais / Tailwind
│   └── App.css              # Estilos globais adicionais
├── index.html
├── vite.config.js           # NÃO alterar sem justificar
├── package.json             # NÃO alterar sem justificar
└── eslint.config.js
```

### Responsabilidade de cada camada
- **`components/`** — UI reutilizável e sem regra de negócio (`Button`, `Card`, `Modal`, `DataTable`, `Sidebar`, `Topbar`, `Toast`, etc.). **Sempre reutilizar estes componentes antes de criar novos.**
- **`pages/`** — telas compostas a partir de componentes; conectadas às rotas em `App.jsx`.
- **`hooks/`** — lógica de estado reaproveitável.
- **`services/`** — toda comunicação HTTP passa por aqui (nunca chamar `axios` direto numa página).
- **`utils/`** — funções puras e testáveis (ex.: `formatDate`, `formatPhone`, `getStatusColor`).
- **`data/`** — mocks temporários, substituídos pela API real conforme o backend evoluir.

---

## 5. Rotas (`src/App.jsx`)

Usa **`HashRouter`** (necessário para o GitHub Pages servir SPA estática).

| Rota | Página | Tipo |
| --- | --- | --- |
| `/` | Home | Pública (landing) |
| `/login` | Login | Pública |
| `/cadastro` | Cadastro | Pública |
| `/recuperar-senha` | RecuperarSenha | Pública |
| `/dashboard` | Dashboard | Painel |
| `/crm` | CRM | Painel |
| `/lead/:id` | LeadDetails | Painel |
| `/novo-lead` | NovoLead | Painel |
| `/editarlead/:id` | EditarLead | Painel |
| `/insights` | Insights | Painel |
| `/whatsapp` | WhatsApp | Painel |
| `/agenda` | Agenda | Painel |
| `/financeiro` | Financeiro | Painel |
| `/configuracoes` | Configuracoes | Painel |
| `/perfil` | Perfil | Painel |

---

## 6. Convenções de Código

Padrões observados no código atual — **mantenha consistência**:

- **Componentes:** função nomeada + `export default` no final do arquivo. Um componente por arquivo.
- **Hooks/Services/Utils:** **named exports** (`export function ...`).
- **Nomenclatura:** componentes e páginas em `PascalCase`; hooks em `camelCase` com prefixo `use`; arquivos de página em `PascalCase.jsx`.
- **Idioma:** nomes de domínio em **português** (Leads, Agenda, Financeiro); evite misturar idiomas dentro de um mesmo conceito.
- **Estilização:** **somente Tailwind** via classes utilitárias. Componentes de UI (ex.: `Button`) centralizam variações por props (`color`, `className`), evitando estilos duplicados.
- **HTTP:** sempre via `services/` usando a instância `api` de `src/services/api.js`. Funções de serviço retornam `response.data`.
- **Imports:** caminhos relativos. Mantenha o agrupamento existente (libs externas primeiro, depois internas).

---

## 7. Regras Obrigatórias (NÃO NEGOCIÁVEIS)

Estas regras se aplicam a **todo agente de IA e desenvolvedor**:

1. **Nunca alterar o layout sem autorização explícita** do mantenedor.
2. **Nunca remover componentes existentes.**
3. **Sempre reutilizar componentes** já existentes antes de criar novos.
4. **Sempre aplicar Clean Code** (nomes claros, funções pequenas, sem código morto).
5. **Sempre seguir SOLID** sempre que possível.
6. **Sempre documentar alterações importantes** (neste arquivo e/ou no commit).
7. **Nunca criar código duplicado** — extraia para `components/`, `hooks/` ou `utils/`.
8. **Nunca modificar `package.json`, `vite.config.js` ou `App.jsx` sem justificar** a mudança ao mantenedor.
9. **Sempre mostrar quais arquivos serão alterados ANTES da implementação.**
10. **Sempre implementar apenas UMA funcionalidade por vez.**
11. **Sempre sugerir testes antes do commit.**

### Fluxo de trabalho obrigatório para o agente
Antes de escrever qualquer código, o agente **deve**:
1. Explicar **o que** será feito e **por quê**.
2. Listar **todos os arquivos** que serão criados ou alterados.
3. Confirmar que **nenhuma regra acima** será violada (ou solicitar autorização quando necessário).
4. Implementar **uma única funcionalidade**.
5. **Sugerir os testes** correspondentes antes de propor o commit.

---

## 8. Comandos

```bash
npm install        # Instala dependências
npm run dev        # Ambiente de desenvolvimento (Vite)
npm run build      # Build de produção (gera /dist)
npm run preview    # Pré-visualiza o build localmente
npm run deploy     # Publica /dist no GitHub Pages (gh-pages)
```

> Ainda **não há suite de testes configurada**. Ao introduzir testes, padronize com **Vitest + React Testing Library** (alinhado ao Vite) e documente o comando aqui.

---

## 9. Frontend (detalhamento)

- Painel administrativo composto por `Layout` + `Sidebar` + `Topbar`.
- Componentes de dados: `DataTable`, `Pagination`, `SearchBar`, `EmptyState`, `StatCard`, `Badge`, `Loading`, `Modal`, `Toast`.
- Estado de leads gerenciado hoje por `useLeads` sobre mocks (`src/data/leads.js`) — deverá migrar para os `services/` quando a API existir.
- **Padrão de migração mock → API:** manter a assinatura dos hooks/serviços estável; trocar a fonte de dados sem alterar a UI.

---

## 10. Backend (planejado)

> Ainda não existe. Diretrizes para quando for implementado:

- **Stack:** Node.js + Express, organizado em camadas (routes → controllers → services → repositories).
- **ORM:** Prisma com PostgreSQL; migrations versionadas.
- **Auth:** JWT (access + refresh), com middleware de autorização por tenant/role.
- **Arquitetura:** multi-tenant desde o início (cada cliente isolado por `tenantId`).
- **Validação:** camada de validação de entrada (ex.: Zod) antes dos controllers.
- **Estrutura sugerida:** repositório separado ou pasta `server/` na raiz — **a definir e justificar com o mantenedor antes de criar**.

---

## 11. Integrações (planejadas)

| Integração | Finalidade |
| --- | --- |
| **OpenAI** | Motor de IA da recepção virtual (respostas, qualificação, triagem). |
| **WhatsApp Business Cloud API** | Canal principal de atendimento. |
| **Google Calendar** | Sincronização e agendamento de consultas. |
| **Motor de Automações** | Módulo agnóstico de webhooks de saída por tenant (múltiplos webhooks, cada um assinado com HMAC próprio e inscrito num subconjunto de eventos de domínio: `lead.created`, `lead.updated`, `conversation.created`, `message.received`, `message.sent`, e futuramente `appointment.created`/`payment.paid`). Não depende de um consumidor específico — **n8n é apenas um exemplo** de destino possível, junto de Zapier, Make, Power Automate, Google Apps Script, APIs próprias, ERPs, Dental Office etc. Fase A (`AutomationWebhook`, CRUD, validação de SSRF, soft delete), Fase B (emissor de eventos de domínio via `domainEvents`, disparo/fan-out com `automationDispatchService`, HMAC por webhook, retries com backoff, `AutomationDispatchLog`) e Fase C (seção "Motor de Automações — Webhooks Personalizados" em `Configuracoes.jsx`: CRUD de webhooks, painel-resumo de 24h, teste manual, logs paginados com filtro Sucesso/Falha, exemplo de payload copiável) concluídas. |
| **Mercado Pago** | Pagamentos e assinaturas (mercado BR). |
| **Stripe** | Pagamentos e assinaturas (internacional). |
| **Dental Office API** | Integração com software de gestão odontológica. |

> Toda integração deve viver atrás da camada `services/` (frontend) e de adapters dedicados (backend). **Nunca** expor segredos/keys no frontend — usar variáveis de ambiente no backend.

---

## 12. Banco de Dados (planejado)

- **SGBD:** PostgreSQL.
- **ORM:** Prisma (`schema.prisma` como fonte da verdade do modelo).
- **Entidades iniciais previstas:** `Tenant`, `User`, `Lead`, `Appointment`, `Conversation`, `Message`, `Plan`, `Subscription`, `Payment`.
- **Princípios:** chaves estrangeiras explícitas, `tenantId` em entidades de negócio, timestamps (`createdAt`/`updatedAt`), soft delete onde fizer sentido.

---

## 13. Deploy

### Atual
- **GitHub Pages** (estático) via `npm run deploy` (`gh-pages -d dist`).
- `vite.config.js` usa `base: "/recepcao-ia/"` e o app usa `HashRouter` — **ambos necessários** para funcionar no Pages.

### Futuro
- **Docker** para frontend + backend + banco (docker-compose em dev).
- Frontend em CDN/hosting estático; backend em provedor com PostgreSQL gerenciado.
- Pipeline CI/CD (lint → testes → build → deploy).

---

## 14. Roadmap Técnico (SaaS Comercial)

Plano evolutivo para transformar o protótipo atual em um produto SaaS comercial.

### Fase 0 — Fundação Frontend ✅ (em andamento)
- [x] Landing page pública.
- [x] Painel administrativo navegável (CRM, Agenda, Financeiro, Insights, WhatsApp).
- [x] Camada `services/` com Axios pronta para integração.
- [ ] Configurar **Vitest + React Testing Library** e primeiros testes.
- [ ] Variáveis de ambiente no frontend (`.env`) para `baseURL` da API.

### Fase 1 — Backend & Autenticação
- [ ] API Node.js + Express estruturada em camadas.
- [ ] Prisma + PostgreSQL com modelo inicial e migrations.
- [ ] Autenticação JWT (login, cadastro, recuperação de senha) — conectar páginas existentes.
- [ ] Arquitetura **multi-tenant** com isolamento por `tenantId`.
- [ ] Substituir mocks (`src/data/`) por dados reais via `services/`.

### Fase 2 — Núcleo de IA & Atendimento
- [ ] Integração **OpenAI** (recepção virtual: respostas, qualificação, triagem).
- [ ] Integração **WhatsApp Business Cloud API** (webhooks de entrada/saída).
- [ ] Orquestração de fluxos com **n8n**.
- [ ] Histórico de conversas persistido (`Conversation`, `Message`).

### Fase 3 — Agendamento
- [ ] Integração **Google Calendar** (criação/sincronização de consultas).
- [ ] Tela de Agenda conectada ao backend e ao calendário.
- [ ] Confirmações e lembretes automáticos via WhatsApp.

### Fase 4 — Monetização
- [ ] Planos e assinaturas (`Plan`, `Subscription`).
- [ ] Integração **Mercado Pago** (BR) e **Stripe** (internacional).
- [ ] Controle de limites por plano (feature gating).
- [ ] Tela de Financeiro conectada a pagamentos reais.

### Fase 5 — Verticais & Integrações
- [ ] Integração **Dental Office API** (vertical odontológico).
- [ ] Insights/relatórios analíticos baseados em dados reais.

### Fase 6 — Produção & Escala
- [ ] **Docker** + docker-compose; pipeline CI/CD (lint → testes → build → deploy).
- [ ] Observabilidade (logs, métricas, alertas).
- [ ] Segurança: rate limiting, validação de entrada, gestão de segredos, LGPD.
- [ ] Cobertura de testes (unitários, integração, e2e).

---

## 15. Definition of Done (checklist por entrega)

- [ ] Apenas **uma funcionalidade** implementada.
- [ ] Arquivos alterados **listados e aprovados** antes da implementação.
- [ ] **Nenhuma regra** da seção 7 violada.
- [ ] Componentes **reutilizados**; nada duplicado.
- [ ] **Clean Code** e **SOLID** respeitados.
- [ ] Alteração relevante **documentada** (CLAUDE.md e/ou commit).
- [ ] **Testes sugeridos** (ou implementados) antes do commit.
- [ ] `npm run build` executa sem erros.

---

## 16. Padrão de Variáveis de Ambiente

Segredos e configurações **nunca** ficam hardcoded no código nem versionados.

### Regras gerais
- **`.env` nunca é commitado.** Manter sempre um **`.env.example`** versionado, com todas as chaves e valores fictícios/placeholder.
- Cada serviço (frontend e futuro backend) tem o **seu próprio** `.env`.
- Toda nova variável deve ser **documentada** neste arquivo e adicionada ao `.env.example`.

### Como usar o `.env.example`
O repositório versiona um **`.env.example`** na raiz como **fonte da verdade** de todas as variáveis usadas no projeto (frontend e backend futuro), organizado por categorias e com comentários explicando cada chave.

1. **Copie** o arquivo para criar o seu `.env` local:
   ```bash
   cp .env.example .env        # Linux/macOS
   copy .env.example .env      # Windows (cmd)
   Copy-Item .env.example .env # Windows (PowerShell)
   ```
2. **Preencha** os valores reais no `.env` (os do `.env.example` são apenas placeholders seguros).
3. **Nunca** edite o `.env.example` com segredos reais — ele contém apenas exemplos.
4. Ao **adicionar uma nova variável** no código, adicione-a também ao `.env.example` (na categoria correta, com comentário) e documente aqui.
5. Garanta que **`.env` está no `.gitignore`** antes de qualquer commit.

> Categorias presentes no `.env.example`: **Frontend**, **Backend**, **Banco de Dados**, **Autenticação**, **OpenAI**, **WhatsApp Business Cloud API**, **Meta**, **Google Calendar**, **Dental Office API**, **Mercado Pago**, **Stripe**, **n8n**, **Email (SMTP)**, **Uploads** e **Logs**. A maioria pertence ao **backend futuro** — só as variáveis com prefixo `VITE_` são lidas pelo frontend hoje.

### Frontend (Vite)
- Apenas variáveis com prefixo **`VITE_`** são expostas ao bundle.
- Acessadas via `import.meta.env.VITE_*`.
- ⚠️ **Tudo que tem prefixo `VITE_` é público** (vai para o navegador). **Nunca** colocar segredos aqui (API keys de OpenAI, tokens de WhatsApp, chaves do Mercado Pago/Stripe, etc.).

```bash
# .env (frontend) — exemplo
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_ENV=development
```

> Hoje a `baseURL` está hardcoded em `src/services/api.js`. Ao migrar para `.env`, use `import.meta.env.VITE_API_BASE_URL` com fallback — **alteração de `api.js` deve ser proposta e justificada antes**.

### Backend (futuro)
- Segredos sensíveis vivem **apenas** no backend, nunca expostos ao frontend.

```bash
# .env (backend) — exemplo
DATABASE_URL=postgresql://user:pass@localhost:5432/recepcao_ia
JWT_SECRET=troque-por-um-segredo-forte
JWT_REFRESH_SECRET=troque-por-outro-segredo-forte
OPENAI_API_KEY=sk-...
WHATSAPP_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_VERIFY_TOKEN=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
MERCADOPAGO_ACCESS_TOKEN=...
STRIPE_SECRET_KEY=...
DENTAL_OFFICE_API_KEY=...
```

### Convenção de nomes
- `UPPER_SNAKE_CASE`.
- Agrupar por domínio (`WHATSAPP_*`, `GOOGLE_*`, `STRIPE_*`).
- Validar a presença das variáveis obrigatórias no startup (futuro backend) e falhar rápido se faltar.

---

## 17. Convenção de Commits

Adotar **Conventional Commits**, em **português**, no imperativo e com escopo opcional.

### Formato
```
<tipo>(<escopo opcional>): <descrição curta no imperativo>

<corpo opcional explicando o porquê>

<rodapé opcional: BREAKING CHANGE, refs>
```

### Tipos
| Tipo | Uso |
| --- | --- |
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Documentação (ex.: este CLAUDE.md) |
| `style` | Formatação/estilo sem mudança de lógica |
| `refactor` | Refatoração sem mudar comportamento |
| `test` | Adição/ajuste de testes |
| `chore` | Tarefas de build, config, dependências |
| `perf` | Melhoria de performance |
| `ci` | Pipeline/CI |

### Exemplos
```
feat(crm): adiciona filtro de leads por status
fix(agenda): corrige fuso horário na criação de evento
docs(claude): adiciona seção de segurança e glossário
refactor(services): centraliza tratamento de erro do axios
```

### Regras
- **Um commit = uma mudança coerente** (alinhado a "uma funcionalidade por vez").
- Descrição **curta** (≤ 72 caracteres) no título.
- Explicar **o porquê** no corpo quando a mudança não for óbvia.
- Mudanças incompatíveis: marcar `BREAKING CHANGE:` no rodapé.
- Nunca commitar segredos, `.env`, `node_modules` ou `dist`.

---

## 18. Glossário de Domínio

Vocabulário oficial do produto — **use estes termos** no código e na comunicação.

| Termo | Definição |
| --- | --- |
| **Tenant** | Cliente da plataforma (clínica, consultório, empresa). Unidade de isolamento multi-tenant. |
| **Usuário (User)** | Pessoa que acessa o painel dentro de um Tenant (admin, recepcionista, etc.). |
| **Lead** | Contato/potencial cliente captado pela recepção virtual; entidade central do CRM. |
| **Recepção IA** | O agente de IA que atende, qualifica e direciona o contato automaticamente. |
| **Qualificação** | Processo (manual ou via IA) de avaliar o quão pronto um Lead está para fechar. |
| **Conversa (Conversation)** | Thread de mensagens entre o Lead e a Recepção IA em um canal. |
| **Mensagem (Message)** | Unidade individual de uma Conversa (entrada ou saída). |
| **Agendamento (Appointment)** | Consulta/compromisso marcado, sincronizável com o Google Calendar. |
| **Canal** | Meio de atendimento (inicialmente WhatsApp). |
| **CRM** | Módulo de gestão de Leads e do funil comercial. |
| **Funil / Pipeline** | Estágios pelos quais um Lead passa até o fechamento. |
| **Plano (Plan)** | Pacote comercial de assinatura da plataforma. |
| **Assinatura (Subscription)** | Vínculo de um Tenant a um Plano. |
| **Insights** | Relatórios e métricas analíticas sobre Leads, atendimento e conversão. |
| **Motor de Automações** | Módulo que dispara eventos de domínio (`lead.created`, `message.sent` etc.) como webhooks HTTP assinados para sistemas externos definidos pelo próprio Tenant. Agnóstico quanto ao consumidor (n8n é só um exemplo). |

> Mantenha a nomenclatura de domínio em **português** quando voltada ao usuário; em entidades de banco/código, prefira os termos em inglês entre parênteses (ex.: `Lead`, `Appointment`).

---

## 19. Regras de Segurança

Segurança é **requisito**, não item opcional.

### Princípios gerais
- **Nenhum segredo no frontend.** Chaves de OpenAI, WhatsApp, Mercado Pago, Stripe e Dental Office vivem **apenas no backend**.
- **Nunca** commitar `.env`, tokens, chaves ou dumps de dados reais.
- Todo tráfego em produção via **HTTPS**.
- **Princípio do menor privilégio** para tokens e credenciais.

### Frontend
- Não armazenar segredos em `localStorage`/`sessionStorage`.
- Tokens de autenticação: preferir cookies `HttpOnly`/`Secure` quando o backend existir.
- Sanitizar/validar entradas exibidas para evitar XSS.
- Não logar dados sensíveis no console em produção.

### Backend (futuro)
- **Validação de entrada** em toda rota (ex.: Zod) antes de processar.
- **Autenticação JWT** + autorização por **role e por `tenantId`** (isolamento multi-tenant rígido).
- **Rate limiting** e proteção contra brute force no login.
- Hash de senhas com **bcrypt/argon2** (nunca texto puro).
- Headers de segurança (Helmet), CORS restrito a origens conhecidas.
- Segredos via variáveis de ambiente / secret manager — nunca no código.

### Webhooks e integrações
- **Validar assinatura/origem** de todos os webhooks (WhatsApp, Stripe, Mercado Pago).
- Tratar idempotência (evitar processar o mesmo evento duas vezes).

### LGPD / Privacidade
- Dados de pacientes/leads são sensíveis: coletar o mínimo necessário.
- Prever consentimento, anonimização em logs e direito à exclusão.
- Documentar o tratamento de dados (vide `public/politica-de-privacidade`).

---

## 20. Checklist Antes do Commit

Antes de **qualquer** `git commit`:

- [ ] Implementada **apenas uma funcionalidade**.
- [ ] Arquivos alterados foram **listados e aprovados** previamente.
- [ ] **Nenhuma regra obrigatória** (seção 7) foi violada.
- [ ] **Layout não alterado** sem autorização; **nenhum componente removido**.
- [ ] Componentes **reutilizados**; **sem código duplicado**.
- [ ] **Clean Code** e **SOLID** respeitados.
- [ ] **Sem segredos** ou `.env` no diff.
- [ ] `package.json` / `vite.config.js` / `App.jsx` **não alterados** (ou alteração justificada).
- [ ] `npm run build` roda **sem erros**.
- [ ] Lint sem erros.
- [ ] **Testes sugeridos** (ou criados) e passando.
- [ ] Mensagem de commit segue **Conventional Commits** (seção 17).
- [ ] Alterações importantes **documentadas** neste CLAUDE.md.

---

## 21. Checklist Antes do Deploy

Antes de `npm run deploy` (GitHub Pages) ou deploy futuro:

- [ ] Todos os itens do **Checklist Antes do Commit** concluídos.
- [ ] Branch atualizada com a `main` e sem conflitos.
- [ ] `npm run build` gera `/dist` **sem erros nem warnings críticos**.
- [ ] `npm run preview` validado localmente.
- [ ] `vite.config.js` mantém `base: "/recepcao-ia/"` e o app usa **`HashRouter`** (necessário no Pages).
- [ ] Variáveis de ambiente corretas para o ambiente alvo (sem segredos no frontend).
- [ ] Rotas principais testadas manualmente após o build.
- [ ] Assets e imagens carregando (caminhos relativos ao `base`).
- [ ] (Futuro) Migrations de banco aplicadas; variáveis do backend configuradas.
- [ ] (Futuro) Pipeline CI verde (lint → testes → build).

---

## 22. Padrão para Integrações Externas

Aplica-se a **toda** integração (OpenAI, WhatsApp, Google Calendar, Mercado Pago, Stripe, Dental Office, n8n).

### Princípios
- **Frontend nunca chama provedores externos diretamente.** Sempre via backend (que detém os segredos), exposto através da camada `services/`.
- Cada integração tem um **adapter/módulo isolado** no backend (`integrations/<provedor>/`), encapsulando autenticação, chamadas e mapeamento de dados.
- **SOLID:** depender de uma interface/contrato, não do SDK concreto, para permitir troca/teste.
- **Nunca duplicar** lógica de cliente HTTP — centralizar configuração, retry e tratamento de erro.

### Requisitos obrigatórios por integração
- Credenciais via **variáveis de ambiente** (seção 16).
- **Timeout** e **retry com backoff** para chamadas externas.
- **Tratamento de erro** consistente (não vazar detalhes do provedor para o cliente).
- **Idempotência** em operações sensíveis (pagamentos, criação de eventos).
- **Logs** de requisição/resposta sem dados sensíveis.
- **Validação de webhooks** (assinatura/origem).
- Modo **sandbox/teste** documentado e usado em desenvolvimento.

### Frontend
- Consumir o backend via funções em `src/services/<dominio>Service.js`, seguindo o padrão de `leadsService.js` (funções nomeadas que retornam `response.data`).

---

## 23. Padrão para Backend Futuro

> Ainda não existe. Diretrizes obrigatórias para quando for criado (a estrutura/pasta deve ser **proposta e justificada** antes).

### Arquitetura em camadas
```
routes → controllers → services → repositories (Prisma) → banco
```
- **routes:** definição de endpoints e middlewares.
- **controllers:** orquestram request/response; sem regra de negócio pesada.
- **services:** regra de negócio (testável, isolada de framework).
- **repositories:** acesso a dados via Prisma; única camada que conhece o banco.
- **integrations:** adapters de provedores externos (seção 22).
- **middlewares:** auth (JWT), validação, rate limit, tratamento de erro.

### Regras
- **Multi-tenant desde o início:** todo dado de negócio carrega `tenantId`; toda query filtra por tenant.
- **Validação de entrada** (Zod) na borda, antes do controller.
- **Erros centralizados:** um error handler único; respostas padronizadas (`{ error, message }`).
- **Sem regra de negócio em controllers ou repositories.**
- **DTOs/contratos** explícitos entre camadas.
- **Prisma** como fonte da verdade do schema; migrations versionadas.
- **Testes:** unitários nos `services`, integração nas rotas.
- **Configuração** via env (seção 16), validada no startup.

### Convenções
- Mesmo padrão de Conventional Commits.
- Nomenclatura de entidades conforme o **Glossário** (seção 18).

---

## 24. Padrão para Integração com Dental Office API

> Integração do vertical odontológico. Implementar **somente** no backend.

### Diretrizes
- Isolar em `integrations/dental-office/` com um **adapter** dedicado e uma **interface** de contrato (permite mock em testes).
- Credenciais via `DENTAL_OFFICE_API_KEY` (e demais env necessárias) — **nunca** no frontend.
- **Mapear** as entidades do Dental Office para o **modelo de domínio interno** (Glossário, seção 18) — não vazar o formato externo para a UI.
- **Sincronização:** definir direção (importação de pacientes/agenda? exportação de agendamentos?) e estratégia (polling, webhook ou n8n).
- **Idempotência** ao sincronizar registros (evitar duplicatas de pacientes/consultas).
- **Resiliência:** timeout, retry com backoff e degradação graciosa se a API estiver indisponível.
- **Por tenant:** cada Tenant pode ter credenciais próprias do Dental Office — armazenar de forma segura e isolada.
- **Logs** sem dados sensíveis de pacientes (LGPD, seção 19).
- Documentar endpoints usados, limites de rate e ambiente de sandbox.

---

## 25. Padrão para Integração com WhatsApp Business Cloud API

> Canal principal de atendimento. Implementar **somente** no backend.

### Diretrizes
- Isolar em `integrations/whatsapp/` com adapter dedicado (envio, recebimento, templates).
- Credenciais via env: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN` — **nunca** no frontend.

### Webhooks (recebimento)
- Endpoint de **verificação** (GET) usando `WHATSAPP_VERIFY_TOKEN` (hub.challenge).
- Endpoint de **eventos** (POST): **validar a assinatura** (`X-Hub-Signature-256`) antes de processar.
- **Idempotência:** ignorar mensagens/eventos já processados (usar o `message id`).
- Responder rápido (200) e processar de forma assíncrona (fila/n8n) quando for trabalhoso.

### Envio
- Respeitar a **janela de 24h** de atendimento; fora dela, usar **templates aprovados** (HSM).
- Tratar status de entrega (sent/delivered/read/failed) e persistir na Conversa.
- Tratar **rate limits** e erros do provedor com retry/backoff.

### Domínio
- Cada mensagem recebida/enviada vira uma **Message** dentro de uma **Conversation**, vinculada a um **Lead** e ao **Tenant** (Glossário, seção 18).
- **Multi-tenant:** rotear a mensagem para o Tenant correto pelo `phone_number_id`.
- **LGPD:** não logar conteúdo sensível; tratar consentimento e opt-out.
- Orquestração de fluxos (qualificação, agendamento) preferencialmente via **n8n** + **OpenAI**.

Nunca altere textos, labels, títulos, botões ou conteúdo da interface sem solicitação explícita do usuário.

Ao implementar uma funcionalidade, limite as alterações apenas aos arquivos autorizados.



