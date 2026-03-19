# ToopDelivery - Plataforma de Delivery

## 🏗️ Arquitetura

### Microserviços
- **admin**: Painel administrativo (Node.js + MongoDB)
- **microservice_payment**: Serviço de pagamentos (Node.js + PostgreSQL)
- **microservice_notification**: Serviço de notificações (Node.js)
- **microservice_deliveryman**: Serviço de entregadores (Node.js)

### Aplicações
- **mobile_client**: App cliente (React Native)
- **mobile_deliveryman**: App entregador (React Native)
- **mobile_driver**: App motorista (React Native)
- **mobile_shopper**: App shopper (React Native)
- **desktop_manager**: Gerenciador desktop (Electron)
- **desktop_integration**: Integração desktop (Electron)

## 🚀 Setup Rápido

### Pré-requisitos
- Node.js 18+
- Docker & Docker Compose
- Git

### Ambiente de Desenvolvimento

1. Clone o repositório
2. Copie os arquivos de ambiente:
   ```bash
   cp .env.example .env
   ```

3. Suba os serviços com Docker:
   ```bash
   docker-compose up -d
   ```

4. Instale dependências e inicie os serviços:
   ```bash
   # Admin API
   cd delivery_toop-admin/backend && npm install && npm start

   # Payment API
   cd delivery_toop-microservice_payment && npm install && npm start
   ```

## 📁 Estrutura de Diretórios

```
toop-delivery/
├── services/
│   ├── delivery_toop-admin/
│   ├── delivery_toop-microservice_payment/
│   ├── delivery_toop-microservice_notification/
│   └── delivery_toop-microservice_deliveryman/
├── apps/
│   ├── mobile/
│   │   ├── delivery_toop-mobile_client/
│   │   ├── delivery_toop-mobile_deliveryman/
│   │   ├── delivery_toop-mobile_driver/
│   │   └── delivery_toop-mobile_shopper/
│   └── desktop/
│       ├── delivery_toop-desktop_manager/
│       └── delivery_toop-desktop_integration/
├── docker-compose.yml
├── docker-compose.staging.yml
├── docker-compose.production.yml
└── .env.example
```

## 🔧 Configurações

### Variáveis de Ambiente
Copie `.env.example` para `.env` e configure:

- **Bancos de Dados**: MongoDB, PostgreSQL
- **APIs Externas**: Firebase, Google Maps, Twilio
- **Pagamentos**: Cielo, Braspag
- **Armazenamento**: AWS S3/DigitalOcean Spaces

### Portas Padrão
- Admin API: 8100
- Payment API: 8400
- MongoDB: 27017
- PostgreSQL: 5432
- Redis: 6379

## 🚀 Deploy

### Staging
```bash
docker-compose -f docker-compose.staging.yml up -d
```

### Produção
```bash
docker-compose -f docker-compose.production.yml up -d
```

## 📋 CI/CD

O projeto usa **GitHub Actions** para deploy automático:
- **Branch develop**: Deploy para ambiente de desenvolvimento
- **Branch homologation**: Deploy para ambiente de staging  
- **Branch master**: Deploy para produção

### **Secrets Necessárias no GitHub:**
- `SSH_USER`: Usuário SSH dos servidores
- `SSH_KEY`: Chave privada SSH
- `DEV_SERVER`: IP do servidor de desenvolvimento
- `STAGING_SERVER`: IP do servidor de staging
- `PROD_SERVER`: IP do servidor de produção
- `STAGING_URL`: URL do ambiente de staging
- `PROD_URL`: URL do ambiente de produção

## 🔐 Segurança

- Senhas e chaves devem ser configuradas via variáveis de ambiente
- Nunca commitar arquivos `.env`
- Usar senhas fortes para bancos de dados
- Configurar HTTPS em produção

## 📞 Suporte

Para dúvidas e suporte, consulte a documentação técnica ou abra um issue no repositório.
