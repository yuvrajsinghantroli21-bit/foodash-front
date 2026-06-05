import { useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ─── Icons (inline SVG to avoid lucide-react dependency issues) ───────────────
const Icon = ({ d, size = 18, stroke = 1.8, className = "", style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d={d} />
  </svg>
);

const Icons = {
  User: (p) => (
    <Icon
      {...p}
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
    />
  ),
  Store: (p) => (
    <Icon {...p} d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  ),
  Mail: (p) => (
    <Icon
      {...p}
      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6"
    />
  ),
  Phone: (p) => (
    <Icon
      {...p}
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.08 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
    />
  ),
  Lock: (p) => (
    <Icon
      {...p}
      d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4"
    />
  ),
  Eye: (p) => (
    <Icon
      {...p}
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
    />
  ),
  EyeOff: (p) => (
    <Icon
      {...p}
      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"
    />
  ),
  MapPin: (p) => (
    <Icon
      {...p}
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
    />
  ),
  Grid: (p) => (
    <Icon {...p} d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
  ),
  QrCode: (p) => (
    <Icon
      {...p}
      d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3zM6 6h1v1H6zM17 6h1v1h-1zM17 17h1v1h-1zM6 17h1v1H6z"
    />
  ),
  Upload: (p) => (
    <Icon
      {...p}
      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
    />
  ),
  Check: (p) => <Icon {...p} d="M20 6L9 17l-5-5" />,
  X: (p) => <Icon {...p} d="M18 6L6 18M6 6l12 12" />,
  ChevronDown: (p) => <Icon {...p} d="M6 9l6 6 6-6" />,
  ArrowRight: (p) => <Icon {...p} d="M5 12h14M12 5l7 7-7 7" />,
  Utensils: (p) => (
    <Icon
      {...p}
      d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"
    />
  ),
  Loader: (p) => (
    <Icon
      {...p}
      d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
    />
  ),
  Shield: (p) => (
    <Icon {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  ),
  Sparkles: (p) => (
    <svg
      width={p.size || 18}
      height={p.size || 18}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={p.className}
    >
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  ),
  BarChart: (p) => <Icon {...p} d="M12 20V10M18 20V4M6 20v-4" />,
  Clock: (p) => (
    <Icon {...p} d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" />
  ),
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const THEMES = [
  { name: "Amber", value: "#F59E0B" },
  { name: "Rose", value: "#EF4444" },
  { name: "Emerald", value: "#10B981" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Orange", value: "#F97316" },
];

const RESTAURANT_TYPES = [
  "Café",
  "Restaurant",
  "Cloud Kitchen",
  "Bakery",
  "Fast Food",
  "Fine Dining",
];

const INITIAL = {
  ownerName: "",
  restaurantName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  restaurantType: "",
  city: "",
  address: "",
  tables: "",
};

// ─── Dashboard preview (left side bottom card) ────────────────────────────────
const ORDERS = [
  {
    id: "#FD1256",
    item: "2 Margherita Pizza",
    price: "₹498",
    status: "Preparing",
    color: "#F59E0B",
  },
  {
    id: "#FD1255",
    item: "1 Pasta Alfredo",
    price: "₹349",
    status: "Confirmed",
    color: "#10B981",
  },
  {
    id: "#FD1254",
    item: "3 Chicken Burger",
    price: "₹597",
    status: "Completed",
    color: "#64748B",
  },
];

// ─── Validate ─────────────────────────────────────────────────────────────────
function validate(f) {
  const e = {};
  if (f.ownerName.trim().length < 3)
    e.ownerName = "At least 3 characters required.";
  if (f.restaurantName.trim().length < 3)
    e.restaurantName = "At least 3 characters required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))
    e.email = "Enter a valid email.";
  if (!/^[6-9]\d{9}$/.test(f.phone.trim()))
    e.phone = "Valid 10-digit Indian number.";
  if (f.password.length < 6) e.password = "Minimum 6 characters.";
  if (f.confirmPassword !== f.password)
    e.confirmPassword = "Passwords don't match.";
  if (!f.restaurantType) e.restaurantType = "Select a type.";
  if (!f.city.trim()) e.city = "City is required.";
  if (f.address.trim().length < 8) e.address = "At least 8 characters.";
  if (!f.tables || Number(f.tables) <= 0) e.tables = "Must be > 0.";
  return e;
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, iconKey, error, children }) {
  const Ic = Icons[iconKey];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: error ? "#EF4444" : "#1a1a1a",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {Ic && (
          <Ic size={15} style={{ color: error ? "#EF4444" : "#6b7280" }} />
        )}
        {label}
      </label>
      {children}
      {error && (
        <p style={{ fontSize: 11, color: "#EF4444", margin: 0 }}>{error}</p>
      )}
    </div>
  );
}

// ─── Input style ──────────────────────────────────────────────────────────────
function inputStyle(err) {
  return {
    height: 48,
    width: "100%",
    padding: "0 14px",
    border: `1.5px solid ${err ? "#fca5a5" : "#e5e7eb"}`,
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "inherit",
    color: "#111827",
    background: err ? "#fff5f5" : "#fff",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color .15s, box-shadow .15s",
  };
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  const ok = type !== "error";
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        background: "#fff",
        border: `1px solid ${ok ? "#bbf7d0" : "#fecaca"}`,
        borderRadius: 16,
        padding: "14px 18px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        boxShadow: "0 20px 60px rgba(0,0,0,.18)",
        minWidth: 300,
        maxWidth: 380,
        animation: "slideIn .3s ease",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          flexShrink: 0,
          background: ok ? "#dcfce7" : "#fee2e2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: ok ? "#16a34a" : "#dc2626",
        }}
      >
        {ok ? <Icons.Check size={16} /> : <Icons.X size={16} />}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111" }}>
          {ok ? "Success" : "Error"}
        </p>
        <p
          style={{
            margin: "3px 0 0",
            fontSize: 12,
            color: "#6b7280",
            lineHeight: 1.5,
          }}
        >
          {msg}
        </p>
      </div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#9ca3af",
          padding: 0,
          lineHeight: 1,
        }}
      >
        <Icons.X size={16} />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RestaurantRegister() {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState(null);
  const [theme, setTheme] = useState(THEMES[0]);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [toast, setToast] = useState(null);
  const logoRef = useRef();
  const [showTerms, setShowTerms] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  const completion = useMemo(() => {
    const filled = Object.values(form).filter(Boolean).length;
    return Math.round((filled / Object.keys(INITIAL).length) * 100);
  }, [form]);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const handleLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => setLogo(ev.target.result);
    r.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!agreeTerms) {
      setToast({
        msg: "Please accept Terms & Conditions.",
        type: "error",
      });
      return;
    }

    const errs = validate(form);

    if (Object.keys(errs).length) {
      setErrors(errs);

      setToast({
        msg: "Please fix the highlighted fields.",
        type: "error",
      });

      return;
    }

    setLoading(true);

    axios
      .post(`${API}/owner/register`, {
        name: form.ownerName,
        email: form.email,
        password: form.password,
        restaurantName: form.restaurantName,
      })
      .then((res) => {
        localStorage.setItem("ownerToken", res.data.token);

        localStorage.setItem("ownerUser", JSON.stringify(res.data.owner));

        setToast({
          msg: "Restaurant registered successfully!",
          type: "success",
        });

        setTimeout(() => {
          navigate("/business");
        }, 700);
      })
      .catch((err) => {
        setToast({
          msg:
            err.response?.data?.message ||
            "Registration failed. Please try again.",
          type: "error",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // ── Responsive: two-column on ≥900px ───────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: #f7f2eb;
  font-family: 'Manrope', sans-serif;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fd-input:focus {
  border-color: #F59E0B !important;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15) !important;
}

.fd-input-err:focus {
  border-color: #EF4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12) !important;
}

.fd-select {
  appearance: none;
  -webkit-appearance: none;
}

.submit-btn:hover:not(:disabled) {
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.35) !important;
  transform: translateY(-1px);
}

.spin {
  animation: spin 0.8s linear infinite;
}

/* fills curve area behind right panel */
.fd-layout {
  position: relative;
}

.fd-layout::before {
  content: "";
  position: absolute;
  top: 0;
  left: calc(50% - 70px);
  width: 180px;
  height: 100%;
  background: linear-gradient(160deg, #1a0f06 0%, #261508 40%, #1e1108 100%);
  z-index: 1;
  pointer-events: none;
}

.fd-left {
  position: relative;
  z-index: 2;
}

.fd-right {
  position: relative;
  z-index: 3;
}

/* responsive */
@media (max-width: 900px) {
  .fd-layout {
    grid-template-columns: 1fr !important;
    border-radius: 28px !important;
    overflow: hidden !important;
  }

  .fd-layout::before {
    display: none;
  }

  .fd-left {
    min-height: auto !important;
    border-radius: 0 !important;
  }

  .fd-right {
    min-height: auto !important;
    border-top-left-radius: 28px !important;
    border-top-right-radius: 28px !important;
    border-bottom-left-radius: 0 !important;
    box-shadow: 0 -18px 50px rgba(0, 0, 0, 0.14) !important;
  }

  .fd-grid2,
  .fd-grid3 {
    grid-template-columns: 1fr !important;
  }

  .fd-stats-row {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }

  .fd-dashboard-bottom {
    grid-template-columns: 1fr !important;
  }

  .fd-recent-orders-box {
    border-right: none !important;
    border-bottom: 1px solid rgba(254, 243, 199, 0.09) !important;
  }
}

@media (max-width: 480px) {
  .fd-benefit-grid {
    grid-template-columns: 1fr !important;
  }

  .fd-theme-row {
    grid-template-columns: repeat(3, 1fr) !important;
  }

  .fd-stats-row {
    grid-template-columns: 1fr 1fr !important;
  }

  .fd-order-row {
    grid-template-columns: 48px minmax(0, 1fr) auto !important;
    row-gap: 6px !important;
  }

  .fd-order-status {
    grid-column: 2 / -1 !important;
    justify-self: start !important;
  }

  .fd-popular-item-row {
    grid-template-columns: 38px minmax(0, 1fr) !important;
  }

  .fd-popular-img {
    width: 38px !important;
    height: 38px !important;
    border-radius: 11px !important;
  }
}
      `}</style>

      <Toast
        msg={toast?.msg}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      <div
        style={{
          minHeight: "100vh",
          background: "#f7f2eb",
          fontFamily: "'Manrope',sans-serif",
          padding: "18px",
        }}
      >
        <div
          className="fd-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            minHeight: "calc(100vh - 36px)",
            maxWidth: 1400,
            margin: "0 auto",
            background:
              "linear-gradient(160deg,#1a0f06 0%,#261508 40%,#1e1108 100%)",
            borderRadius: 34,
            overflow: "hidden",
            boxShadow: "0 30px 90px rgba(28,18,12,.18)",
            position: "relative",
          }}
        >
          {/* ═══════════════════ LEFT PANEL ═══════════════════ */}
          <div
            className="fd-left"
            style={{
              background:
                "linear-gradient(160deg,#1a0f06 0%,#261508 40%,#1e1108 100%)",
              padding: "40px 44px",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              gap: 32,
              minHeight: "calc(100vh - 36px)",
            }}
          >
            {/* Glow orbs */}
            <div
              style={{
                position: "absolute",
                top: -100,
                right: -100,
                width: 380,
                height: 380,
                background:
                  "radial-gradient(circle,rgba(245,158,11,.22) 0%,transparent 70%)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -80,
                left: -60,
                width: 280,
                height: 280,
                background:
                  "radial-gradient(circle,rgba(251,146,60,.16) 0%,transparent 70%)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />

            {/* Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(245,158,11,.15)",
                  border: "1px solid rgba(245,158,11,.3)",
                  borderRadius: 24,
                  padding: "7px 14px 7px 10px",
                }}
              >
                <Icons.Sparkles size={15} style={{ color: "#F59E0B" }} />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fbbf24",
                    letterSpacing: ".02em",
                  }}
                >
                  Join 5000+ restaurants growing with Clever
                </span>
              </div>
            </div>

            {/* Headline */}
            <div style={{ position: "relative", zIndex: 1 }}>
              <h1
                style={{
                  fontSize: "clamp(32px,4vw,52px)",
                  fontWeight: 900,
                  color: "#fff",
                  lineHeight: 1.05,
                  letterSpacing: "-.03em",
                }}
              >
                Launch your
                <br />
                restaurant's digital
                <br />
                experience <span style={{ color: "#F59E0B" }}>in minutes.</span>
              </h1>
              <p
                style={{
                  marginTop: 16,
                  fontSize: 15,
                  fontWeight: 500,
                  color: "#a8a29e",
                  lineHeight: 1.65,
                  maxWidth: 420,
                }}
              >
                Create your restaurant profile, manage orders, delight customers
                and grow your business with Clever.
              </p>
            </div>

            {/* Benefit cards 2×2 */}
            <div
              className="fd-benefit-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                position: "relative",
                zIndex: 1,
              }}
            >
              {[
                {
                  icon: "QrCode",
                  title: "QR Ordering",
                  desc: "Customers scan, order and enjoy seamlessly.",
                },
                {
                  icon: "BarChart",
                  title: "Live Dashboard",
                  desc: "Track orders, revenue and customers in real-time.",
                },
                {
                  icon: "Grid",
                  title: "Digital Menu",
                  desc: "Update menu, prices and items anytime.",
                },
                {
                  icon: "User",
                  title: "Better Experience",
                  desc: "Faster service, happy customers, more reviews.",
                },
              ].map((b) => {
                const Ic = Icons[b.icon];
                return (
                  <div
                    key={b.title}
                    style={{
                      background: "rgba(255,255,255,.05)",
                      border: "1px solid rgba(255,255,255,.08)",
                      borderRadius: 16,
                      padding: "18px 16px",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: "#483924",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 10,
                      }}
                    >
                      <Ic size={20} style={{ color: "#F59E0B" }} />
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#fff",
                        marginBottom: 4,
                      }}
                    >
                      {b.title}
                    </p>
                    <p
                      style={{
                        fontSize: 11.5,
                        fontWeight: 500,
                        color: "#78716c",
                        lineHeight: 1.5,
                      }}
                    >
                      {b.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Dashboard preview card */}
            <div
              className="fd-dashboard-card"
              style={{
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
                background:
                  "linear-gradient(145deg, rgba(255,255,255,.075), rgba(255,255,255,.035))",
                border: "1px solid rgba(254,243,199,.14)",
                borderRadius: 22,
                overflow: "hidden",
                position: "relative",
                zIndex: 1,
                flexShrink: 1,
                boxShadow:
                  "0 26px 80px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.08)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: -80,
                  bottom: -90,
                  width: 220,
                  height: 220,
                  background:
                    "radial-gradient(circle, rgba(254,243,199,.22), transparent 68%)",
                  pointerEvents: "none",
                }}
              />

              <div
                className="fd-dashboard-header"
                style={{
                  padding: "16px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid rgba(254,243,199,.10)",
                  gap: 12,
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#fef3c7",
                    minWidth: 0,
                  }}
                >
                  Dashboard Overview
                </span>

                <button
                  type="button"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(254,243,199,.08)",
                    border: "1px solid rgba(254,243,199,.14)",
                    borderRadius: 999,
                    padding: "6px 11px",
                    color: "#fef3c7",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Today</span>
                  <Icons.ChevronDown size={13} style={{ color: "#fef3c7" }} />
                </button>
              </div>

              <div
                className="fd-stats-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  minWidth: 0,
                }}
              >
                {[
                  {
                    icon: "QrCode",
                    label: "Orders",
                    value: "128",
                    change: "↑ 20%",
                  },
                  {
                    icon: "BarChart",
                    label: "Revenue",
                    value: "₹24,560",
                    change: "↑ 18%",
                  },
                  {
                    icon: "Grid",
                    label: "Active Tables",
                    value: "18",
                    change: "↑ 12%",
                  },
                  {
                    icon: "User",
                    label: "Customers",
                    value: "32",
                    change: "↑ 15%",
                  },
                ].map((s, i) => {
                  const Ic = Icons[s.icon];

                  return (
                    <div
                      key={s.label}
                      className="fd-stat-card"
                      style={{
                        padding: "15px 14px",
                        borderRight:
                          i < 3 ? "1px solid rgba(254,243,199,.09)" : "none",
                        borderBottom: "1px solid rgba(254,243,199,.09)",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          background:
                            "linear-gradient(145deg, rgba(254,243,199,.18), rgba(245,158,11,.10))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 9,
                          color: "#fef3c7",
                        }}
                      >
                        <Ic size={15} style={{ color: "#fef3c7" }} />
                      </div>

                      <p
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: "rgba(254,243,199,.56)",
                          marginBottom: 4,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {s.label}
                      </p>

                      <p
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: "#fffaf0",
                          lineHeight: 1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {s.value}
                      </p>

                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#86efac",
                          marginTop: 5,
                        }}
                      >
                        {s.change}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div
                className="fd-dashboard-bottom"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, .85fr)",
                  minWidth: 0,
                }}
              >
                <div
                  className="fd-recent-orders-box"
                  style={{
                    padding: "15px 16px",
                    borderRight: "1px solid rgba(254,243,199,.09)",
                    minWidth: 0,
                    overflow: "hidden",
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "#fef3c7",
                      marginBottom: 12,
                    }}
                  >
                    Recent Orders
                  </p>

                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 9 }}
                  >
                    {ORDERS.map((o) => (
                      <div
                        key={o.id}
                        className="fd-order-row"
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "54px minmax(0, 1fr) 44px minmax(70px, auto)",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 9px",
                          borderRadius: 12,
                          background: "rgba(255,255,255,.035)",
                          border: "1px solid rgba(255,255,255,.055)",
                          minWidth: 0,
                          overflow: "hidden",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 800,
                            color: "rgba(254,243,199,.58)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {o.id}
                        </span>

                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "rgba(255,255,255,.72)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            minWidth: 0,
                          }}
                        >
                          {o.item}
                        </span>

                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 900,
                            color: "#fffaf0",
                            textAlign: "right",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {o.price}
                        </span>

                        <span
                          className="fd-order-status"
                          style={{
                            fontSize: 9.5,
                            fontWeight: 800,
                            color: o.color,
                            background: `${o.color}22`,
                            border: `1px solid ${o.color}33`,
                            borderRadius: 999,
                            padding: "3px 7px",
                            whiteSpace: "nowrap",
                            width: "fit-content",
                            justifySelf: "end",
                          }}
                        >
                          {o.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="fd-popular-box"
                  style={{
                    padding: "15px 16px",
                    minWidth: 0,
                    overflow: "hidden",
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "#fef3c7",
                      marginBottom: 12,
                    }}
                  >
                    Popular Item
                  </p>

                  <div
                    className="fd-popular-item-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "44px minmax(0, 1fr)",
                      alignItems: "center",
                      gap: 11,
                      marginBottom: 14,
                      minWidth: 0,
                      maxWidth: "100%",
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=160&q=80"
                      alt="Veg Pizza"
                      className="fd-popular-img"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 13,
                        objectFit: "cover",
                        border: "1px solid rgba(254,243,199,.22)",
                        boxShadow: "0 10px 24px rgba(0,0,0,.22)",
                        minWidth: 0,
                        maxWidth: "100%",
                      }}
                    />

                    <div style={{ minWidth: 0, overflow: "hidden" }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 900,
                          color: "#fffaf0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "100%",
                        }}
                      >
                        Veg Pizza
                      </p>

                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "rgba(254,243,199,.52)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        26 Orders
                      </p>
                    </div>
                  </div>

                  <svg
                    viewBox="0 0 120 42"
                    preserveAspectRatio="none"
                    style={{
                      width: "100%",
                      maxWidth: "100%",
                      height: 42,
                      display: "block",
                      overflow: "hidden",
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="foodDashSpark"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#fef3c7"
                          stopOpacity=".55"
                        />
                        <stop
                          offset="100%"
                          stopColor="#fef3c7"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>

                    <polyline
                      points="0,33 18,29 34,31 51,21 67,24 84,14 101,10 120,7"
                      fill="none"
                      stroke="#fef3c7"
                      strokeWidth="2.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <polyline
                      points="0,33 18,29 34,31 51,21 67,24 84,14 101,10 120,7 120,42 0,42"
                      fill="url(#foodDashSpark)"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════ RIGHT PANEL ═══════════════════ */}
          <div
            className="fd-right"
            style={{
              background: "#fff",
              padding: "40px 44px",
              overflowY: "auto",
              minHeight: "calc(100vh - 36px)",
              display: "flex",
              flexDirection: "column",
              borderTopLeftRadius: 42,
              borderBottomLeftRadius: 42,
              boxShadow: "-18px 0 50px rgba(0,0,0,.12)",
              position: "relative",
              zIndex: 5,
            }}
          >
            <div
              style={{
                maxWidth: 540,
                width: "100%",
                margin: "0 auto",
                flex: 1,
              }}
            >
              {/* Header */}
              <div style={{ marginBottom: 28 }}>
                <h2
                  style={{
                    fontSize: "clamp(22px,3vw,30px)",
                    fontWeight: 900,
                    color: "#111827",
                    letterSpacing: "-.03em",
                    marginBottom: 6,
                  }}
                >
                  Create your restaurant account
                </h2>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#6b7280" }}>
                  Fill the details below to get started.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                {/* Row 1: Owner + Restaurant */}
                <div
                  className="fd-grid2"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <Field
                    label="Owner Name"
                    iconKey="User"
                    error={errors.ownerName}
                  >
                    <input
                      className={`fd-input${errors.ownerName ? " fd-input-err" : ""}`}
                      style={inputStyle(errors.ownerName)}
                      placeholder="Enter owner name"
                      value={form.ownerName}
                      onChange={(e) => set("ownerName", e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Restaurant Name"
                    iconKey="Store"
                    error={errors.restaurantName}
                  >
                    <input
                      className={`fd-input${errors.restaurantName ? " fd-input-err" : ""}`}
                      style={inputStyle(errors.restaurantName)}
                      placeholder="Enter restaurant name"
                      value={form.restaurantName}
                      onChange={(e) => set("restaurantName", e.target.value)}
                    />
                  </Field>
                </div>

                {/* Row 2: Email + Phone */}
                <div
                  className="fd-grid2"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <Field
                    label="Email Address"
                    iconKey="Mail"
                    error={errors.email}
                  >
                    <input
                      className={`fd-input${errors.email ? " fd-input-err" : ""}`}
                      style={inputStyle(errors.email)}
                      placeholder="Enter email address"
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                    />

                    <p
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        margin: "4px 0 0",
                        lineHeight: 1.5,
                      }}
                    >
                      We'll send important account and billing updates to this
                      email.
                    </p>
                  </Field>
                  <Field
                    label="Phone Number"
                    iconKey="Phone"
                    error={errors.phone}
                  >
                    <input
                      className={`fd-input${errors.phone ? " fd-input-err" : ""}`}
                      style={inputStyle(errors.phone)}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      inputMode="numeric"
                      value={form.phone}
                      onChange={(e) =>
                        set("phone", e.target.value.replace(/\D/g, ""))
                      }
                    />
                  </Field>
                </div>

                {/* Row 3: Password + Confirm */}
                <div
                  className="fd-grid2"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <Field
                    label="Password"
                    iconKey="Lock"
                    error={errors.password}
                  >
                    <div style={{ position: "relative" }}>
                      <input
                        className={`fd-input${errors.password ? " fd-input-err" : ""}`}
                        style={{
                          ...inputStyle(errors.password),
                          paddingRight: 44,
                        }}
                        type={showPw ? "text" : "password"}
                        placeholder="Enter password"
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((p) => !p)}
                        style={{
                          position: "absolute",
                          right: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#9ca3af",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {showPw ? (
                          <Icons.EyeOff size={17} />
                        ) : (
                          <Icons.Eye size={17} />
                        )}
                      </button>
                    </div>
                  </Field>
                  <Field
                    label="Confirm Password"
                    iconKey="Lock"
                    error={errors.confirmPassword}
                  >
                    <div style={{ position: "relative" }}>
                      <input
                        className={`fd-input${errors.confirmPassword ? " fd-input-err" : ""}`}
                        style={{
                          ...inputStyle(errors.confirmPassword),
                          paddingRight: 44,
                        }}
                        type={showCpw ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={form.confirmPassword}
                        onChange={(e) => set("confirmPassword", e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCpw((p) => !p)}
                        style={{
                          position: "absolute",
                          right: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#9ca3af",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {showCpw ? (
                          <Icons.EyeOff size={17} />
                        ) : (
                          <Icons.Eye size={17} />
                        )}
                      </button>
                    </div>
                  </Field>
                </div>

                {/* Row 4: Type + Tables */}
                <div
                  className="fd-grid2"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <Field
                    label="Restaurant Type"
                    iconKey="Utensils"
                    error={errors.restaurantType}
                  >
                    <div style={{ position: "relative" }}>
                      <select
                        className={`fd-select fd-input${errors.restaurantType ? " fd-input-err" : ""}`}
                        style={{
                          ...inputStyle(errors.restaurantType),
                          paddingRight: 36,
                        }}
                        value={form.restaurantType}
                        onChange={(e) => set("restaurantType", e.target.value)}
                      >
                        <option value="">Select type</option>
                        {RESTAURANT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <Icons.ChevronDown
                        size={16}
                        style={{
                          position: "absolute",
                          right: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#9ca3af",
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                  </Field>
                  <Field
                    label="Number of Tables"
                    iconKey="Grid"
                    error={errors.tables}
                  >
                    <input
                      className={`fd-input${errors.tables ? " fd-input-err" : ""}`}
                      style={inputStyle(errors.tables)}
                      type="number"
                      min="1"
                      placeholder="Enter number of tables"
                      value={form.tables}
                      onChange={(e) => set("tables", e.target.value)}
                    />
                  </Field>
                </div>

                {/* Row 5: City + Address */}
                <div
                  className="fd-grid2"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <Field label="City" iconKey="MapPin" error={errors.city}>
                    <input
                      className={`fd-input${errors.city ? " fd-input-err" : ""}`}
                      style={inputStyle(errors.city)}
                      placeholder="Enter city"
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Address"
                    iconKey="MapPin"
                    error={errors.address}
                  >
                    <input
                      className={`fd-input${errors.address ? " fd-input-err" : ""}`}
                      style={inputStyle(errors.address)}
                      placeholder="Enter full address"
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                    />
                  </Field>
                </div>

                {/* Logo + Theme */}
                <div
                  className="fd-grid2"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    alignItems: "start",
                  }}
                >
                  {/* Logo upload */}
                  <div>
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#1a1a1a",
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Restaurant Logo{" "}
                      <span style={{ color: "#9ca3af", fontWeight: 500 }}>
                        (Optional)
                      </span>
                    </label>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => logoRef.current?.click()}
                        style={{
                          width: 90,
                          height: 90,
                          borderRadius: 14,
                          flexShrink: 0,
                          overflow: "hidden",
                          border: "2px dashed #e5e7eb",
                          background: "#fafaf9",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "#F59E0B",
                          gap: 6,
                          transition: "border-color .15s",
                        }}
                      >
                        {logo ? (
                          <img
                            src={logo}
                            alt="logo"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <>
                            <Icons.Upload
                              size={22}
                              style={{ color: "#F59E0B" }}
                            />
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#F59E0B",
                              }}
                            >
                              Upload logo
                            </span>
                            <span style={{ fontSize: 10, color: "#9ca3af" }}>
                              PNG, JPG up to 2MB
                            </span>
                          </>
                        )}
                      </button>
                      {logo && (
                        <button
                          type="button"
                          onClick={() => setLogo(null)}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: "#fee2e2",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#dc2626",
                            flexShrink: 0,
                          }}
                        >
                          <Icons.X size={13} />
                        </button>
                      )}
                    </div>
                    <input
                      ref={logoRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogo}
                      style={{ display: "none" }}
                    />
                  </div>

                  {/* Theme color */}
                  <div>
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#1a1a1a",
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Theme Color{" "}
                      <span style={{ color: "#9ca3af", fontWeight: 500 }}>
                        (Optional)
                      </span>
                    </label>
                    <div
                      className="fd-theme-row"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5,1fr)",
                        gap: 10,
                      }}
                    >
                      {THEMES.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setTheme(t)}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: t.value,
                            border:
                              theme.value === t.value
                                ? `3px solid #1f2937`
                                : "3px solid transparent",
                            outline:
                              theme.value === t.value
                                ? `2px solid ${t.value}`
                                : "none",
                            outlineOffset: 2,
                            cursor: "pointer",
                            transition: "transform .15s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {theme.value === t.value && (
                            <Icons.Check
                              size={16}
                              style={{
                                color: "#fff",
                                filter: "drop-shadow(0 1px 2px rgba(0,0,0,.4))",
                              }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginTop: 4,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{
                      marginTop: 3,
                      cursor: "pointer",
                    }}
                  />

                  <p
                    style={{
                      fontSize: 13,
                      color: "#6b7280",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      style={{
                        border: "none",
                        background: "none",
                        color: "#F59E0B",
                        fontWeight: 700,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Terms & Conditions
                    </button>
                  </p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: 52,
                    borderRadius: 12,
                    background: loading ? "#d1c4ae" : "#F59E0B",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: 15,
                    fontWeight: 900,
                    color: loading ? "#78716c" : "#1a0f06",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    transition: "all .2s",
                    boxShadow: "0 4px 20px rgba(245,158,11,.3)",
                    letterSpacing: "-.01em",
                  }}
                >
                  {loading ? (
                    <>
                      <Icons.Loader
                        size={18}
                        className="spin"
                        style={{ color: "#78716c" }}
                      />{" "}
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                {/* Security note */}
                <p
                  style={{
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#9ca3af",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                  }}
                >
                  <Icons.Shield size={13} style={{ color: "#9ca3af" }} />
                  Your data is safe and secure with us.
                </p>

                {/* Login link */}
                <p
                  style={{
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#6b7280",
                  }}
                >
                  Already have an account?{" "}
                  <a
                    href="/login"
                    style={{
                      color: "#F59E0B",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Sign in
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showTerms && (
        <div
          onClick={() => setShowTerms(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.55)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 700,
              maxHeight: "80vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 24,
              padding: 28,
            }}
          >
            <h2
              style={{
                fontSize: 24,
                fontWeight: 900,
                marginBottom: 18,
              }}
            >
              Qzora Terms & Conditions
            </h2>

            <div
              style={{
                color: "#4b5563",
                lineHeight: 1.8,
                fontSize: 14,
              }}
            >
              <p>
                Qzora provides restaurant website, QR ordering, menu management,
                billing and operational software.
              </p>

              <p>
                Restaurant owners remain responsible for menu prices, taxes,
                staff actions, customer interactions and payment collection.
              </p>

              <p>
                Qzora is not responsible for revenue loss, business loss,
                customer disputes, internet outages, hardware failures,
                incorrect menu data, payment disputes or operational mistakes.
              </p>

              <p>
                While Qzora aims for high availability, uninterrupted service
                cannot be guaranteed.
              </p>

              <p>By registering, you acknowledge and agree to these terms.</p>
            </div>

            <button
              onClick={() => setShowTerms(false)}
              style={{
                marginTop: 24,
                width: "100%",
                height: 48,
                border: "none",
                borderRadius: 12,
                background: "#F59E0B",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </>
  );
}
