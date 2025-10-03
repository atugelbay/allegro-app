CREATE TABLE IF NOT EXISTS subscriptions (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    plan            TEXT NOT NULL,
    status          TEXT NOT NULL,
    -- допустимые план/статус контролим CHECK'ами
    CONSTRAINT subscriptions_plan_chk
        CHECK (plan IN ('basic','pro','family')),
    CONSTRAINT subscriptions_status_chk
        CHECK (status IN ('trialing','active','past_due','canceled')),

    started_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    renew_at        TIMESTAMP,               -- дата следующего списания (если активна)
    canceled_at     TIMESTAMP,               -- когда отменили (если отменена)
    trial_until     TIMESTAMP,               -- конец триала (если есть)

    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Обновляем updated_at автоматически
CREATE OR REPLACE FUNCTION set_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE PROCEDURE set_subscriptions_updated_at();

-- В один момент времени у пользователя может быть только одна активная/триальная подписка
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_subscription_per_user
ON subscriptions (user_id)
WHERE status IN ('active','trialing');

-- Быстрые выборки
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);
