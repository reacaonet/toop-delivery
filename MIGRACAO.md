# GoJá Delivery — Plano de Migração

> Documento de controle do que **ainda não foi migrado** do sistema legado para o backend/painel moderno (TypeScript + React). Cada item tem etapas e um checkbox `[ ]` para marcarmos `[x]` conforme for realizado.

**Última atualização:** 28/08/2026

---

## Contexto atual (já migrado / rodando)

Backend moderno (`delivery_toop-admin/backend/src`) e painel React (`delivery_toop-admin/frontend-react`) já cobrem:

- **CORE delivery/e-commerce:** auth (login/cadastro store), empresas, categorias, produtos, pedidos, carrinho, banners, review, filiais, upload.
- **Estoque:** StockItem / StockBatch / StockMovement.
- **Mobility (subset):** drivers, bookings (aceitar/rejeitar/contra-oferta/iniciar/completar/cancelar/avaliar/QR), wallet do motorista, mensagens por corrida, promo.
- **Painel React** com: Dashboard, Empresas, Categorias, Banners, Pedidos, Usuários, Entregadores, Motoristas, Corridas, Cupons, Wallet, Pagamentos, Configurações, Relatórios, Perfil.
- **4 apps web:** web-client (cliente+rides), store (loja+estoque), deliveryman-app, landpage.
- **3 microserviços:** payment (8400), notification (8200), deliveryman (8300).
- **OTA server** (`toop-ota`, porta 8500) — server/CLI/wrapper prontos (falta módulo nativo, ver Fase 3).

**O que NÃO roda no compose (legado de referência):**
- `delivery_toop-admin/frontend` (painel **Angular**).
- `delivery_toop-admin/backend/_legacy_src` (backend **JS** legado).
- Apps mobile (4, React Native) — geridos via OTA, não no docker dev.

---

## Passo 1 — Backend: migração das áreas legadas do `_legacy_src`

> Critério: cada área ganha Model + Service + Route + Validators no backend moderno, e o endpoint é consumido pelo painel React.

### 1.1 Finance (módulo financeiro completo)
Adotada abordagem **novo/autônomo** (aprovado pelo usuário): módulo Finance desacoplado do legado, consumindo dados atuais (Orders/Payments/Company), sem depender de Franchise/Braspag. Implementado em `backend/src`: models + `finance.service.ts` + `finance.controller.ts` + `finance.routes.ts` (montado em `routes/index.ts` sob `/finance`).
- [x] Modelos: `CostCenter`, `TypePayment`, `Bank`, `Agency`, `DigitalAccount` (account+extract), `Chargeback` (padrão moderno, `toJSON` sem `__v`, índices).
- [x] Rotas CRUD (autenticadas): `/finance/balances`, `/finance/balances/company/:id`, `/finance/cost-centers`, `/finance/type-payments`, `/finance/banks`, `/finance/agencies`, `/finance/digital-accounts` (+ `/:id/balance`, `/:id/move`), `/finance/chargebacks`.
- [x] Balanço por empresa: agregação real sobre Orders (gross/subtotal/deliveryFees/discounts/paid, `status=delivered`) + `getCompanyBalance` (por método de pagamento + payments received/refunded).
- [ ] Pendente (depende de Fase 1.9 gateways e 1.13 franquia): `Subordinate`/split Braspag, invoices, deliveries finance, saldo por franquia.
- [ ] Expor telas Finance no painel React (fazer na Fase 2.3 quando o backend estiver integrado).

### 1.2 Cashback
- [ ] Model `CashbackCampaign` + `CashbackCustomer` (saldo/histórico/total por mês).
- [ ] Rotas: `/cashback/campaigns`, `/cashback/used/paginator`, `/cashback/customer/...`.

### 1.3 HelpDesk / FAQ
- [x] Models: `HelpTicket` (protocolo `tickedId`, subject, description, person, company, priority, department, status, name, email, phone, order, images, `deletedAt` soft-delete), `TicketInteraction` (helpTicketsId, description, origin, author), `Faq` (title, caption, description, status). Padrão moderno. `person` referenciado como `User` (model `Person` ainda não migrado — item 1.17).
- [x] Rotas (autenticadas): `/helpdesk/tickets` (list/create), `/helpdesk/tickets/protocol/:protocol`, `/helpdesk/tickets/:id` (get/update/delete), `/helpdesk/tickets/:ticket_id/interactions` (list/create), `/helpdesk/ticketinterations/:id` (update/delete); `/faq` (list/create/get/update/delete).
- [x] Lógica de negócio legada replicada: criar ticket gera interação inicial automaticamente (origin user/company); protocolo busca por `tickedId` + interações.
- [ ] Integrar telas HelpDesk/FAQ no painel React (Fase 2.3).

### 1.4 Email (tipos/templates/variáveis)
- [x] Models `EmailType` (key, name, status, deletedAt), `EmailTemplate` (subject, body, type ref `EmailType`, company ref `Company`, status, deletedAt com `toJSON transform`), `EmailVariable` (name, title, deletedAt).
- [x] Rotas (autenticadas): `/emails/types` (CRUD), `/emails/templates` (CRUD, com `populate` de type), `/emails/variables` (somente leitura como no legado). Fluxo completo validado em runtime: criar type → criar template (type populado) → listar types/templates/variables. `tsc --noEmit` OK.

### 1.5 Marketing / campanhas
- [x] Model `Campaign` (name, disseminationVehicle, initialDate/finalDate, downloadAndroid/downloadIos — corrigidos typos `dowload*` do legado, note, image, soft-delete `deletedAt`).
- [x] Rota `/marketing/campaign` (CRUD autenticado) + `marketing.service/controller/routes`.
- [ ] Integrar telas de campanhas no painel React (Fase 2.3).

### 1.6 Notificações administrativas (hoje somente leitura)
- [ ] Criar/atualizar/deletar notificação e **enviar push** por Firebase (ligar ao microserviço notification 8200).
- [ ] Tópicos de push + usuário-por-tópico (`/v2/notification-topic`).

### 1.7 Aplicativos / categorias de app
- [x] Model `AppCategory` (name, type supermarket/restaurant/accessories, showInApp, keyword, segment, status, showHome, order, images, soft-delete `deletedAt`). Desacoplado: `segment` virou string (no legado era ref `CompanySegment`/franchise, inexistente no moderno).
- [x] Rota `/application/category` (CRUD autenticado) + `app.service/controller/routes`.
- [ ] Integrar telas de categorias de app no painel React (Fase 2.3).

### 1.8 Pedidos de supermercado / fluxo shopping completo
- [ ] Models: `Department`, `DepartmentMobile`, `Schedule`, `Invoice`, `PaymentMethod`, `OwnDelivery`.
- [ ] Rotas: `/shopping/*` (departments, cart-item, schedules, invoices, cost-freight, own/online delivery, status/tracking, shipment).
- [ ] Integrar número/supermercado no fluxo do pedido do web-client.

### 1.9 Payment gateways (Braspag / PagarMe / Iugu / PIX)
- [ ] Dependências de SDKs (braspag, pagarme, iugu).
- [ ] Models: `PaymentTransaction`, `Split`, `Chargeback`.
- [ ] Rotas: `/braspag/*`, `/payment/*` (capture, split, PIX charge/verify, card tokenization). Migrar para o microserviço payment (8400) e expor via admin.
- [ ] Subscription/assinatura e repasse (recipient/split).

### 1.10 Cupons / ofertas (hoje só `Promo`)
- [ ] Cupons por empresa, por cliente, cupom de destaque/high.
- [ ] Model `Offer` (oferta por empresa, distinto de Promo).

### 1.11 Pedido "loose delivery" (delivery avulso)
- [ ] Model + rotas `/v2/loose-delivery` (+ address, customer).

### 1.12 Embalagem / Packing e Shopper
- [ ] Model `Packing`.
- [ ] Model `Shopper` + atribuição a itens de carrinho.

### 1.13 Franquia / Franchise
- [ ] Model `Franchise` + config genérica.
- [ ] Rotas `/franchises` + self-registration público.

### 1.14 Pré-registro / dinâmico
- [x] Model `PreRegistration` (collection `preRegistration`, campos como ddi/phone/name/email/cpf/nif/status PENDENTE·APPROVED·ANALYZE·DECLINED·RESENT, fotos/documentos, vehicle*, bankData embutido, viewStop/NextRegister, soft-delete deletedAt) + `DynamicPreRegister` (collection `dynamicPreRegister`, schemas embutidos `InputTypeShema`/`UploadDocPhotoShema`). Padrão moderno. Desacoplado: ref `franchise`/`application` não resolvidos (models ainda não migrados).
- [x] Rotas `/pre-register` (PÚBLICAS como no legado: create/list-by-phone/update/delete, `/dynamic`, `/dynamic-record/:id`; `/paginator` autenticado). Fluxo validado em runtime.

### 1.15 Monitor (dashboards tempo real)
- [ ] Rotas `/monitor/order`, `/monitor/sales` (pedidos e vendas em tempo real).

### 1.16 Tooling: Popup / Integrações / compressão
- [x] Model `Popup` (collection `popup`: images, name, company ref `Company`, status, startDate/endDate, priorities, vizualizations limite, quantityViews contador, message, textMessageButton, width/height, url, redirectTo enum HOME/URL/ROUTE, startHour/endHour, soft-delete) + `PopupView` (collection `popupView`) + rotas `/tools/popup` (CRUD+updateViews+listPopupApp). Lógica de visibilidade (data/hora/prioridade/limite de views/não-visto) implementada e validada em runtime.
- [x] Model `Integration` (collection `int_integrations`: company ref `Company`, system enum JM_Diamante/RpInfo/Viva_Sistemas, status, soft-delete) + rotas `/tools/integrations` (CRUD+paginator+por-empresa). Validado em runtime.
- [ ] Serviço de compressão de imagem: ADIADO — depende de infraestrutura externa (Bull/Redis, DigitalOcean Spaces/S3, sharp, multer-s3) NÃO presente no backend moderno; e `/food/compress-image` e `/food/change-folder` (legado) dependem de S3. Documentado como pendente de infra.
- [ ] Sync de imagem (`syncImage`): ADIADO — depende de API externa `PRODUCT_IMAGE_API` com tokens hardcoded no legado (segredo). Documentado como pendente.

### 1.17 Cliente / DeliveryAddress / Guest / Person
- [ ] Model `DeliveryAddress` + rotas (salvar/editar endereços do cliente).
- [ ] Model `Guest`.
- [ ] Model `Person` (identidade física + indicação) separado de User.
- [ ] Duplicados (`DuplicateRecords`) e normalização.

### 1.18 ACL / Permissões / Roles / AccessGroup / AccessFlow
- [ ] Models `Role`, `Permission`, `Module`, `AccessGroup`, `AccessFlow`.
- [ ] Rotas `/acl/*`, `/accessGroup`, `/report/access-flow`, `/group`.
- [ ] Controle por permissão no painel React (aplicar no frontend-react as guards por role).

### 1.19 Configurações de domínio (hoje `Settings` é um doc único)
- [ ] Models: `City`, `State`, `Timezone`, `Countries`, `Controller`, `TypesUsers`, `AppVersion`, `BrazilianBank`, `GlobalSettings`.
- [ ] Rotas `/setting/*`, `/v2/setting/*`.

### 1.20 Catálogo de acessórios (loja não-food) e complementos de produto
- [ ] Models `AccessoryCategory`, `AccessoryProduct`, `AccessoryComplement`, `ProductComplement`/`Item`.
- [ ] Rotas `/v2/accessories`, `/food/product-complement*`.
- [ ] Ordenação/status de produto, desconto de produto.

### 1.21 Prompt de produto / Alerta de produto
- [ ] Model `AlertProduct` + rotas `/v2/customer-alert-product/alert-product`.

### 1.22 Chat por pedido (hoje só `Message` por corrida)
- [ ] Chat por carrinho/pedido com contador de não-lidas (`/v1/front/chat/:cartId`, `/chat`).

### 1.23 Entregador: fila / corridas / histórico / online
- [ ] Rotas: `/deliveryMan/queue`, `/deliveryMan/back-to-queue`, `/deliveryMan/race/list`, `/deliveryMan/online-last-week`, `/deliveryMan/price/...`, `updateLocation`.
- [ ] Aprovação de cadastro de entregador/motorista (`/register-deliveryman`, `/pre-register`).

### 1.24 Busca
- [ ] Rota `/v1/search` (empresa-produtos, segmento/empresa-produtos).

### 1.25 Slider / Tabloid / Tips / site da empresa
- [ ] Models `Slider`, `Tabloid`, `Tip`, `TipDeliveryMan`, `CompanySite`.
- [ ] Rotas correspondentes.

### 1.26 Log / auditoria
- [ ] Model `Log` + rota `/log` (auditoria de ações no painel).

### 1.27 Mobility — lacunas
- [ ] Maps (directions/matrix/geocode/autocomplete) — `v1/mobility/maps/*`.
- [ ] Services (tipos de corrida) + `service-details`.
- [ ] Passengers CRUD, DocumentType, VehicleDocuments, PeakHour, SupportSubject.
- [ ] Push/topics de mobilidade, favoritePlaces, chosenDestinations, indication, QR driver, slider mobility, agenda/agendamentos, extract, discount paginator, report adm (races/passenger/driver).

### 1.28 Wallet (admin) — vouchers / recarga
- [ ] `/v2/vouchers` (CRUD + validate) + recarga por voucher (hoje só balance/credit/debit manual).

### 1.29 Catálogo ECBR / Image Bank
- [ ] `/v2/ecbr-image-bank` (product-bank, generate-code, sync, barcode) e `/imageBank`.

### 1.30 Endereço / Company público
- [ ] `/v2/company/register-company`, `/v2/company/location`, `/v2/address`.

### 1.31 Twilio (verificação de número)
- [ ] Rota `/twilio` (via microserviço?).

---

## Passo 2 — Painel Admin React: telas a criar/ativar

> O painel React (`frontend-react`) já tem boa base. Faltam telas e correções.

### 2.1 Ativar telas existentes mas fora da rota
- [x] **Products.jsx** — adicionar rota `/products` + link no sidebar (hoje é código morto não-roteado).
- [x] **Painel.jsx** — adicionar rota/sidebar "Painel de Pedidos" (hoje existe mas inacessível).

### 2.2 Correções de consistência
- [ ] `payments` não é usado — o cálculo client-side de `Payments.jsx` usa dados reais (pedidos entregues + fees do settings); o endpoint `/payments` (model `Payment`) é de transações de pagamento, semântica diferente. A migração do repasse/comissão para server-side fica registrada na **Fase 1.9** (Payment/repasse), não quebrando a tela atual. *(NÃO forçado agora — verificado e documentado.)*
- [x] Unificar serviços: `Categories`, `Banners` e `Products` usavam `api.get/delete` direto — refatorados para `categoryService`, `bannerService`, `productService`.
- [x] Verificado: `promo` singular **está correto** no backend (`/promo` — montado em `routes/index.ts`); `promoService` do frontend já usa `/promo`. Contrato `wallet` confirmado: `GET /wallet/balance` e `/wallet/transactions` aceitam `driverId` via **query param**, igual ao frontend. Nenhum ajuste necessário.
- [x] `Profile.jsx` — "último acesso" real: backend agora grava `lastLogin` no login (`auth.service.ts`) e o Profile busca dados atualizados via `GET /auth/me` (novo `authService.me` + `refreshUser` no AuthContext), mostrando `current.lastLogin` (fallback `—`) em vez de `new Date()`.

### 2.3 Novas telas por módulo migrado (criar quando o backend da fase 1 estiver pronto)
- [ ] Finanças: Digital Accounts (bancos/agências/contas), Extrato, Cost Centers, Subordinados, Type Payments, Chargeback, Invoices.
- [ ] Cashback: campanhas, recebidos, histórico.
- [ ] HelpDesk/FAQ: tickets + interações, FAQ.
- [ ] Email: tipos, templates, variáveis.
- [ ] Marketing: campanhas.
- [ ] Supermercado: departamentos, tabloid, schedules, invoices, loose-delivery.
- [ ] Packing, Shopper, Franquias.
- [ ] Pré-registro entrega/motorista + aprovação.
- [ ] NOC/Monitor (pedidos/vendas tempo real).
- [ ] Tools: Popup, Integrations, compressão de imagem.
- [ ] Configurações de domínio: cidades, estados, timezones, types-users, app-version, bancos.
- [ ] ACL: roles, permissões, módulos, grupos de acesso, access-flow.
- [ ] Acessórios (loja não-food) + complementos de produto.
- [ ] Mobility: services, passengers, schedules, vehicles, documents, peak hours, push, reports, maps.
- [ ] Wallet admin: vouchers, recarga.
- [ ] Chat por pedido (supervisão).
- [ ] Log/auditoria.
- [ ] Busca de empresa/produtos.

---

## Passo 3 — Apps Mobile (React Native) + OTA

### 3.1 OTA end-to-end
- [ ] Implementar módulo nativo **`OTAStorage`** (Android + iOS) de `saveBundle`/`loadBundle` (hoje só existe o wrapper JS + server; sem nativo o bundle não é aplicado).
- [ ] Resolver conflito de porta 8500 (OTA vs `deliveryman-microservice/docker-compose.yml`).
- [ ] Publicar um bundle real de teste ponta a ponta (storage só tem arquivos de teste).

### 3.2 Alinhamento de versões/stack
- [ ] Deliveryman app: RN 0.62/React 16 é antigo — avaliar upgrade (client/driver já em RN 0.65; shopper em 0.64).
- [ ] Shopper: remover `routes/shopperStack.routes.tsx` legado e dependência `react-navigation@4` (dead code).
- [ ] Alinhar versões do SDK Firebase entre apps (v11 → v17).

### 3.3 Migrar apps mobile para o backend moderno
- [ ] Confirmar/adicionar endpoints modernos consumidos por cada app (client/deliveryman/driver/shopper) conforme módulos da Fase 1.
- [ ] Migrar login/cadastro mobile para o fluxo `auth` moderno.

---

## Passo 4 — Integrações (ERP / terceiros)

### 4.1 Diretório `delivery_toop-integrations` está vazio
- [ ] Definir/migrar serviços de integração (Pratiko, Viva Sistemas, RPInfo) — hoje só existem como código legado.
- [ ] Rota `/tools/integrations` + sync de imagem + `v1/all/unsynchronized-departments`.

### 4.2 Gateway de integrações
- [ ] Definir porta/rota do gateway de integrações (`apiIntegrationsURL`) e consumo pelos microserviços.

---

## Passo 5 — Produção / Deploy / Segurança

### 5.1 Segurança (pendências do README — validar se já resolvidas)
- [ ] (Confirmado) Chaves `.pem`/`.key` **NÃO** estão no git — manter `.gitignore` bloqueando; auditar de novo antes de qualquer push.
- [ ] Revogar service account Firebase `food-syulnv` no Google Cloud Console (se ainda ativa).
- [ ] Confirmar nenhuma chave Firebase/adminsdk commitada no histórico (limpar com BFG se houver).
- [ ] Gerar `.env` de produção com senhas fortes (existe `.env.production.example`).

### 5.2 CI/CD
- [ ] Revisar `.github/workflows/ci.yml` e `ci-cd.yml` — confirmar que builds/testes rodam para os 4 apps web + backend + painel.
- [ ] Definir pipeline de build/assemble dos apps mobile (Android/iOS) e publicação via OTA.

### 5.3 Testes
- [ ] Rodar e cobrir testes do backend (`delivery_toop-admin/backend/__tests__`).
- [ ] Adicionar testes para módulos migrados da Fase 1.
- [ ] Adicionar testes de UI no painel React (hoje apenas unitários de backend).

### 5.4 Monitoramento
- [ ] Confirmar dashboards Grafana/Prometheus provisionados refletindo os novos módulos.

---

## Registro de progresso

| Data | Itens concluídos |
|------|------------------|
| 28/08/2026 | Documento criado partindo do mapeamento completo. Nenhum item de migração ainda concluído. |
| 28/08/2026 | Fase 2.1 — ativadas as telas do painel React: `Products` (rota `/products`) e `Painel de Pedidos` (rota `/painel`), com links no sidebar. Build vite OK. |
| 28/08/2026 | Fase 2.2 — unificados services em Categories/Banners/Products; "último acesso" real no Profile (backend grava `lastLogin` + `authService.me`/`refreshUser`); verificados contratos `promo` (singular, correto) e `wallet` (query driverId). Item `payments` documentado para Fase 1.9. Builds vite + tsc OK. |
| 28/08/2026 | Fase 1.1 Finance (abordagem novo/autônomo aprovada) — criados models CostCenter/TypePayment/Bank/Agency/DigitalAccount(+extract)/Chargeback, `finance.service`/`controller`/`routes` montados sob `/finance`. Endpoints validados em runtime: `/finance/balances` (agregação com dados reais) e CRUD cost-centers com auth. `tsc --noEmit` OK, admin-api reiniciado. Subordinate/split Braspag/invoices/franquia ficam p/ Fases 1.9/1.13. |
| 28/08/2026 | Fase 1.3 HelpDesk/FAQ — criados models `HelpTicket`/`TicketInteraction`/`Faq` + `helpdesk.service`/`controller`/`routes` (`/helpdesk/*`, `/faq`). Criar ticket gera interação inicial (lógica legada); consulta por protocolo retorna ticket+interações. Fluxo validado em runtime com auth (criar ticket, buscar por protocolo, listar interações). `tsc --noEmit` OK. |
| 28/08/2026 | Fase 1.5 Marketing + 1.7 Aplicativos — criados models `Campaign` e `AppCategory` + `marketing.service`/`app.service`/`controllers`/`routes` (`/marketing/campaign`, `/application/category`), CRUD autenticado com soft-delete `deletedAt`. Desacoplados do legado (`segment` string no lugar de ref `CompanySegment`/franchise; typos `dowload*` corrigidos). Criar+listar validados em runtime. `tsc --noEmit` OK. |
| 28/08/2026 | Fase 1.4 Email — criados models `EmailType`/`EmailTemplate`/`EmailVariable` + `email.service`/`controller`/`routes` (`/emails/types`, `/emails/templates`, `/emails/variables`) montados em `routes/index.ts`. CRUD autenticado; template com `populate` de type; variables somente leitura (comportamento legado). Fluxo validado em runtime: criar type + template + listar. `tsc --noEmit` OK. Registros de teste removidos. |
| 29/08/2026 | Fase 1.14 Pré-registro + 1.16 Tooling — criados models PreRegistration/DynamicPreRegister (com InputTypeShema/UploadDocPhotoShema), Popup/PopupView/Integration + services/controllers/routes (`/pre-register`, `/tools/popup`, `/tools/integrations`) montados em routes/index.ts. Fluxos validados em runtime: pré-registro público (create/list/dynamic/listViews), popup CRUD+visibility (updateViews incrementa quantityViews, listPopupApp retorna popup vigente não-visto) e integrações. Compressão de imagem e syncImage documentados como adiados (dependem de S3/Bull/API externa). `tsc --noEmit` OK. |
