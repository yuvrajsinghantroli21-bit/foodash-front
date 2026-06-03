import { useState } from "react";

const FEATURES = [
  {
    title: "Public Restaurant Website",
    tag: "Website",
    desc: "Give every restaurant a premium public website with brand story, contact, hero sections, menu preview and mobile-first design.",
    points: [
      "Premium public pages",
      "Dynamic branding",
      "Contact and location sections",
    ],
  },
  {
    title: "Menu Preview",
    tag: "Menu",
    desc: "A beautiful digital menu page where customers can view categories, items, food type, prices, images and availability.",
    points: ["Category filters", "Item images", "Admin menu updates"],
  },
  {
    title: "QR Table Ordering",
    tag: "Ordering",
    desc: "Customers scan table QR, browse menu, add items to cart and place orders directly from their phone.",
    points: ["Table-based QR sessions", "Cart flow", "My Order tracking"],
  },
  {
    title: "Live Admin Dashboard",
    tag: "Admin",
    desc: "Restaurant staff can see active orders, update status, print bills and manage table sessions in real-time.",
    points: ["Live orders", "Table grouping", "Bill print"],
  },
  {
    title: "Kitchen Display",
    tag: "Kitchen",
    desc: "A focused kitchen screen for preparing and serving food batches without confusion or extra manual work.",
    points: ["Batch-wise orders", "Item notes", "Served status"],
  },
  {
    title: "Analytics Dashboard",
    tag: "Analytics",
    desc: "Track revenue, orders, top-selling items, active tables, payment status and customer feedback insights.",
    points: ["Revenue insights", "Top items", "Feedback stats"],
  },
  {
    title: "Coupons & Offers",
    tag: "Marketing",
    desc: "Create discount coupons, reward feedback, promote offers and encourage repeat customers.",
    points: ["Coupon validation", "Reward coupons", "Offer control"],
  },
  {
    title: "Staff Roles",
    tag: "Security",
    desc: "Give proper access to admin, cashier and kitchen staff so every role sees only what they need.",
    points: ["Admin access", "Cashier access", "Kitchen access"],
  },
];

const WORKFLOW = [
  "Restaurant registers on FoodDash",
  "Admin configures branding and menu",
  "FoodDash generates QR and public pages",
  "Customers scan QR and order",
  "Staff manages orders live",
  "Owner tracks analytics and growth",
];

const COMPARISON = [
  ["Public website", true, true, true],
  ["Menu preview", true, true, true],
  ["QR ordering", false, true, true],
  ["Live order dashboard", false, true, true],
  ["Kitchen display", false, false, true],
  ["Analytics", false, false, true],
  ["Coupons", false, false, true],
  ["Staff roles", false, false, true],
];

const Check = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M5 12h14M12 5l7 7-7 7"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Features() {
  const [active, setActive] = useState(0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Manrope', sans-serif;
          background: #f7f2eb;
        }

        .fd-features-page {
          min-height: 100vh;
          padding: 18px;
          background:
            radial-gradient(circle at 8% 4%, rgba(245,158,11,.16), transparent 26%),
            radial-gradient(circle at 90% 10%, rgba(28,18,12,.12), transparent 28%),
            #f7f2eb;
          color: #1c120c;
        }

        .fd-shell {
          max-width: 1420px;
          margin: 0 auto;
          overflow: hidden;
          border-radius: 38px;
          background: rgba(255,255,255,.78);
          border: 1px solid rgba(28,18,12,.08);
          box-shadow: 0 34px 100px rgba(28,18,12,.16);
          backdrop-filter: blur(18px);
        }

        .fd-hero {
          position: relative;
          overflow: hidden;
          padding: 72px 58px 56px;
          background: linear-gradient(160deg,#1a0f06 0%,#261508 48%,#1e1108 100%);
          color: #fffaf0;
        }

        .fd-hero::before {
          content: "";
          position: absolute;
          top: -160px;
          right: -130px;
          width: 460px;
          height: 460px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(254,243,199,.22), transparent 68%);
        }

        .fd-hero::after {
          content: "";
          position: absolute;
          bottom: -180px;
          left: -120px;
          width: 390px;
          height: 390px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(245,158,11,.20), transparent 70%);
        }

        .fd-hero-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1.05fr .95fr;
          gap: 44px;
          align-items: end;
        }

        .fd-pill {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(254,243,199,.10);
          border: 1px solid rgba(254,243,199,.18);
          color: #fef3c7;
          font-size: 12px;
          font-weight: 900;
        }

        .fd-title {
          max-width: 820px;
          margin-top: 20px;
          font-size: clamp(42px, 6.4vw, 82px);
          line-height: .9;
          letter-spacing: -.08em;
          font-weight: 900;
        }

        .fd-title span { color: #fef3c7; }

        .fd-subtitle {
          margin-top: 22px;
          max-width: 650px;
          color: rgba(254,243,199,.64);
          font-size: 15.5px;
          line-height: 1.8;
          font-weight: 650;
        }

        .fd-hero-card {
          min-height: 380px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-radius: 32px;
          padding: 26px;
          background: linear-gradient(145deg, rgba(255,255,255,.12), rgba(255,255,255,.045));
          border: 1px solid rgba(254,243,199,.16);
          box-shadow: 0 28px 90px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.10);
          backdrop-filter: blur(22px);
        }

        .fd-hero-card h3 {
          color: #fffaf0;
          font-size: 28px;
          line-height: 1;
          letter-spacing: -.055em;
          font-weight: 900;
        }

        .fd-hero-card p {
          margin-top: 10px;
          max-width: 360px;
          color: rgba(254,243,199,.58);
          font-size: 13px;
          line-height: 1.6;
          font-weight: 700;
        }

        .fd-preview-grid {
          margin-top: 24px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .fd-preview-box {
          min-height: 96px;
          border-radius: 22px;
          padding: 17px;
          background: rgba(255,255,255,.058);
          border: 1px solid rgba(255,255,255,.075);
        }

        .fd-preview-box strong {
          display: block;
          color: #fffaf0;
          font-size: 27px;
          letter-spacing: -.06em;
          font-weight: 900;
        }

        .fd-preview-box span {
          display: block;
          margin-top: 8px;
          color: rgba(254,243,199,.56);
          font-size: 11.5px;
          font-weight: 800;
        }

        .fd-content { padding: 56px 58px 62px; }

        .fd-section-top {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 28px;
          margin-bottom: 28px;
        }

        .fd-section-top h2 {
          max-width: 620px;
          font-size: clamp(32px, 4.5vw, 56px);
          line-height: .94;
          letter-spacing: -.07em;
          font-weight: 900;
          color: #1c120c;
        }

        .fd-section-top p {
          max-width: 520px;
          color: #7c6b5e;
          font-size: 14px;
          line-height: 1.72;
          font-weight: 650;
        }

        .fd-feature-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0,1fr));
          gap: 18px;
        }

        .fd-feature-card {
          position: relative;
          overflow: hidden;
          min-height: 310px;
          border-radius: 30px;
          padding: 24px;
          background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(255,250,241,.76));
          border: 1px solid rgba(28,18,12,.08);
          box-shadow: 0 18px 52px rgba(28,18,12,.07);
          cursor: pointer;
          transition: .24s ease;
        }

        .fd-feature-card:hover,
        .fd-feature-card.active {
          transform: translateY(-5px);
          border-color: rgba(245,158,11,.38);
          box-shadow: 0 30px 90px rgba(245,158,11,.14);
        }

        .fd-feature-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 82% 0%, rgba(245,158,11,.12), transparent 38%);
          pointer-events: none;
        }

        .fd-tag {
          position: relative;
          z-index: 2;
          width: fit-content;
          padding: 6px 10px;
          border-radius: 999px;
          background: #1c120c;
          color: #fef3c7;
          font-size: 10px;
          font-weight: 900;
          margin-bottom: 18px;
        }

        .fd-feature-card h3 {
          position: relative;
          z-index: 2;
          color: #1c120c;
          font-size: 23px;
          line-height: 1;
          letter-spacing: -.055em;
          font-weight: 900;
        }

        .fd-feature-card p {
          position: relative;
          z-index: 2;
          margin-top: 14px;
          min-height: 86px;
          color: #7c6b5e;
          font-size: 13px;
          line-height: 1.65;
          font-weight: 650;
        }

        .fd-feature-points {
          position: relative;
          z-index: 2;
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .fd-point {
          display: flex;
          gap: 10px;
          align-items: center;
          color: #3b2a20;
          font-size: 12.5px;
          font-weight: 800;
        }

        .fd-check {
          width: 20px;
          height: 20px;
          border-radius: 999px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(245,158,11,.14);
          color: #b45309;
        }

        .fd-workflow {
          margin-top: 64px;
          display: grid;
          grid-template-columns: .9fr 1.1fr;
          gap: 22px;
          align-items: stretch;
        }

        .fd-workflow-side {
          position: relative;
          overflow: hidden;
          border-radius: 34px;
          padding: 34px;
          background: linear-gradient(160deg,#1a0f06 0%,#261508 45%,#1e1108 100%);
          color: #fffaf0;
          box-shadow: 0 30px 90px rgba(28,18,12,.18);
        }

        .fd-workflow-side::before {
          content: "";
          position: absolute;
          right: -110px;
          bottom: -110px;
          width: 330px;
          height: 330px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(254,243,199,.16), transparent 70%);
        }

        .fd-workflow-side h2 {
          position: relative;
          z-index: 2;
          font-size: clamp(38px,4vw,58px);
          line-height: .9;
          letter-spacing: -.08em;
          font-weight: 900;
        }

        .fd-workflow-side p {
          position: relative;
          z-index: 2;
          margin-top: 18px;
          color: rgba(254,243,199,.62);
          font-size: 14px;
          line-height: 1.75;
          font-weight: 650;
        }

        .fd-workflow-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .fd-workflow-step {
          display: grid;
          grid-template-columns: 52px 1fr;
          gap: 16px;
          align-items: center;
          padding: 18px;
          border-radius: 26px;
          background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(255,250,241,.76));
          border: 1px solid rgba(28,18,12,.08);
          box-shadow: 0 16px 44px rgba(28,18,12,.07);
        }

        .fd-step-no {
          width: 52px;
          height: 52px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1c120c;
          color: #fef3c7;
          font-weight: 900;
        }

        .fd-workflow-step h3 {
          color: #1c120c;
          font-size: 15px;
          font-weight: 900;
          letter-spacing: -.02em;
        }

        .fd-compare {
          margin-top: 64px;
          overflow: hidden;
          border-radius: 34px;
          border: 1px solid rgba(28,18,12,.08);
          background: rgba(255,255,255,.78);
          box-shadow: 0 20px 60px rgba(28,18,12,.08);
        }

        .fd-compare-head,
        .fd-compare-row {
          display: grid;
          grid-template-columns: minmax(200px,1.2fr) repeat(3, minmax(110px,1fr));
        }

        .fd-compare-head div {
          padding: 17px;
          background: #1c120c;
          color: #fef3c7;
          font-size: 12px;
          font-weight: 900;
          border-right: 1px solid rgba(254,243,199,.10);
        }

        .fd-compare-row div {
          min-height: 54px;
          padding: 15px 17px;
          display: flex;
          align-items: center;
          border-top: 1px solid rgba(28,18,12,.07);
          border-right: 1px solid rgba(28,18,12,.06);
          color: #3c2a1f;
          font-size: 13px;
          font-weight: 850;
        }

        .fd-compare-row div:not(:first-child) { justify-content: center; }

        .fd-yes,
        .fd-no {
          width: 24px;
          height: 24px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fd-yes {
          background: rgba(16,185,129,.14);
          color: #059669;
        }

        .fd-no {
          background: rgba(239,68,68,.10);
          color: #ef4444;
        }

        .fd-cta {
          margin-top: 64px;
          border-radius: 34px;
          padding: 42px;
          background:
            radial-gradient(circle at 80% 10%, rgba(245,158,11,.22), transparent 34%),
            linear-gradient(160deg,#1a0f06 0%,#261508 45%,#1e1108 100%);
          color: #fffaf0;
          display: flex;
          justify-content: space-between;
          gap: 28px;
          align-items: center;
        }

        .fd-cta h2 {
          font-size: clamp(30px,4vw,54px);
          line-height: .92;
          letter-spacing: -.07em;
          font-weight: 900;
        }

        .fd-cta p {
          margin-top: 14px;
          max-width: 620px;
          color: rgba(254,243,199,.62);
          line-height: 1.7;
          font-size: 14px;
          font-weight: 650;
        }

        .fd-cta button {
          flex-shrink: 0;
          height: 54px;
          padding: 0 24px;
          border: 0;
          border-radius: 18px;
          background: #fef3c7;
          color: #1a0f06;
          font-family: inherit;
          font-weight: 900;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        @media (max-width: 1180px) {
          .fd-hero-grid,
          .fd-workflow { grid-template-columns: 1fr; }

          .fd-feature-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
        }

        @media (max-width: 860px) {
          .fd-features-page { padding: 10px; }
          .fd-shell { border-radius: 28px; }
          .fd-hero { padding: 44px 22px 34px; }
          .fd-content { padding: 34px 18px 40px; }

          .fd-section-top,
          .fd-cta {
            flex-direction: column;
            align-items: flex-start;
          }

          .fd-feature-grid { grid-template-columns: 1fr; }

          .fd-compare { overflow-x: auto; }

          .fd-compare-head,
          .fd-compare-row { min-width: 720px; }
        }

        @media (max-width: 480px) {
          .fd-title { font-size: 46px; }
          .fd-preview-grid { grid-template-columns: 1fr; }
          .fd-workflow-step { grid-template-columns: 1fr; }
        }
      `}</style>

      <main className="fd-features-page">
        <section className="fd-shell">
          <section className="fd-hero">
            <div className="fd-hero-grid">
              <div>
                <div className="fd-pill">
                  ✦ Complete restaurant SaaS ecosystem
                </div>

                <h1 className="fd-title">
                  Every feature a modern restaurant needs in{" "}
                  <span>one system.</span>
                </h1>

                <p className="fd-subtitle">
                  FoodDash is not only a QR ordering tool. It is a complete
                  restaurant web system with public website, menu preview,
                  ordering, admin dashboard, kitchen display, analytics, coupons
                  and branding control.
                </p>
              </div>

              <aside className="fd-hero-card">
                <div>
                  <h3>FoodDash stack preview</h3>
                  <p>
                    One platform that connects customer-facing pages, restaurant
                    staff, kitchen operations and owner analytics.
                  </p>
                </div>

                <div className="fd-preview-grid">
                  <div className="fd-preview-box">
                    <strong>QR</strong>
                    <span>table ordering</span>
                  </div>
                  <div className="fd-preview-box">
                    <strong>Admin</strong>
                    <span>live dashboard</span>
                  </div>
                  <div className="fd-preview-box">
                    <strong>Menu</strong>
                    <span>dynamic preview</span>
                  </div>
                  <div className="fd-preview-box">
                    <strong>AI</strong>
                    <span>theme studio ready</span>
                  </div>
                </div>
              </aside>
            </div>
          </section>

          <section className="fd-content">
            <div className="fd-section-top">
              <h2>Designed for small cafés and growing restaurants.</h2>
              <p>
                Start with only a public menu website, then upgrade the same
                restaurant into a full QR ordering and operations platform.
              </p>
            </div>

            <div className="fd-feature-grid">
              {FEATURES.map((feature, index) => (
                <article
                  key={feature.title}
                  className={`fd-feature-card ${active === index ? "active" : ""}`}
                  onClick={() => setActive(index)}
                >
                  <div className="fd-tag">{feature.tag}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>

                  <div className="fd-feature-points">
                    {feature.points.map((point) => (
                      <div className="fd-point" key={point}>
                        <span className="fd-check">
                          <Check size={12} />
                        </span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <section className="fd-workflow">
              <aside className="fd-workflow-side">
                <h2>From signup to live ordering.</h2>
                <p>
                  FoodDash should feel easy for restaurant owners. The whole
                  flow starts with registration and ends with a live branded
                  ordering system.
                </p>
              </aside>

              <div className="fd-workflow-list">
                {WORKFLOW.map((step, index) => (
                  <div className="fd-workflow-step" key={step}>
                    <div className="fd-step-no">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <h3>{step}</h3>
                  </div>
                ))}
              </div>
            </section>

            <section className="fd-compare">
              <div className="fd-compare-head">
                <div>Feature</div>
                <div>Public Site</div>
                <div>Starter QR</div>
                <div>Growth</div>
              </div>

              {COMPARISON.map(([label, publicSite, starter, growth]) => (
                <div className="fd-compare-row" key={label}>
                  <div>{label}</div>
                  {[publicSite, starter, growth].map((item, index) => (
                    <div key={index}>
                      {item ? (
                        <span className="fd-yes">
                          <Check size={13} />
                        </span>
                      ) : (
                        <span className="fd-no">×</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </section>

            <section className="fd-cta">
              <div>
                <h2>Ready to make FoodDash look like a real SaaS?</h2>
                <p>
                  After features page, build the homepage and connect Register,
                  Login, Pricing and Features with a premium website navbar.
                </p>
              </div>

              <button type="button">
                Start onboarding
                <Arrow />
              </button>
            </section>
          </section>
        </section>
      </main>
    </>
  );
}
