# PLANO DE REESTRUTURAÇÃO — TOOPDELIVERY

> Plataforma SaaS de delivery (estilo iFood + Uber). Sistema entregue por fábrica com graves problemas de qualidade, segurança e arquitetura. Este plano define a correção em fases com checkpoints de revisão.

## 🎯 Objetivos

1. **Segurança**: remover todos os segredos expostos e ativar autenticação real
2. **Rodar localmente**: ambiente de desenvolvimento funcional de ponta a ponta
3. **Código atualizado**: migrar para stacks modernas (Node 20+, TypeScript, Mongoose 8, Express 4/5, Zod)
4. **Admin API reconstruída do zero**: descartar os 865 controllers de fábrica (código morto com 808 rotas nunca montadas) e reescrever API limpa por domínio mantendo compatibilidade com os apps
5. **Produção**: decidir depois da base local funcionar

## 🧭 Decisões de arquitetura

| Decisão | Escolha | Motivo |
|---|---|---|
| Admin API | **Reconstruir do zero** | 99% do código atual é morto; essential.js tem mocks |
| Linguagem | **TypeScript em todos os serviços** | Payment/Deliveryman já são TS; padronizar |
| Validação | **Zod** (ou Joi se preferir) | Substitui os 11 validators e entrada crua |
| Mongoose | **v8** (admin/deliveryman) | Sequelize mantém no payment (PostgreSQL) |
| Auth | JWT + refresh token, middleware que **bloqueia** de verdade | Hoje `jwt.verify` está comentado em tudo |
| Banco | Mongo (admin/deliveryman/notification) + Postgres (payment) | Manter arquitetura atual |
| Frontend admin | **React + Vite** (já existe esqueleto) | Substitui Angular 9 legado |
| Mobile | Manter os 4 apps (clientes/entregador/motorista/shopper) | São o produto; só apontar para API local |
| Rota de compatibilidade | Apps esperam `/auth`, `/companies`, `/orders`, `/deliverymen`, `/payments`, `/notifications` | Nova API deve manter estes paths |

---

## 📋 FASE 0 — EMERGÊNCIA DE SEGURANÇA

**Objetivo**: estancar o vazamento de credenciais. Não depende de mais nada.

### Tarefas
- [ ] **Revogar** a service account Firebase `food-syulnv` no Firebase Console (Google Cloud IAM) — a chave privada está no repositório
- [ ] Remover chave privada Firebase de `docker-compose.dev.yml` (linhas ~198-205)
- [ ] Adicionar ao `.gitignore` raiz e de cada serviço: `firebase-adminsdk.json`, `google-services.json`, `GoogleService-Info.plist`, `*.pem`, `*.key`, `debug.keystore*`
- [ ] Remover segredos hardcoded do código:
  - `delivery_toop-microservice_payment/.env.example` (appToken/appSecret reais)
  - `delivery_toop-microservice_notification/docker-compose-api-homologation.yml` (APP_KEY)
  - `test-deliverymen.js` (JWT)
  - `controllers/Payment/SalesController.js` (token Cielo + cartão de teste)
  - `services/notification.js` (JWT fixo)
  - Chaves Google Maps nos apps (`mobile/*/src/config/*`, `AppDelegate.m`)
- [ ] Mover tudo para variáveis de ambiente
- [ ] Documentar quais chaves precisam ser rotacionadas

### Checkpoint ✔
- `git grep -rE "(BEGIN PRIVATE KEY|AIza|eyJhbGciOi)" -- .` não retorna segredos
- Chaves revogadas no Firebase Console
- Repo limpo de segredos commitados

---

## 📋 FASE 1 — FUNDAÇÃO LOCAL (ambiente roda do zero)

**Objetivo**: um clone do repo + `docker compose up` sobe os 4 serviços com bancos inicializados.

### Tarefas
1. **Banco de dados**
   - [ ] Criar `database-postgres-payment.sql` **de verdade** (schema de pagamento: invoices, transactions, schedules — conferir com migrations do Sequelize existentes)
   - [ ] Criar `scripts/init-mongo.js` (cria usuário app + indexes básicos)
   - [ ] Verificar: Postgres sobe com tabelas, Mongo com usuário

2. **Monorepo / npm**
   - [ ] Corrigir workspaces raiz: `desktop/` paths (`desktop/delivery_toop-desktop_manager`)
   - [ ] Corrigir scripts: `install:all`, `build:admin` (admin não tem script build)
   - [ ] Corrigir `docker:stop` (não juntar os 3 compose num `down`)
   - [ ] Decidir: remover `delivery_toop-desktop_integration` e `delivery_toop-integrations` (vazios) ou iniciá-los

3. **Variáveis de ambiente**
   - [ ] Corrigir `.env.example` raiz: adicionar `PG_*`, `LTS`, `PRODUCTION`, `GOOGLE_MAPS` (código lê este nome), corrigir typos (`REDIS_HOTS` → `REDIS_HOST`)
   - [ ] Completar `.env.example` dos 3 microserviços (cada um omite vars que o código usa)
   - [ ] Padronizar nomes: `production` vs `PRODUCTION`; `MONGO_*` vs `URL_MONGO`

4. **Docker**
   - [ ] `docker-compose.dev.yml`: remover segredos, adicionar `healthcheck:` e `depends_on: condition: service_healthy`
   - [ ] Corrigir Dockerfiles: prod não pode usar `nodemon`; adicionar `healthcheck.js` em cada serviço
   - [ ] Adicionar `.dockerignore` em cada serviço
   - [ ] Remover compose legados internos que conflitam (`deliveryman/docker-compose.yml` node:10, porta 8500; `notification` porta 8300)

5. **Teste de aceite local**
   - [ ] `docker compose -f docker-compose.dev.yml up -d` → 8 containers healthy
   - [ ] Admin: `/health`, Swagger `/api-docs` respondem
   - [ ] Payment: `/health` OK, conecta Postgres
   - [ ] Notification: `/v1/health` OK
   - [ ] Deliveryman: `/health` OK

### Checkpoint ✔
- Ambiente sobe do zero em outra máquina/clone
- Todos os serviços respondem `/health`
- CI local (npm install + build) não quebra

---

## 📋 FASE 2 — REBUILD DA ADMIN API

**Objetivo**: nova API admin em TypeScript, arquitetura limpa, autenticação real, com os paths que os apps consomem.

### Estrutura alvo (`delivery_toop-admin/backend/` — novo)
```
src/
  server.ts              # bootstrap (https/http, helmet, cors, rate-limit)
  app.ts                 # express app + middlewares
  config/                # env validado com Zod
  routes/                # index + routers por domínio
  controllers/           # finos (<=100 linhas), sem lógica de negócio
  services/              # regras de negócio + clients externos
  models/                # Mongoose schemas
  repositories/          # acesso a dados (opcional na fase 1)
  middleware/            # auth, errorHandler, notFound
  validators/            # Zod schemas
  utils/                 # erros, logger (pino/winston)
  test/                  # jest + supertest
```

### Domínios (da essência real, sem mocks)
1. **Auth** — `POST /auth`, `POST /auth/refresh` — JWT + refresh, bcrypt, bloqueio real
2. **Companies** — `GET/POST/PUT/DELETE /companies`
3. **Users** — `GET/POST/PUT/DELETE /users` (password com `select: false`)
4. **Orders** — `GET/POST/PUT /orders` (remover mock)
5. **Payments** — `GET /payments` (consultar payment service de verdade, remover mock)
6. **Deliverymen** — `GET/POST/PUT/DELETE /deliverymen` (remover seed automático)
7. **Notifications** — `GET /notifications`

### Regras de engenharia
- [ ] Auth middleware que **retorna 401** em token inválido/expirado
- [ ] Validação Zod em toda entrada; `heders`/`lenght` typos nunca mais
- [ ] Error handler central com resposta JSON padronizada (`{ success, error, message }`)
- [ ] Helmet ativo, rate limiting (`express-rate-limit`), CORS por env
- [ ] Logger estruturado (pino) em vez de `console.log` em massa
- [ ] Swagger gerado das rotas
- [ ] Mongoose 8, schema com `timestamps`, `select: false` em campos sensíveis
- [ ] Password hash bcrypt antes de salvar
- [ ] Nada de dados mock no código

### Compatibilidade
- [ ] Manter prefixos que os apps mobile/desktop consomem (verificar em `mobile/*/src/` e `desktop_manager/`)
- [ ] Testar os apps contra `localhost:8100`

### Checkpoint ✔
- CRUD real (não mock) funciona no Postman contra `localhost:8100`
- 401 em rota sem token; 403 com token inválido
- Swagger documenta as rotas da fase

---

## 📋 FASE 3 — MICROSERVIÇOS (payment / notification / deliveryman)

**Objetivo**: serviços seguros, consistentes e sem código morto.

### 3.1 Payment (TypeScript, Sequelize/Postgres + Mongo)
- [ ] **Ativar verificação JWT** em todas as rotas (`jwt.verify` comentado → middleware real)
- [ ] Remover/finalizar arquivos vazios do PagarMe (`Split/createSplit.ts`, `validators/PagarMe/recipient.ts`)
- [ ] Definir escopo dos gateways: Cielo ✓ parcial, Iugu ✓, Braspag parcial, PagarMe (decidir), **Stripe ausente (decidir se entra)**
- [ ] Webhooks de pagamento (ausentes em todos) — priorizar pelo gateway usado de fato
- [ ] Corrigir `.env.example` (adicionar `IUGU_*`, `PAGARME_*`, `ECBR_URL`, `LTS`, `PRODUCTION`)
- [ ] Mover `ecbrId` hardcoded (`queueSplit/paidOrder.ts`) e `BRASPAG_CLIENT_ID` para env
- [ ] Substituir `console.*` (87 ocorrências) por logger

### 3.2 Notification (JavaScript → migrar para TypeScript)
- [ ] Migrar JS → TS (padronizar com os demais)
- [ ] Implementar `NotificationJob` (handler vazio) ou remover a fila Bull
- [ ] Implementar ou remover persistência `AppNotification`
- [ ] Completar `.env.example`
- [ ] Padronizar prefixo de rota `/v1` com os demais (`/${LTS}`)

### 3.3 Deliveryman (TypeScript)
- [ ] Ativar JWT nas rotas (comentado hoje)
- [ ] Trocar Firebase **web SDK** por **Admin SDK** (anti-pattern atual no backend)
- [ ] Mover cron de dentro do controller de rota para serviço/agendador
- [ ] Completar `.env.example`

### Checkpoint ✔
- Nenhuma rota sem autenticação (exceto `/health` e `POST /token` internos)
- Nenhum arquivo vazio / handler morto
- Lint + build passando nos 3

---

## 📋 FASE 4 — FRONTENDS

### 4.1 Admin React (Vite) — terminar
- [ ] Conectar todas as páginas (Users, Companies, Orders, Payments, Deliverymen) à API real
- [ ] Fluxo de login com token (já existe esqueleto)
- [ ] Rotas protegidas + refresh
- [ ] Depois do React pronto → **descontinuar Angular 9** (`delivery_toop-admin/frontend`)

### 4.2 Mobile (4 apps)
- [ ] Configuração de ambiente por variável (hoje troca manual `prod`/`homolog`)
- [ ] Dev apontando para `localhost:8100` (ou IP da máquina para testes em device físico)
- [ ] Validar fluxo ponta a ponta: login → pedido → pagamento → entrega

### 4.3 Desktop manager
- [ ] Verificar funcionamento contra API nova; corrigir env

### Checkpoint ✔
- Painel admin React funcional com login + CRUDs reais
- Um app mobile rodando no emulador consumindo a API local

---

## 📋 FASE 5 — QUALIDADE, TESTES E CI

- [ ] **Jest + Supertest**: testes dos fluxos core (auth, companies, users, orders) em cada serviço
- [ ] **ESLint + Prettier** configurados corretamente por serviço (remover config React Native do backend)
- [ ] Cobertura mínima dos endpoints críticos
- [ ] Padronizar response/error handling entre os 4 serviços
- [ ] CI GitHub Actions: corrigir workspaces, `npm ci`, lint, test, build (sem fallback `|| echo`)
- [ ] Scripts `lint`/`test` em todos os `package.json`
- [ ] Testes automatizados substituem `test-cors.js` / `test-deliverymen.js`

### Checkpoint ✔
- `npm run lint && npm test && npm run build` verde na raiz
- CI roda de ponta a ponta (test-build → deploy)

---

## 📋 FASE 6 — PRODUÇÃO (decisão posterior)

Quando a base local estiver sólida, decidir:
- [ ] Domínio/TLS (certificados: criar os arquivos certos ou terminar via reverse proxy)
- [ ] Secrets manager (GitHub Secrets / Docker secrets) — nada de env no compose versionado
- [ ] Staging/prod compose com healthchecks e volumes persistentes
- [ ] Banco de dados gerenciados (Atlas / RDS / DigitalOcean) vs self-hosted
- [ ] Deploy por branches (já existe esqueleto no CI)

---

## 🗺️ Visão de sequência e dependências

```
FASE 0 (segurança) ──► FASE 1 (rodar local) ──► FASE 2 (admin API)
                                                      │
                    FASE 3 (microserviços) ◄──────────┤
                                                      ▼
                    FASE 4 (frontends) ──► FASE 5 (qualidade/CI) ──► FASE 6 (prod)
```

- Fase 0 bloqueia todas (não mexer no repo enquanto chaves vazadas existem)
- Fase 1 bloqueia Fase 2-4 (precisa de banco + env funcionando)
- Fase 2 e 3 podem andar em paralelo (equipes/agentes distintos)
- Fase 5 é contínua (padrões entram desde a Fase 2)

## ⚠️ Riscos que exigem sua decisão em breve

1. **Rotação de chaves Firebase** — precisa ser feita por você no Console (não consigo acessar)
2. **Stripe / webhooks** — implementar ou tirar do escopo (os apps de produção usam qual gateway de fato?)
3. **Angular legado** — descontinuar após React pronto? (resposta da Fase 4)
4. **Banco em produção** — self-hosted vs gerenciado (resposta da Fase 6)
