# GoJá Delivery — Plano de Migração

> Documento de controle do que **ainda não foi migrado** do sistema legado para o backend/painel moderno (TypeScript + React). Cada item tem etapas e um checkbox `[ ]` para marcarmos `[x]` conforme for realizado.

**Última atualização:** 01/09/2026

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
- [x] Model `CashbackCampaign` + `CashbackCustomer` (saldo/histórico/total por mês).
- [x] Rotas: `/cashback/campaigns`, `/cashback/used/paginator`, `/cashback/customer/...`.

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

### 1.6 Notificações administrativas
- [x] Criar/atualizar/deletar notificação (`POST/PUT/DELETE /notifications/:id`) e **enviar push** por Firebase (`POST /notifications/send` — cria a notificação e envia FCM por tópico; `POST /v2/notification-topic/send`). Envio via `firebase-admin` direto (não proxy p/ 8200). **Degrada com mensagem clara quando não há Service Account** (`FIREBASE_ADMIN_*`).
- [x] Tópicos de push + usuário-por-tópico (`POST /v2/notification-topic` — inscreve/desinscreve token em tópicos `{name}[_{value}]`).

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
- [x] Cupons por empresa, por cliente, cupom de destaque/high. *(01/09/2026)*
- [ ] Model `Offer` (oferta por empresa, distinto de Promo). *(ainda pendente — oferta por empresa fica registrada p/ implementação futura)*

### 1.11 Pedido "loose delivery" (delivery avulso)
- [x] Model + rotas `/loose-delivery` (+ address). *(01/09/2026 — fluxo adaptado ao domínio moderno de `Order`/`DeliveryAddress`; sem geocodificação externa nem customer/person fixos do legado)*

### 1.12 Embalagem / Packing e Shopper
- [x] Model `Packing`. *(01/09/2026)*
- [x] Model `Shopper` + atribuição a itens de carrinho. *(01/09/2026 — CRUD completo; atribuição a itens de carrinho fica registrada p/ 1.8 fluxo shopping)*

### 1.13 Franquia / Franchise
- [x] Model `Franchise` + config genérica. *(01/09/2026 — sub-schemas bankData/location/settingsDrive/settingsRace embutidos; state/city refs SettingState/SettingCity mantidos como ObjectId (models 1.19 pendentes); desacopladas integrações Pagar.me split, geocode Google e criação automática de conta digital (registradas p/ 1.9/1.13))*
- [x] Rotas `/franchises` + self-registration público. *(01/09/2026 — CRUD + paginator/search/list-all + `/public` sem auth + `/config/:company`)*

### 1.14 Pré-registro / dinâmico
- [x] Model `PreRegistration` (collection `preRegistration`, campos como ddi/phone/name/email/cpf/nif/status PENDENTE·APPROVED·ANALYZE·DECLINED·RESENT, fotos/documentos, vehicle*, bankData embutido, viewStop/NextRegister, soft-delete deletedAt) + `DynamicPreRegister` (collection `dynamicPreRegister`, schemas embutidos `InputTypeShema`/`UploadDocPhotoShema`). Padrão moderno. Desacoplado: ref `franchise`/`application` não resolvidos (models ainda não migrados).
- [x] Rotas `/pre-register` (PÚBLICAS como no legado: create/list-by-phone/update/delete, `/dynamic`, `/dynamic-record/:id`; `/paginator` autenticado). Fluxo validado em runtime.

### 1.15 Monitor (dashboards tempo real)
- [x] Rotas `/monitor/order`, `/monitor/sales` (pedidos e vendas em tempo real). *(01/09/2026 — ver log)*

### 1.16 Tooling: Popup / Integrações / compressão
- [x] Model `Popup` (collection `popup`: images, name, company ref `Company`, status, startDate/endDate, priorities, vizualizations limite, quantityViews contador, message, textMessageButton, width/height, url, redirectTo enum HOME/URL/ROUTE, startHour/endHour, soft-delete) + `PopupView` (collection `popupView`) + rotas `/tools/popup` (CRUD+updateViews+listPopupApp). Lógica de visibilidade (data/hora/prioridade/limite de views/não-visto) implementada e validada em runtime.
- [x] Model `Integration` (collection `int_integrations`: company ref `Company`, system enum JM_Diamante/RpInfo/Viva_Sistemas, status, soft-delete) + rotas `/tools/integrations` (CRUD+paginator+por-empresa). Validado em runtime.
- [ ] Serviço de compressão de imagem: ADIADO — depende de infraestrutura externa (Bull/Redis, DigitalOcean Spaces/S3, sharp, multer-s3) NÃO presente no backend moderno; e `/food/compress-image` e `/food/change-folder` (legado) dependem de S3. Documentado como pendente de infra.
- [ ] Sync de imagem (`syncImage`): ADIADO — depende de API externa `PRODUCT_IMAGE_API` com tokens hardcoded no legado (segredo). Documentado como pendente.

### 1.17 Cliente / DeliveryAddress / Guest / Person
- [x] Model `DeliveryAddress` + rotas (salvar/editar endereços do cliente). *(01/09/2026 — coleção `customer_delivery_address`; `customer` ref `User` (cliente moderno); `location` 2dsphere obrigatório (lat/lng); `main` único por cliente com propagação automática em create/update; rota `/delivery-address/*` com list por cliente, search (customer/main), find, create/update/delete (soft `isDeleted`). `newTopic` de notificações por cidade desacoplado (item 1.35 pendente))*
- [x] Model `Guest`. *(01/09/2026 — coleção `guest`; rotas públicas `/guest` (POST/PUT upsert por `device`, GET por device) espelhando legado sem auth)*
- [x] Model `Person` (identidade física + indicação) separado de User. *(01/09/2026 — coleção `person` (mesma do legado); refs franchise/company/city(SettingCity); rota `/person/*` com CRUD, paginator (pageIn/pageOut + nome/cpf), listPorNome, search (phone/email/id), avatar; status normalizado (string vazia/null → false); `referralCode` validado no update, criação de `Indication` adiada (model não migrado))*
- [x] Duplicados (`DuplicateRecords`) e normalização. *(01/09/2026 — `/person/register-duplicates?type=person&field=phone|email` via aggregate; branch `customer` não aplicável — modelo `Customer` não migrado (registrado)*

### 1.18 ACL / Permissões / Roles / AccessGroup / AccessFlow
- [x] Models `Role`, `Permission`, `Module`, `AccessGroup`, `AccessFlow`. *(01/09/2026 — coleções `acl_roles`/`acl_permissions`/`settingModule`/`settingController`/`acessGroup`/`accessFlow`; + `Group`)*
- [x] Rotas `/acl/*`, `/accessGroup`, `/report/access-flow`, `/group`. *(01/09/2026 — ver log)*
- [x] Controle por permissão no painel React (aplicar no frontend-react as guards por role). *(01/09/2026 — página `/acl` só aparece para admin/manager; ver log)*

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
| 01/09/2026 | Fase 1.2 Cashback (piloto completo backend + tela painel) — criados models `CashbackCampaign`/`CashbackCustomer`/`CashbackCustomerBalance` (dessacoplados: `companies` ref Company + `allApp`, sem Franquia) + `cashback.service`/`controller`/`routes` montados sob `/cashback` (CRUD campaigns + list/balance/byMonth por customer + `used/paginator` com lookups User/Order/Campaign). CreateDefine `balance=amount`. Fluxo validado em runtime (login admin → criar campanha → listar → paginator). `tsc --noEmit` OK, admin-api reiniciado. Painel React: `cashbackService` + página `Cashbacks.jsx` (abas Campanhas / Cashback Utilizado) + rota `/cashback` + item no sidebar. `vite build` OK, frontend-react reiniciado. |
| 01/09/2026 | Fase 1.10 Cupons Compráveis (backend + tela painel) — criados models `Coupon`/`CompanyCoupon`/`CouponCustomer` (coleções `coupon`/`company_coupon`/`coupon_customer`; distinto do Promo: cupom comprável com `price`/`discountPercentage`/`limit`/`onlyFirstPurchase`/`minPriceDelivery`/datas/`allCompanies`) + `coupon.service`/`controller`/`routes` montados sob `/coupon` (CRUD + display + `highCupon` sort `-price` + `companyCoupons` aggregate com lookup + `couponCustomer`/`couponCustomerPaginator` com lookups). Removido `.populate('couponCompany')` do `highCupon` (virtual inexistente). Fluxo validado em runtime: criar 2 cupons (allCompanies e por empresa) → `paginator`/`highCupon`/`companyCoupons`/`display`/`coupon-customer-paginator` OK. `tsc --noEmit` OK. Painel React: `couponService` + página `Coupons.jsx` (abas Cupons / Utilizados) + rota `/coupons` + item sidebar "Cupons Compráveis". `vite build` OK. Model `Offer` (oferta por empresa) permanece pendente. |
| 01/09/2026 | Fase 1.12 Embalagem/Packing + Shopper (backend + tela painel) — criados models `Packing` (coleção `packing`, name/status, soft-delete) e `Shopper` (coleção `shopper`, isOnline/person ref User/company ref Company/device/token/status/appVersion, soft-delete) + `packing.service`/`shopper.service`/`controllers`/`routes` montados sob `/packing` e `/shopper` (CRUD + listByName/search com filtros). Fluxo validado em runtime: packing create/list/update/delete OK; shopper create (populates company+person)/list/paginator/search/update/delete (soft) OK. `tsc --noEmit` OK. Painel React: `packingService` + `shopperService` + páginas `Packings.jsx` (`/packings`) e `Shoppers.jsx` (`/shoppers`, com selects de empresa e usuário) + items no sidebar. `vite build` OK. Atribuição de shopper a itens de carrinho fica registrada p/ 1.8 fluxo shopping. |
| 01/09/2026 | Fase 1.13 Franquia/Franchise (backend + tela painel) — criado model `Franchise` (coleção `franchise`, sub-schemas embutidos bankData/location/settingsRace/settingsDriver/showPhoneRace/routeSettings; state/city refs SettingState/SettingCity mantidos como ObjectId) + `franchise.service`/`controller`/`routes` montados sob `/franchises` (CRUD + paginator com lookups settingCity/settingState + search + list-all + `POST /public` self-registration sem auth + `GET /config/:company`). Desacopladas integrações externas: split Pagar.me (recipient), geocodificação Google (location aceita do body) e criação automática de conta digital (registradas p/ 1.9/1.13). Fluxo validado em runtime: create (valida email duplicado) → list/paginator/search/update/delete(soft) OK; config e public-register OK; dados de teste soft-deletados. `tsc --noEmit` OK. Painel React: `franchiseService` + página `Franchises.jsx` (`/franchises`, modal-lg novo no CSS) + item no sidebar. `vite build` OK. Subordinado/split Braspag e saldo por franquia permanecem p/ 1.9. |
| 01/09/2026 | Fase 1.17 Cliente/DeliveryAddress/Guest/Person (backend) — criados models `Person` (coleção `person`, refs Franchise/Company/SettingCity; `referralCode` único sparse), `DeliveryAddress` (coleção `customer_delivery_address`, `location` Point 2dsphere, `customer` ref `User`, `main` + `isDeleted`) e `Guest` (coleção `guest`, `device` único). Services/controllers/routes: `/person/*` (CRUD, paginator pageIn/pageOut + nome/cpf, listPorNome, search phone/email/id, avatar, register-duplicates via aggregate, status "" → false, ddi decode, validação de `referralCode` no update — Indication adiada), `/delivery-address/*` (list por cliente, search customer/main, find, create/update exigem lat/lng e propagam `main` único, delete soft `isDeleted`; newTopic de cidade desacoplado), `/guest` público (create/get/update upsert por device, sem auth como no legado). Fluxo validado em runtime p/ os três módulos (criação → listas/update/delete/duplicados/edge-cases) e `tsc --noEmit` OK. Dados de teste removidos (soft-delete + limpeza direta do guest). `Customer` e `Indication` não migrados permanecem pendentes. |
| 01/09/2026 | Fase 1.11 Pedido loose-delivery (backend) — criado módulo `/loose-delivery` (POST create + GET address) sobre o domínio moderno. `create` valida empresa (CompanyModel), latitude/longitude, total e frete; persiste um `DeliveryAddress` (customer = usuário autenticado) e cria um `Order` do tipo "Entrega avulsa" (item genérico, `deliveryAddress` embutido, `paymentStatus: pending`, `typeOfVehicle` opcional validado contra MOTO/CARRO/BICICLETA — campo novo no schema de `Order`). Desacoplado do legado: sem customer/person fixos `60df17...` (usa o usuário autenticado), sem geocodificação Google Maps (`/address` valida coordenadas e explica que geocoding externo não está configurado — rotulado pendente), sem despacho automático por `/order/status` externo (entrega avulsa inicia `pending`; despacho p/ 1.23). Fluxo validado em runtime: validações de campos, criação de endereço+pedido, persistência de `typeOfVehicle`, ordem listável em `/orders`. `tsc --noEmit` OK; dados de teste removidos via mongosh. |
| 01/09/2026 | Fase 1.18 ACL / Permissões / Roles / AccessGroup / AccessFlow (backend + tela painel) — criados models `Role` (acl_roles), `Permission` (acl_permissions, ref Role), `SettingModule` (settingModule), `SettingController` (settingController, ref Module), `AccessGroup` (acessGroup, ref Module), `AccessFlow` (accessFlow) e `Group` (group) + `acl.service`/`access-group.service`/`access-flow.service`/`group.service` + controllers/routes montados em routes/index.ts: `/acl/roles` (CRUD + paginator + listPorNome), `/acl/permissions` (CRUD + paginator + list com populate roles), `/acl/users` (deriva roles/permissions do `role` moderno do User — sem isRoot/franchises/person do legado), `/settings/modules` e `/settings/controllers` (CRUD p/ árvore do AccessGroup), `/access-group` (tree com populate modules + CRUD), `/report/access-flow` (create PÚBLICO com upsert diário por device/customer/person + list agrupado por dia + statistic por `timeInterval`), `/group` (CRUD + paginator + listPorNome, delete soft `deletedAt`). Validações explícitas de campos obrigatórios retornando 400 (não 500). Fluxo validado em runtime: create/update/list/paginator/search de roles, permissions (com populate roles), modules/controllers, access-group tree, access-flow público (create + upsert + list + statistic) e group; validação de campos obrigatórios → 400; dados de teste removidos via mongosh. `tsc --noEmit` OK, admin-api reiniciado. Painel React: `aclService` + `accessGroupService` em `api.js` + página `AccessControl.jsx` (`/acl`) com abas Roles/Permissões/Grupos + item no sidebar `adminOnly` (guard por role: só admin/manager vê), espelhando o controle por permissão do legado. `vite build` OK. |
| 01/09/2026 | Fase 1.15 Monitor (dashboards tempo real, backend) — criado `monitor.service`/`controller`/`routes` montado em `/monitor`: `GET /monitor/order` (lista pedidos em tempo real sobre a coleção `orders` moderna — default filtra status ativos `$nin [delivered,cancelled]`, filtro por `status`, lookup `users` (customer, project name/email) + `companies` (name/images), paginação com lookups preservando nulls, retorna `{list,total}`), `GET /monitor/order/:orderId` (detalhe com populate company/customer/deliveryman→person; valida ObjectId e retorna 400 "Informe um pedido válido"), `GET /monitor/sales` (vendas das últimas 24h agrupadas por hora: total + finished por status, default `delivered`, escopo por empresa via `dataDay`/`status`; 24 buckets). Escopo por empresa do usuário logado (root/admin/manager sem escopo; demais restringe ao `company` do User). Desacoplado do legado: sem `customer`/`payment`/`customerDelivery`/`shopper`/`QueueDeliveryMan` (coleções legadas inexistentes no moderno — `customer` virou lookup `users`, `payment`/endereço são embutidos no `Order`, n/a fila de entregadores p/ 1.23). Fluxo validado em runtime: list default (2 pending, exclui delivered/cancelled), filtro por status, detail com populates, bad id → 400, sales 24 buckets; dados de teste removidos via mongosh. `tsc --noEmit` OK, admin-api reiniciado. |
| 02/09/2026 | Fase 1.6 Notificações + push Firebase (backend + painel; config das credenciais). Config do Firebase Web SDK salvo na raiz (`firebase.txt` — GoJaDelivery, `enduring-honor-419212`, nº `52044825836`). Backend: novas envs em `config/index.ts` (web: `FIREBASE_API_KEY`/`AUTH_DOMAIN`/`PROJECT_ID`/`STORAGE_BUCKET`/`MESSAGING_SENDER_ID`/`APP_ID`/`DATABASE_URL`; admin p/ Service Account: `FIREBASE_ADMIN_ENABLED`/`PROJECT_ID`/`CLIENT_EMAIL`/`PRIVATE_KEY`/`DATABASE_URL`) + `config/firebase.config.ts` (referência tipada da config web + flag `isFirebaseAdminEnabled`) + `services/firebaseAdmin.service.ts` (inicializa o app do Firebase Admin a partir do Service Account, **degradando graciosamente para null quando não há chave**) + `services/notification-topic.service.ts` (create — inscreve/desinscreve token em tópicos `{name}[_{value}]`, e send — push por condição `'{topic}' in topics && application_root && franchise_{}`). `notification.service` ganhou create/update/remove/createAndSend; rotas: `/notifications` (POST create, GET list, GET/:id, PUT/:id, DELETE/:id) + `POST /notifications/send` + `POST /v2/notification-topic` e `POST /v2/notification-topic/send` (autenticadas). Envio direto via `firebase-admin` (não proxy p/ microserviço 8200). Instalado `firebase-admin@11` no backend. Fluxo validado em runtime (sem Service Account): create/update/delete/list de notificações OK; `send`/`createAndSend`/topic degradam com `{success:false, error:"FCM não configurado: adicione um Service Account em FIREBASE_ADMIN_*"}` e `createAndSend` ainda persiste a notificação; dados de teste removidos. Painel React: instalado `firebase@10` web SDK + `src/services/firebase.js` (init a partir de `VITE_FIREBASE_*`, `requestPushToken` e `onForegroundMessage` com degrade) + `.env.example` do frontend documenta a config web + VAPID; `notificationService` estendido (create/update/delete/createAndSend/subscribeTopic/sendToTopic). `vite build` e `tsc --noEmit` OK. Pendente: Service Account (Console Firebase → Project settings → Service accounts) para envio real; VAPID key; tela dedicada de criar/enviar notificação no painel. |
