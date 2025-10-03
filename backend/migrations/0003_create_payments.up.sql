CREATE TABLE IF NOT EXISTS payments (
    id                   BIGSERIAL PRIMARY KEY,
    user_id              BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    provider             TEXT NOT NULL,      -- 'kaspi' | 'stripe' (на будущее)
    CONSTRAINT payments_provider_chk
        CHECK (provider IN ('kaspi','stripe')),

    provider_payment_id  TEXT,               -- id транзакции в платёжке (уникален в рамках провайдера)
    amount_kzt           INTEGER NOT NULL,   -- сумма в тенге (целым числом)
    currency             CHAR(3) NOT NULL DEFAULT 'KZT',

    status               TEXT NOT NULL,      -- 'pending' | 'succeeded' | 'failed' | 'refunded'
    CONSTRAINT payments_status_chk
        CHECK (status IN ('pending','succeeded','failed','refunded')),

    paid_at              TIMESTAMP,          -- момент успешной оплаты (если succeeded)
    raw_payload          JSONB,              -- полный ответ/вебхук от провайдера (для отладки/аудита)

    created_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Уникальность идентификатора транзакции у конкретного провайдера
CREATE UNIQUE INDEX IF NOT EXISTS uq_provider_payment
ON payments (provider, provider_payment_id);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);
