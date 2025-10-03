import { useEffect, useState } from "react";
import { api } from "../api";

const PLANS = [
  { 
    id: "basic", 
    title: "Basic", 
    price: 3990,
    icon: "🎵",
    description: "Идеально для начинающих",
    features: [
      "Базовые уроки гитары",
      "10 часов контента в месяц",
      "Поддержка в чате",
      "Мобильное приложение"
    ]
  },
  { 
    id: "pro", 
    title: "Pro", 
    price: 6990,
    icon: "🎸",
    description: "Для серьезных музыкантов",
    features: [
      "Все базовые функции",
      "Продвинутые уроки",
      "Безлимитный контент",
      "Персональные рекомендации",
      "Приоритетная поддержка"
    ],
    popular: true
  },
  { 
    id: "family", 
    title: "Family", 
    price: 9990,
    icon: "👨‍👩‍👧‍👦",
    description: "Для всей семьи",
    features: [
      "Все Pro функции",
      "До 6 аккаунтов",
      "Детские уроки",
      "Семейный прогресс",
      "Групповые задания"
    ]
  }
];

export default function Subscriptions() {
  const [sub, setSub] = useState(null);
  const [currentSub, setCurrentSub] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const response = await api("/subscriptions/me");
      setSub(response);
      setCurrentSub(response.subscription);
    } catch (e) {
      setSub({ hasActiveSubscription: false, subscription: null });
      setCurrentSub(null);
    }
  };

  useEffect(() => { load(); }, []);

  const choose = async (plan, amount) => {
    setMsg("");
    setLoading(true);
    
    try {
      // активируем подписку
      await api("/subscriptions", { method: "POST", body: { plan } });
      setMsg("Подписка успешно активирована! 🎉");
      load();
    } catch (e) {
      setMsg(e.message || "Ошибка оформления");
    } finally {
      setLoading(false);
    }
  };

  const isCurrentPlan = (planId) => {
    return currentSub && currentSub.plan === planId;
  };

  return (
    <div className="page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Выберите подписку</h1>
          <p className="page-subtitle">
            Получите доступ к премиум урокам музыки и изучайте любимые инструменты
          </p>
        </div>

        {/* Current Subscription Status */}
        {sub?.hasActiveSubscription && currentSub && (
          <div className="current-subscription">
            <div className="current-sub-card">
              <div className="current-sub-icon">✨</div>
              <div className="current-sub-info">
                <h3>Активная подписка</h3>
                <p>План: <strong>{currentSub.plan}</strong></p>
                <p>Статус: <span className="status-badge">{currentSub.status}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {msg && (
          <div className={`message ${msg.includes('🎉') ? 'message-success' : 'message-error'}`}>
            {msg}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="pricing-grid">
          {PLANS.map(plan => (
            <div 
              key={plan.id} 
              className={`pricing-card ${plan.popular ? 'popular' : ''} ${isCurrentPlan(plan.id) ? 'current' : ''}`}
            >
              {plan.popular && <div className="popular-badge">Популярный</div>}
              {isCurrentPlan(plan.id) && <div className="current-badge">Текущий план</div>}
              
              <div className="pricing-header">
                <div className="pricing-icon">{plan.icon}</div>
                <h3 className="pricing-title">{plan.title}</h3>
                <p className="pricing-description">{plan.description}</p>
              </div>

              <div className="pricing-price">
                <span className="price-amount">{plan.price.toLocaleString()}</span>
                <span className="price-currency">₸/мес</span>
              </div>

              <div className="pricing-features">
                {plan.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <span className="feature-check">✓</span>
                    <span className="feature-text">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => choose(plan.id, plan.price)}
                disabled={loading || isCurrentPlan(plan.id)}
                className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} pricing-button`}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Активация...
                  </>
                ) : isCurrentPlan(plan.id) ? (
                  'Активен'
                ) : (
                  'Выбрать план'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .current-subscription {
          margin-bottom: var(--space-3xl);
          animation: fadeIn 0.5s ease-out;
        }

        .current-sub-card {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          background: var(--gradient-primary);
          color: white;
          padding: var(--space-xl);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
          max-width: 500px;
          margin: 0 auto;
        }

        .current-sub-icon {
          font-size: 3rem;
          animation: float 3s ease-in-out infinite;
        }

        .current-sub-info h3 {
          color: white;
          margin-bottom: var(--space-sm);
          font-size: 1.5rem;
        }

        .current-sub-info p {
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: var(--space-xs);
        }

        .status-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius-md);
          text-transform: capitalize;
          font-weight: 600;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-lg);
          max-width: 1200px;
          margin: 0 auto;
        }

        .pricing-card {
          background: white;
          border-radius: var(--radius-xl);
          padding: var(--space-2xl);
          box-shadow: var(--shadow-lg);
          border: 2px solid var(--neutral-200);
          transition: all var(--transition-normal);
          position: relative;
          overflow: hidden;
          animation: fadeIn 0.6s ease-out;
        }

        .pricing-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-2xl);
          border-color: var(--primary-300);
        }

        .pricing-card.popular {
          border-color: var(--primary-500);
          transform: scale(1.05);
        }

        .pricing-card.popular:hover {
          transform: scale(1.05) translateY(-8px);
        }

        .pricing-card.current {
          border-color: var(--success);
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        }

        .popular-badge, .current-badge {
          position: absolute;
          top: -1px;
          right: var(--space-lg);
          background: var(--gradient-primary);
          color: white;
          padding: var(--space-sm) var(--space-lg);
          border-radius: 0 0 var(--radius-lg) var(--radius-lg);
          font-size: 0.85rem;
          font-weight: 600;
          box-shadow: var(--shadow-md);
        }

        .current-badge {
          background: var(--success);
        }

        .pricing-header {
          text-align: center;
          margin-bottom: var(--space-xl);
        }

        .pricing-icon {
          font-size: 4rem;
          margin-bottom: var(--space-md);
          animation: float 4s ease-in-out infinite;
        }

        .pricing-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--neutral-800);
          margin-bottom: var(--space-sm);
        }

        .pricing-description {
          color: var(--neutral-600);
          font-size: 1rem;
          margin-bottom: 0;
        }

        .pricing-price {
          text-align: center;
          margin-bottom: var(--space-2xl);
          padding: var(--space-lg) 0;
          border-bottom: 2px solid var(--neutral-100);
        }

        .price-amount {
          font-size: 3rem;
          font-weight: 800;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .price-currency {
          font-size: 1.25rem;
          color: var(--neutral-600);
          font-weight: 600;
        }

        .pricing-features {
          margin-bottom: var(--space-2xl);
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-md);
          padding: var(--space-sm) 0;
        }

        .feature-check {
          color: var(--success);
          font-weight: bold;
          font-size: 1.2rem;
          width: 20px;
          flex-shrink: 0;
        }

        .feature-text {
          color: var(--neutral-700);
          font-size: 0.95rem;
        }

        .pricing-button {
          width: 100%;
          font-size: 1.1rem;
          padding: var(--space-md) var(--space-lg);
          font-weight: 700;
          transition: all var(--transition-normal);
        }

        .pricing-button:disabled {
          opacity: 0.7;
          transform: none !important;
        }

        /* Tablet adjustments */
        @media (max-width: 1024px) {
          .pricing-grid {
            gap: var(--space-md);
            max-width: 900px;
          }
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          .pricing-grid {
            grid-template-columns: 1fr;
            gap: var(--space-lg);
          }
          
          .pricing-card.popular {
            transform: none;
          }
          
          .pricing-card.popular:hover {
            transform: translateY(-4px);
          }
          
          .current-sub-card {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
