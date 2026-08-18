-- ============================================================================
-- database-postgres-payment.sql
-- Script de inicializacao do PostgreSQL para o servico de Pagamento
-- Compativel com PostgreSQL 13+ / Docker postgres:13
-- Montado em /docker-entrypoint-initdb.d/init.sql via docker-compose
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Invoices_typeInvoice') THEN
        CREATE TYPE "enum_Invoices_typeInvoice" AS ENUM ('INPUT', 'OUTPUT');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Invoices_statusInvoice') THEN
        CREATE TYPE "enum_Invoices_statusInvoice" AS ENUM ('WAITING', 'CONFIRMED');
    END IF;
END
$$;

-- ============================================================================
-- TABLE: Transactions
-- Migration: 20200727164616-Transactions.js
-- Model: ScheduleTransactions
-- ============================================================================

CREATE TABLE IF NOT EXISTS "Transactions" (
    "id"                INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "PaymentId"         VARCHAR(255)  NOT NULL,
    "CapturedDate"      VARCHAR(255)  NOT NULL,
    "MerchantId"        VARCHAR(255)  NOT NULL,
    "Nsu"               BIGINT        NOT NULL,
    "AuthorizationCode" VARCHAR(255)  NOT NULL,
    "AuthorizationDate" VARCHAR(255)  NOT NULL,
    "Status"            BIGINT        NOT NULL,
    "StatusDescription" VARCHAR(255)  NOT NULL,
    "CardNumber"        VARCHAR(255)  NOT NULL,
    "OrderId"           VARCHAR(255)  NOT NULL,
    "Schedules"         TEXT          NOT NULL,
    "createdAt"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: Invoices
-- Migration: 20200728164616-Invoice.js
--            20200820134957-invoice.js (adiciona paymentDate)
-- Model: Invoice (Sequelize)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "Invoices" (
    "id"                    BIGINT                                  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "payment"               VARCHAR(255)                            NOT NULL,
    "order"                 VARCHAR(255)                            NOT NULL,
    "ownerPerson"           VARCHAR(255),
    "ownerCompany"          VARCHAR(255),
    "person"                VARCHAR(255),
    "company"               VARCHAR(255),
    "shoppingCart"          VARCHAR(255)                            NOT NULL,
    "amount"                DOUBLE PRECISION                        NOT NULL,
    "totalPayment"          DOUBLE PRECISION                        NOT NULL,
    "typeInvoice"           "enum_Invoices_typeInvoice"             NOT NULL,
    "statusInvoice"         "enum_Invoices_statusInvoice"           NOT NULL,
    "paymentMethodCompany"  VARCHAR(255),
    "paymentDate"           TIMESTAMP WITH TIME ZONE,
    "createdAt"             TIMESTAMP WITH TIME ZONE                NOT NULL DEFAULT NOW(),
    "updatedAt"             TIMESTAMP WITH TIME ZONE                NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Composite index: Invoices (payment, order, createdAt)
-- Migration: 20200729164616-invoice.js
CREATE INDEX IF NOT EXISTS "idx_Invoices_payment_order_createdAt"
    ON "Invoices" ("payment", "order", "createdAt");

-- Index: Invoices (paymentDate)
-- Migration: 20200820134957-invoice.js
CREATE INDEX IF NOT EXISTS "idx_Invoices_paymentDate"
    ON "Invoices" ("paymentDate");

-- Indexes adicionais de performance baseados nos models e uso tipico
CREATE INDEX IF NOT EXISTS "idx_Transactions_OrderId"
    ON "Transactions" ("OrderId");

CREATE INDEX IF NOT EXISTS "idx_Transactions_PaymentId"
    ON "Transactions" ("PaymentId");

CREATE INDEX IF NOT EXISTS "idx_Invoices_typeInvoice"
    ON "Invoices" ("typeInvoice");

CREATE INDEX IF NOT EXISTS "idx_Invoices_statusInvoice"
    ON "Invoices" ("statusInvoice");

CREATE INDEX IF NOT EXISTS "idx_Invoices_company"
    ON "Invoices" ("company");

CREATE INDEX IF NOT EXISTS "idx_Invoices_person"
    ON "Invoices" ("person");

CREATE INDEX IF NOT EXISTS "idx_Invoices_ownerCompany"
    ON "Invoices" ("ownerCompany");

CREATE INDEX IF NOT EXISTS "idx_Invoices_ownerPerson"
    ON "Invoices" ("ownerPerson");
