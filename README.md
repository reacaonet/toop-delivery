# GojáDelivery

Plataforma de delivery + mobility (iFood + Uber style) — Monorepo com API Admin, 4 microserviços, 4 apps web, 4 apps mobile e desktop.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTENDS                                │
│  Landing (4205) │ Admin (4202) │ Client (4200) │ Store (4203)  │
│                 │ Deliveryman App (4204)                        │
└────────────────┬──────────────────────┬────────────────────────┘
                 │                      │
┌────────────────▼──────────────────────▼────────────────────────┐
│                     NGINX / API GATEWAY                        │
└────────────────┬───────────┬───────────┬───────────┬──────────┘
                 │           │           │           │
┌────────────────▼──┐ ┌──────▼─────┐ ┌──▼─────────┐ ┌▼──────────┐
│  Admin API        │ │ Payment    │ │Notification│ │Deliveryman│
│  (port 8100)      │ │ (port 8400)│ │(port 8200) │ │(port 8300)│
│  TypeScript       │ │ TypeScript │ │ JavaScript  │ │TypeScript │
│  Express + Socket │ │ Express    │ │ Fastify     │ │Express    │
└───────┬───────────┘ └──────┬─────┘ └────┬───────┘ └┬──────────┘
        │                    │            │           │
┌───────▼──────────┐  ┌──────▼─────┐ ┌───▼───────┐ ┌▼──────────┐
│  MongoDB         │  │ PostgreSQL │ │ MongoDB   │ │ MongoDB   │
│  (port 27017)    │  │ (port 5432)│ │           │ │           │
└──────────────────┘  └────────────┘ └───────────┘ └───────────┘
                         │
                    ┌────▼────┐
                    │  Redis  │
                    │ (6379)  │
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

### 6. Deploy Produção (2 VPS)

A infraestrutura de produção usa **duas VPS Docker**:

| VPS | IP | Serviços | Compose |
|-----|-----|----------|---------|
| Backend | `69.169.101.230` | API, MongoDB, PostgreSQL, Redis, microserviços, monitoring | `docker-compose.backend.yml` |
| Frontends | `167.148.161.88` | Landpage, Admin, Store, Entregador, Web-client | `docker-compose.frontends.yml` |

```bash
# Em cada VPS: criar .env de produção e preencher senhas fortes
cp .env.production.example .env

# VPS Backend (69.169.101.230)
sudo bash scripts/deploy-backend.sh          # instala Docker, sobe API na :8100

# VPS Frontends (167.148.161.88)
sudo bash scripts/deploy-frontends.sh        # sobe os 5 frontends (80/8081-8084)
```

DNS:
- `gojadelivery.com.br` → `167.148.161.88` (landpage, :80)
- `admin.gojadelivery.com.br` → `167.148.161.88` (:8081)
- `loja.gojadelivery.com.br` → `167.148.161.88` (:8082)
- `entregador.gojadelivery.com.br` → `167.148.161.88` (:8083)
- `app.gojadelivery.com.br` → `167.148.161.88` (:8084)
- `api.gojadelivery.com.br` → `69.169.101.230` (:8100)

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
| GET | `/drivers` | ✅ | Listar motoristas |
| POST | `/drivers` | ✅ | Criar motorista |
| GET | `/drivers/:id` | ✅ | Detalhes motorista |
| PUT | `/drivers/:id` | ✅ | Atualizar motorista |
| DELETE | `/drivers/:id` | ✅ | Deletar motorista |
| GET | `/drivers/me/location` | ✅ | Localização atual |
| PUT | `/drivers/me/location` | ✅ | Atualizar GPS |
| PUT | `/drivers/me/availability` | ✅ | Toggle disponível |
| PUT | `/drivers/me/online` | ✅ | Toggle online/offline |
| GET | `/drivers/nearby` | ✅ | Motoristas próximos |
| GET | `/bookings` | ✅ | Listar corridas |
| POST | `/bookings` | ✅ | Criar corrida |
| GET | `/bookings/:id` | ✅ | Detalhes corrida |
| PUT | `/bookings/:id/accept` | ✅ | Aceitar corrida |
| PUT | `/bookings/:id/reject` | ✅ | Rejeitar corrida |
| PUT | `/bookings/:id/start` | ✅ | Iniciar corrida |
| PUT | `/bookings/:id/complete` | ✅ | Completar corrida |
| PUT | `/bookings/:id/cancel` | ✅ | Cancelar corrida |
| PUT | `/bookings/:id/rate` | ✅ | Avaliar corrida |
| PUT | `/bookings/:id/qr-generate` | ✅ | Gerar QR Code |
| PUT | `/bookings/:id/qr-verify` | ✅ | Verificar QR Code |
| GET | `/wallet/balance` | ✅ | Saldo carteira |
| GET | `/wallet/transactions` | ✅ | Transações |
| POST | `/wallet/credit` | ✅ | Creditar |
| POST | `/wallet/debit` | ✅ | Debitar |
| GET | `/messages/:bookingId` | ✅ | Mensagens chat |
| POST | `/messages/:bookingId` | ✅ | Enviar mensagem |

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
├── scripts/                  # Init/deploy scripts
├── docker-compose.dev.yml    # Local development
├── docker-compose.backend.yml    # Production backend (API + dados + Redis)
├── docker-compose.frontends.yml  # Production frontends (5 apps web)
└── docker-compose.staging.yml    # Staging (1 servidor)
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
