import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
  Mail: (p) => (
    <Icon
      {...p}
      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6"
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
  Check: (p) => <Icon {...p} d="M20 6L9 17l-5-5" />,
  X: (p) => <Icon {...p} d="M18 6L6 18M6 6l12 12" />,
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
      style={p.style}
    >
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  ),
  Loader: (p) => (
    <Icon
      {...p}
      d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
    />
  ),
  QrCode: (p) => (
    <Icon
      {...p}
      d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3zM6 6h1v1H6zM17 6h1v1h-1zM17 17h1v1h-1zM6 17h1v1H6z"
    />
  ),
  BarChart: (p) => <Icon {...p} d="M12 20V10M18 20V4M6 20v-4" />,
  Grid: (p) => (
    <Icon {...p} d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
  ),
  User: (p) => (
    <Icon
      {...p}
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
    />
  ),
  ArrowRight: (p) => <Icon {...p} d="M5 12h14M12 5l7 7-7 7" />,
};

const ORDERS = [
  {
    id: "#QZ1256",
    item: "2 Margherita Pizza",
    price: "₹498",
    status: "Preparing",
    color: "#F59E0B",
  },
  {
    id: "#QZ1255",
    item: "1 Pasta Alfredo",
    price: "₹349",
    status: "Confirmed",
    color: "#10B981",
  },
  {
    id: "#QZ1254",
    item: "3 Chicken Burger",
    price: "₹597",
    status: "Completed",
    color: "#64748B",
  },
];

function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  const ok = type !== "error";

  return (
    <div className="fd-toast">
      <div className={`fd-toast-icon ${ok ? "ok" : "bad"}`}>
        {ok ? <Icons.Check size={16} /> : <Icons.X size={16} />}
      </div>
      <div style={{ flex: 1 }}>
        <p className="fd-toast-title">{ok ? "Success" : "Error"}</p>
        <p className="fd-toast-msg">{msg}</p>
      </div>
      <button onClick={onClose} className="fd-toast-close" type="button">
        <Icons.X size={16} />
      </button>
    </div>
  );
}

function validate(form) {
  const errors = {};

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (form.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  return errors;
}

function inputStyle(error) {
  return {
    height: 52,
    width: "100%",
    padding: "0 46px 0 14px",
    border: `1.5px solid ${error ? "#fca5a5" : "#e5e7eb"}`,
    borderRadius: 13,
    fontSize: 14,
    fontFamily: "inherit",
    color: "#111827",
    background: error ? "#fff5f5" : "#fff",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color .15s, box-shadow .15s",
  };
}

function Field({ label, icon, error, children }) {
  const Ic = Icons[icon];
  return (
    <div className="fd-field">
      <label className="fd-label">
        {Ic && (
          <Ic size={15} style={{ color: error ? "#EF4444" : "#6b7280" }} />
        )}
        {label}
      </label>
      {children}
      {error && <p className="fd-error">{error}</p>}
    </div>
  );
}

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const foundErrors = validate(form);

    if (Object.keys(foundErrors).length) {
      setErrors(foundErrors);
      setToast({ msg: "Please fix the highlighted fields.", type: "error" });
      return;
    }

    setLoading(true);

    const host = window.location.hostname;

    const isMainQzora =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "qzora.in" ||
      host === "www.qzora.in" ||
      host === "foodash.com" ||
      host === "www.foodash.com";

    const restaurantSlug = host.endsWith(".localhost")
      ? host.replace(".localhost", "")
      : host.endsWith(".qzora.in")
        ? host.replace(".qzora.in", "")
        : host.endsWith(".foodash.com")
          ? host.replace(".foodash.com", "")
          : "";

    const loginUrl = isMainQzora ? `${API}/owner/login` : `${API}/auth/login`;

    axios
      .post(
        loginUrl,
        {
          email: form.email.trim(),
          password: form.password,
        },
        {
          headers: restaurantSlug
            ? {
                "x-restaurant-slug": restaurantSlug,
              }
            : {},
        },
      )
      .then((res) => {
        const token = res.data?.token;

        if (!token) {
          throw new Error("Login response did not include token.");
        }

        if (isMainQzora) {
          localStorage.setItem("ownerToken", token);
          localStorage.setItem(
            "ownerUser",
            JSON.stringify(res.data?.owner || {}),
          );
          window.dispatchEvent(new Event("ownerAuthChanged"));
          navigate("/business");
        } else {
          localStorage.setItem("adminToken", token);
          localStorage.setItem(
            "adminUser",
            JSON.stringify(res.data?.staff || {}),
          );

          navigate("/admin/dashboard");
        }
      })
      .catch((err) => {
        setToast({
          msg:
            err.response?.data?.message ||
            err.message ||
            "Login failed. Please check your email and password.",
          type: "error",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; }
        body { background: #f7f2eb; font-family: 'Manrope', sans-serif; }

        @keyframes slideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }

        .fd-input:focus {
          border-color: #F59E0B !important;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15) !important;
        }

        .fd-input-err:focus {
          border-color: #EF4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12) !important;
        }

        .fd-page {
          min-height: 100vh;
          background: #f7f2eb;
          padding: 18px;
          font-family: 'Manrope', sans-serif;
          overflow-x: hidden;
        }

        .fd-layout {
          display: grid;
          grid-template-columns: minmax(0, 0.95fr) minmax(460px, 1.05fr);
          min-height: calc(100vh - 36px);
          max-width: 1400px;
          margin: 0 auto;
          background: linear-gradient(160deg, #1a0f06 0%, #261508 40%, #1e1108 100%);
          border-radius: 34px;
          overflow: hidden;
          box-shadow: 0 30px 90px rgba(28, 18, 12, .18);
          position: relative;
        }

        .fd-left {
          background: linear-gradient(160deg, #1a0f06 0%, #261508 40%, #1e1108 100%);
          padding: 42px 44px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 30px;
          min-width: 0;
        }

        .fd-left::before {
          content: "";
          position: absolute;
          top: -120px;
          right: -120px;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(245, 158, 11, .24), transparent 70%);
          border-radius: 999px;
          pointer-events: none;
        }

        .fd-left::after {
          content: "";
          position: absolute;
          bottom: -90px;
          left: -70px;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(251, 191, 36, .13), transparent 70%);
          border-radius: 999px;
          pointer-events: none;
        }

        .fd-right {
          background: #fff;
          padding: 42px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-top-left-radius: 42px;
          border-bottom-left-radius: 42px;
          box-shadow: -18px 0 50px rgba(0, 0, 0, .12);
          position: relative;
          z-index: 3;
          min-width: 0;
        }

        .fd-right-inner {
          max-width: 500px;
          width: 100%;
          margin: 0 auto;
        }

        .fd-pill {
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(245,158,11,.15);
          border: 1px solid rgba(245,158,11,.34);
          color: #f59e0b;
          border-radius: 999px;
          padding: 8px 15px;
          font-size: 12px;
          font-weight: 800;
          position: relative;
          z-index: 1;
        }

        .fd-title {
          font-size: clamp(32px, 4vw, 54px);
          font-weight: 900;
          color: #fff;
          line-height: 1.04;
          letter-spacing: -.045em;
          position: relative;
          z-index: 1;
        }

        .fd-title span { color: #f59e0b; }

        .fd-subtitle {
          margin-top: 18px;
          max-width: 460px;
          color: #a8a29e;
          font-size: 15px;
          font-weight: 500;
          line-height: 1.7;
          position: relative;
          z-index: 1;
        }

        .fd-benefits {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px;
          position: relative;
          z-index: 1;
        }

        .fd-benefit {
          background: rgba(255,255,255,.055);
          border: 1px solid rgba(254,243,199,.10);
          border-radius: 17px;
          padding: 16px;
          min-width: 0;
        }

        .fd-benefit-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(245,158,11,.14);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f59e0b;
          margin-bottom: 12px;
        }

        .fd-benefit h3 {
          font-size: 13px;
          font-weight: 900;
          color: #fffaf0;
          margin-bottom: 5px;
        }

        .fd-benefit p {
          font-size: 11.5px;
          color: #8f8680;
          line-height: 1.5;
          font-weight: 600;
        }

        .fd-preview {
          position: relative;
          z-index: 1;
          background: linear-gradient(145deg, rgba(255,255,255,.075), rgba(255,255,255,.035));
          border: 1px solid rgba(254,243,199,.14);
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 26px 80px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.08);
          backdrop-filter: blur(20px);
        }

        .fd-preview-head {
          padding: 16px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(254,243,199,.10);
          gap: 12px;
        }

        .fd-preview-head h3 {
          color: #fef3c7;
          font-size: 13px;
          font-weight: 900;
        }

        .fd-live {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #86efac;
          background: rgba(34,197,94,.10);
          border: 1px solid rgba(34,197,94,.18);
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 900;
        }

        .fd-live-dot {
          width: 7px;
          height: 7px;
          background: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(34,197,94,.8);
        }

        .fd-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          border-bottom: 1px solid rgba(254,243,199,.09);
        }

        .fd-stat {
          padding: 15px;
          border-right: 1px solid rgba(254,243,199,.09);
          min-width: 0;
        }

        .fd-stat:last-child { border-right: none; }

        .fd-stat p:first-child {
          color: rgba(254,243,199,.56);
          font-size: 10.5px;
          font-weight: 800;
          margin-bottom: 5px;
        }

        .fd-stat strong {
          color: #fffaf0;
          font-size: 18px;
          font-weight: 900;
          white-space: nowrap;
        }

        .fd-orders {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .fd-order-row {
          display: grid;
          grid-template-columns: 58px minmax(0,1fr) 48px auto;
          gap: 8px;
          align-items: center;
          padding: 9px 10px;
          border-radius: 13px;
          background: rgba(255,255,255,.035);
          border: 1px solid rgba(255,255,255,.055);
          min-width: 0;
        }

        .fd-order-row span {
          font-size: 11px;
          font-weight: 800;
          min-width: 0;
        }

        .fd-order-id { color: rgba(254,243,199,.58); white-space: nowrap; }
        .fd-order-item { color: rgba(255,255,255,.72); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .fd-order-price { color: #fffaf0; text-align: right; white-space: nowrap; }
        .fd-order-status { justify-self: end; border-radius: 999px; padding: 3px 8px; white-space: nowrap; font-size: 9.5px !important; }

        .fd-login-head { margin-bottom: 30px; }
        .fd-login-head h2 {
          color: #111827;
          font-size: clamp(26px, 3vw, 34px);
          font-weight: 900;
          letter-spacing: -.04em;
          margin-bottom: 8px;
        }
        .fd-login-head p {
          color: #6b7280;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.6;
        }

        .fd-form { display: flex; flex-direction: column; gap: 18px; }
        .fd-field { display: flex; flex-direction: column; gap: 7px; }
        .fd-label { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 800; color: #1f2937; }
        .fd-error { color: #ef4444; font-size: 11px; font-weight: 700; }

        .fd-password-wrap { position: relative; }
        .fd-eye-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .fd-form-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
        }

        .fd-check {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #6b7280;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .fd-check input { accent-color: #f59e0b; width: 15px; height: 15px; }

        .fd-link {
          color: #f59e0b;
          font-weight: 900;
          font-size: 13px;
          text-decoration: none;
        }

        .fd-submit {
          height: 54px;
          width: 100%;
          border: none;
          border-radius: 14px;
          background: #f59e0b;
          color: #1a0f06;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 20px rgba(245,158,11,.30);
          transition: all .2s ease;
        }

        .fd-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(245,158,11,.35); }
        .fd-submit:disabled { background: #d1c4ae; color: #78716c; cursor: not-allowed; box-shadow: none; }

        .fd-secure {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #9ca3af;
          font-size: 12px;
          font-weight: 700;
          text-align: center;
        }

        .fd-bottom-text {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          font-weight: 600;
        }

        .fd-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 14px 18px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          min-width: 300px;
          max-width: 380px;
          box-shadow: 0 20px 60px rgba(0,0,0,.18);
          animation: slideIn .3s ease;
        }

        .fd-toast-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .fd-toast-icon.ok { background: #dcfce7; color: #16a34a; }
        .fd-toast-icon.bad { background: #fee2e2; color: #dc2626; }
        .fd-toast-title { margin: 0; font-size: 13px; font-weight: 900; color: #111827; }
        .fd-toast-msg { margin: 3px 0 0; font-size: 12px; color: #6b7280; line-height: 1.5; font-weight: 600; }
        .fd-toast-close { background: none; border: none; cursor: pointer; color: #9ca3af; padding: 0; line-height: 1; }
        .spin { animation: spin .8s linear infinite; }

        @media (max-width: 1080px) {
          .fd-layout {
            grid-template-columns: 1fr;
            min-height: auto;
            border-radius: 28px;
            overflow: hidden;
          }

          .fd-left {
            min-height: auto;
            padding: 34px 28px;
            justify-content: flex-start;
            gap: 24px;
          }

          .fd-title {
            font-size: clamp(31px, 7vw, 46px);
            max-width: 760px;
          }

          .fd-subtitle {
            max-width: 720px;
          }

          .fd-benefits {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .fd-preview {
            display: none;
          }

          .fd-right {
            border-top-left-radius: 32px;
            border-top-right-radius: 32px;
            border-bottom-left-radius: 0;
            padding: 36px 28px;
            box-shadow: 0 -18px 50px rgba(0,0,0,.14);
          }

          .fd-right-inner {
            max-width: 620px;
          }
        }

       @media (max-width: 720px) {
  .fd-page {
    padding: 14px;
    background: #f7f2eb;
  }

  .fd-layout {
    border-radius: 30px;
    overflow: hidden;
  }

          .fd-left {
            padding: 28px 18px 92px;
            min-height: 44vh;
          }

          .fd-pill {
            font-size: 10.5px;
            padding: 7px 12px;
          }

          .fd-title {
            font-size: 35px;
            line-height: 1.02;
          }

          .fd-subtitle {
            margin-top: 14px;
            font-size: 13.5px;
            line-height: 1.65;
          }

          .fd-benefits {
            display: none;
          }

          .fd-right {
            margin-top: -54px;
            border-top-left-radius: 34px;
            border-top-right-radius: 34px;
            padding: 32px 18px 28px;
            min-height: 56vh;
          }

          .fd-login-head {
            margin-bottom: 24px;
          }

          .fd-login-head h2 {
            font-size: 27px;
          }

          .fd-login-head p {
            font-size: 13.5px;
          }

          .fd-form {
            gap: 16px;
          }

          .fd-form-row {
            align-items: flex-start;
          }
        }

        
        @media (max-width: 430px) {

        .fd-page {
  padding: 10px;
}

.fd-layout {
  border-radius: 26px;
}



          .fd-left {
            padding: 24px 16px 82px;
            min-height: 40vh;
          }

          .fd-title {
            font-size: 31px;
            letter-spacing: -0.055em;
          }

          .fd-subtitle {
            font-size: 12.75px;
          }

          .fd-right {
            margin-top: -48px;
            padding: 28px 16px 24px;
          }

          .fd-login-head h2 {
            font-size: 24px;
          }

          .fd-toast {
            left: 12px;
            right: 12px;
            top: 12px;
            min-width: 0;
            max-width: none;
          }
        }
      `}</style>

      <Toast
        msg={toast?.msg}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      <main className="fd-page">
        <section className="fd-layout">
          <aside className="fd-left">
            <div className="fd-pill">
              <Icons.Sparkles size={14} style={{ color: "#f59e0b" }} />
              Welcome back to Qzora
            </div>

            <div>
              <h1 className="fd-title">
                Continue managing your restaurant <span>with confidence.</span>
              </h1>
              <p className="fd-subtitle">
                Login to manage orders, live tables, digital menu, payments and
                your restaurant website from one beautiful dashboard.
              </p>
            </div>

            <div className="fd-benefits">
              {[
                {
                  icon: "QrCode",
                  title: "QR Ordering",
                  text: "Keep every table connected to your live menu.",
                },
                {
                  icon: "BarChart",
                  title: "Live Dashboard",
                  text: "Track orders, revenue and active tables instantly.",
                },
                {
                  icon: "Grid",
                  title: "Menu Control",
                  text: "Update prices, photos and availability anytime.",
                },
                {
                  icon: "User",
                  title: "Customer Flow",
                  text: "Reduce wait time and improve dining experience.",
                },
              ].map((item) => {
                const Ic = Icons[item.icon];
                return (
                  <div className="fd-benefit" key={item.title}>
                    <div className="fd-benefit-icon">
                      <Ic size={20} />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                );
              })}
            </div>

            <div className="fd-preview">
              <div className="fd-preview-head">
                <h3>Today’s Snapshot</h3>
                <div className="fd-live">
                  <span className="fd-live-dot" /> LIVE
                </div>
              </div>

              <div className="fd-stats">
                {[
                  { label: "Orders", value: "128" },
                  { label: "Revenue", value: "₹24,560" },
                  { label: "Tables", value: "18" },
                ].map((stat) => (
                  <div className="fd-stat" key={stat.label}>
                    <p>{stat.label}</p>
                    <strong>{stat.value}</strong>
                  </div>
                ))}
              </div>

              <div className="fd-orders">
                {ORDERS.map((order) => (
                  <div className="fd-order-row" key={order.id}>
                    <span className="fd-order-id">{order.id}</span>
                    <span className="fd-order-item">{order.item}</span>
                    <span className="fd-order-price">{order.price}</span>
                    <span
                      className="fd-order-status"
                      style={{
                        color: order.color,
                        background: `${order.color}22`,
                        border: `1px solid ${order.color}33`,
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="fd-right">
            <div className="fd-right-inner">
              <div className="fd-login-head">
                <h2>Sign in to Qzora</h2>
                <p>
                  Enter your owner account details to open your business portal.
                </p>
              </div>

              <form className="fd-form" onSubmit={handleSubmit}>
                <Field label="Email Address" icon="Mail" error={errors.email}>
                  <input
                    className={`fd-input${errors.email ? " fd-input-err" : ""}`}
                    style={inputStyle(errors.email)}
                    type="email"
                    placeholder="Enter email address"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </Field>

                <Field label="Password" icon="Lock" error={errors.password}>
                  <div className="fd-password-wrap">
                    <input
                      className={`fd-input${errors.password ? " fd-input-err" : ""}`}
                      style={inputStyle(errors.password)}
                      type={showPw ? "text" : "password"}
                      placeholder="Enter password"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                    />
                    <button
                      type="button"
                      className="fd-eye-btn"
                      onClick={() => setShowPw((prev) => !prev)}
                    >
                      {showPw ? (
                        <Icons.EyeOff size={18} />
                      ) : (
                        <Icons.Eye size={18} />
                      )}
                    </button>
                  </div>
                </Field>

                <div className="fd-form-row">
                  <label className="fd-check">
                    <input
                      type="checkbox"
                      checked={form.remember}
                      onChange={(e) => set("remember", e.target.checked)}
                    />
                    Remember me
                  </label>

                  <a href="#" className="fd-link">
                    Forgot password?
                  </a>
                </div>

                <button className="fd-submit" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Icons.Loader size={18} className="spin" /> Signing in...
                    </>
                  ) : (
                    <>
                      Sign In <Icons.ArrowRight size={17} />
                    </>
                  )}
                </button>

                <p className="fd-secure">
                  <Icons.Shield size={14} /> Your dashboard access is protected.
                </p>

                <p className="fd-bottom-text">
                  New to Qzora?{" "}
                  <Link to="/register" className="fd-link">
                    Create account
                  </Link>
                </p>
              </form>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}
