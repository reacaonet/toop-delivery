# GojáDelivery

Plataforma de delivery (iFood + Uber style) — Monorepo com API Admin, 4 microserviços, 4 apps mobile, 2 frontends e desktop.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTENDS                            │
│  React-Vite (port 80)  │  Angular Legacy (port 4200)       │
└────────────┬────────────┴────────────┬──────────────────────┘
             │                         │
┌────────────▼─────────────────────────▼──────────────────────┐
│                     NGINX / API GATEWAY                     │
└────────────┬────────────┬────────────┬────────────┬─────────┘
             │            │            │            │
┌────────────▼───┐ ┌──────▼──────┐ ┌───▼────────┐ ┌▼────────────┐
│  Admin API     │ │  Payment    │ │ Notification│ │ Deliveryman │
│  (port 8100)   │ │  (port 8400)│ │ (port 8200) │ │ (port 8300) │
│  TypeScript    │ │  TypeScript │ │ JavaScript  │ │ TypeScript  │
│  Express       │ │  Express    │ │ Fastify     │ │ Express     │
└───────┬────────┘ └──────┬──────┘ └───┬────────┘ └┬────────────┘
        │                 │            │            │
┌───────▼────────┐ ┌──────▼──────┐ ┌───▼────────┐ ┌▼────────────┐
│  MongoDB       │ │ PostgreSQL  │ │ MongoDB    │ │ MongoDB     │
│  (port 27017)  │ │ (port 5432) │ │            │ │             │
└────────────────┘ └─────────────┘ └────────────┘ └─────────────┘
                        │
                   ┌────▼────┐
                   │  Redis  │
                   │(6379)   │
                   └─────────┘
```

## Quick Start

### Pré-requisitos
- Docker + Docker Compose v2
- Node.js 18+ (desenvolvimento local)

### 1. Clonar e configurar

```bash
git clone <repo-url>
cd toop-delivery-clean

# Copiar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais
```

### 2. Subir infra local

```bash
# MongoDB + PostgreSQL + Redis
docker compose -f docker-compose.dev.yml up -d

# Verificar health
docker compose -f docker-compose.dev.yml ps
```

### 3. Rodar Admin API (TypeScript)

```bash
cd delivery_toop-admin/backend
npm install
npm run dev
# API rodando em http://localhost:8100
```

### 4. Rodar Microserviços

```bash
# Payment
cd delivery_toop-microservice_payment && npm install && npm run dev

# Notification
cd delivery_toop-microservice_notification && npm install && npm run dev

# Deliveryman
cd delivery_toop-microservice_deliveryman && npm install && npm run dev
```

### 5. Rodar Frontend React

```bash
cd delivery_toop-admin/frontend-react
npm install
npm run dev
# Frontend em http://localhost:5173
```

### 6. Deploy Produção

```bash
# Criar .env de produção
cp .env.production.example .env
# Editar com senhas fortes

# Build e subir tudo
docker compose -f docker-compose.production.yml up -d --build

# Verificar
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs -f
```

## Variáveis de Ambiente

Ver `.env.example` para a lista completa. As principais:

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `MONGO_ADMIN_USER` | Usuário root MongoDB | ✅ |
| `MONGO_ADMIN_PASSWORD` | Senha root MongoDB | ✅ |
| `POSTGRES_USER` | Usuário PostgreSQL | ✅ |
| `POSTGRES_PASSWORD` | Senha PostgreSQL | ✅ |
| `REDIS_PASSWORD` | Senha Redis | ✅ |
| `JWT_SECRET` | Segredo JWT (mín 64 chars) | ✅ |
| `JWT_SECRET_REFRESH` | Segredo Refresh Token | ✅ |
| `APP_KEY` | Chave de autenticação entre serviços | ✅ |
| `GOOGLE_MAPS` | API key Google Maps | Para geolocalização |
| `FIREBASE_serviceAccount` | Service account Firebase | Para push notifications |

## Endpoints

### Admin API (port 8100)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/auth` | — | Login |
| POST | `/auth/refresh` | — | Refresh token |
| GET | `/health` | — | Health check |
| GET | `/metrics` | — | Prometheus metrics |
| GET | `/companies` | ✅ | Listar empresas |
| POST | `/companies` | ✅ | Criar empresa |
| GET | `/users` | ✅ | Listar usuários |
| POST | `/users` | ✅ | Criar usuário |
| GET | `/orders` | ✅ | Listar pedidos |
| POST | `/orders` | ✅ | Criar pedido |
| GET | `/deliverymen` | ✅ | Listar entregadores |
| POST | `/deliverymen` | ✅ | Criar entregador |

### Microserviços

| Serviço | Porta | Health | Auth |
|---------|-------|--------|------|
| Payment | 8400 | `GET /health` | JWT |
| Notification | 8200 | `GET /health` | APP_KEY |
| Deliveryman | 8300 | `GET /health` | JWT |

## Desenvolvimento

### Estrutura de pastas

```
toop-delivery-clean/
├── delivery_toop-admin/
│   ├── backend/              # Admin API (TypeScript + Express + Mongoose)
│   │   ├── src/
│   │   │   ├── config/       # Env validation (Zod)
│   │   │   ├── models/       # Mongoose models
│   │   │   ├── services/     # Business logic
│   │   │   ├── controllers/  # Request handlers
│   │   │   ├── routes/       # Express routes
│   │   │   ├── middleware/    # Auth, validation, rate limiting, metrics
│   │   │   └── __tests__/    # Jest tests
│   │   └── _legacy_src/      # Old JS code (reference only)
│   ├── frontend-react/       # React-Vite (new)
│   └── frontend/             # Angular (legacy)
├── delivery_toop-microservice_payment/
├── delivery_toop-microservice_notification/
├── delivery_toop-microservice_deliveryman/
├── mobile/                   # 4 React Native apps
├── desktop/                  # Electron apps
├── config/
│   ├── prometheus/           # Prometheus config
│   └── grafana/              # Grafana dashboards
├── scripts/                  # Init scripts
├── docker-compose.dev.yml    # Local development
└── docker-compose.production.yml  # Production
```

### Testes

```bash
cd delivery_toop-admin/backend
npm test              # Rodar todos
npm test -- --coverage # Com coverage
```

### Lint

```bash
cd delivery_toop-admin/backend
npx eslint src --ext .ts
```

## Monitoramento

### URLs de acesso (produção)

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| Frontend | `http://localhost` | — |
| Admin API | `http://localhost:8100` | — |
| Grafana | `http://localhost:3000` | admin/admin |
| Prometheus | `http://localhost:9090` | — |

### Dashboard Grafana

O dashboard "GojáDelivery - Services Overview" é provisionado automaticamente com:
- Status de todos os serviços (UP/DOWN)
- Request rate por serviço
- Tempo de resposta (p95)
- Taxa de erro (5xx)
- Uso de memória e CPU
- Conexões MongoDB
- Uso de memória Redis

## Segurança

- Todos os Dockerfiles usam non-root user (`nodejs:1001`)
- JWT authentication em todas as rotas protegidas
- Rate limiting (100 req/min por IP)
- Helmet.js para security headers
- Variáveis sensíveis em `.env` (nunca no código)
- `.gitignore` bloqueia `*.key`, `*.pem`, `*adminsdk*.json`

### Ações pendentes

1. **Revogar** service account Firebase `food-syulnv` no Google Cloud Console
2. **Limpar** histórico git com BFG Repo-Cleaner (chaves comprometidas)
3. **Gerar** `.env` com senhas fortes para produção

## Stack

| Camada | Tecnologia |
|--------|------------|
| Runtime | Node.js 18 |
| Language | TypeScript 5.x |
| Framework | Express 4.x, Fastify (notification) |
| Database | MongoDB 5.x, PostgreSQL 13 |
| Cache | Redis 7.x |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Validation | Zod |
| Testing | Jest + ts-jest |
| Lint | ESLint + @typescript-eslint |
| Build | TypeScript compiler |
| Frontend | React 18 + Vite |
| Mobile | React Native |
| Desktop | Electron |
| Container | Docker + Docker Compose |
| Monitoring | Prometheus + Grafana |
| CI/CD | GitHub Actions |
