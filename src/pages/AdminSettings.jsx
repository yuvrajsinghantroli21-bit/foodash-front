import { useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import {
  Building2,
  Clock,
  CreditCard,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  Settings,
  Sparkles,
  Store,
  Wallet,
} from "lucide-react";

const initialForm = {
  cafeName: "The White House Café",
  logo: "",
  address: "",
  phone: "",
  email: "",
  gstNumber: "",
  openingHours: "",
  upiId: "",
  paymentNote: "",
  receiptFooter: "Thank you for dining with us.",
};

function AdminSettings() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = () => {
    setLoading(true);

    api
      .get("/admin/settings")
      .then((res) => {
        setForm({
          cafeName: res.data?.cafeName || "The White House Café",
          logo: res.data?.logo || "",
          address: res.data?.address || "",
          phone: res.data?.phone || "",
          email: res.data?.email || "",
          gstNumber: res.data?.gstNumber || "",
          openingHours: res.data?.openingHours || "",
          upiId: res.data?.upiId || "",
          paymentNote: res.data?.paymentNote || "",
          receiptFooter:
            res.data?.receiptFooter || "Thank you for dining with us.",
        });
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to load settings");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveSettings = (e) => {
    e.preventDefault();

    if (!form.cafeName.trim()) {
      toast.error("Café name is required");
      return;
    }

    setSaving(true);

    api
      .put("/admin/settings", form)
      .then((res) => {
        const updated = res.data?.settings || res.data;

        setForm({
          cafeName: updated?.cafeName || "The White House Café",
          logo: updated?.logo || "",
          address: updated?.address || "",
          phone: updated?.phone || "",
          email: updated?.email || "",
          gstNumber: updated?.gstNumber || "",
          openingHours: updated?.openingHours || "",
          upiId: updated?.upiId || "",
          paymentNote: updated?.paymentNote || "",
          receiptFooter:
            updated?.receiptFooter || "Thank you for dining with us.",
        });

        toast.success("Settings updated successfully");
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response?.data?.message || "Failed to save settings");
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const resetLocalForm = () => {
    setForm(initialForm);
    toast.success("Form reset locally");
  };

  return (
    <div
      className="min-h-screen bg-[#f8f5ef] text-[#111936]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="relative mb-6 overflow-hidden rounded-[30px] border border-amber-100 bg-[#111936] p-6 text-white shadow-[0_20px_55px_rgba(17,25,54,0.18)] sm:p-7 lg:p-8">
          <div className="absolute rounded-full -right-24 -top-24 h-72 w-72 bg-amber-400/20 blur-3xl" />
          <div className="absolute rounded-full -bottom-28 left-20 h-72 w-72 bg-white/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300 ring-1 ring-white/10">
                <Settings size={13} />
                Restaurant Control
              </div>

              <h1
                className="mt-5 max-w-3xl text-3xl font-black leading-[0.98] tracking-[-0.05em] sm:text-4xl lg:text-5xl"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Restaurant Settings
              </h1>

              <p className="max-w-2xl mt-4 text-sm font-semibold leading-7 text-white/62">
                Manage café identity, receipt details, contact information,
                payment notes and business information from one place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <HeroMini label="Brand" value={form.cafeName || "—"} />
              <HeroMini label="Phone" value={form.phone || "Not set"} />
              <HeroMini label="UPI" value={form.upiId || "Not set"} />
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex h-[280px] items-center justify-center rounded-[26px] border border-amber-100 bg-white text-sm font-bold text-slate-400 shadow-sm">
            <Loader2 className="mr-2 animate-spin" size={18} />
            Loading settings...
          </div>
        ) : (
          <form onSubmit={saveSettings}>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_390px]">
              {/* LEFT FORM */}
              <div className="space-y-6">
                <SettingsSection
                  title="Restaurant Identity"
                  sub="Basic public identity of your café"
                  icon={<Store size={18} />}
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InputField
                      label="Café Name"
                      name="cafeName"
                      value={form.cafeName}
                      onChange={handleChange}
                      icon={<Building2 size={17} />}
                      placeholder="The White House Café"
                      required
                    />

                    <InputField
                      label="Logo URL"
                      name="logo"
                      value={form.logo}
                      onChange={handleChange}
                      icon={<Sparkles size={17} />}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <TextareaField
                    label="Address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    icon={<MapPin size={17} />}
                    placeholder="Write complete restaurant address..."
                    rows={4}
                  />
                </SettingsSection>

                <SettingsSection
                  title="Contact Information"
                  sub="Shown on receipt, future website footer and customer pages"
                  icon={<Phone size={18} />}
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InputField
                      label="Phone Number"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      icon={<Phone size={17} />}
                      placeholder="+91 98765 43210"
                    />

                    <InputField
                      label="Email Address"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      icon={<Mail size={17} />}
                      placeholder="cafe@example.com"
                    />
                  </div>
                </SettingsSection>

                <SettingsSection
                  title="Business Details"
                  sub="Useful for bills, invoices and owner records"
                  icon={<FileText size={18} />}
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InputField
                      label="GST Number"
                      name="gstNumber"
                      value={form.gstNumber}
                      onChange={handleChange}
                      icon={<FileText size={17} />}
                      placeholder="GSTIN optional"
                    />

                    <InputField
                      label="Opening Hours"
                      name="openingHours"
                      value={form.openingHours}
                      onChange={handleChange}
                      icon={<Clock size={17} />}
                      placeholder="10:00 AM - 11:00 PM"
                    />
                  </div>
                </SettingsSection>

                <SettingsSection
                  title="Payment & Receipt"
                  sub="Used later in print bill and customer payment instructions"
                  icon={<CreditCard size={18} />}
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InputField
                      label="UPI ID"
                      name="upiId"
                      value={form.upiId}
                      onChange={handleChange}
                      icon={<Wallet size={17} />}
                      placeholder="whitehouse@upi"
                    />

                    <InputField
                      label="Payment Note"
                      name="paymentNote"
                      value={form.paymentNote}
                      onChange={handleChange}
                      icon={<CreditCard size={17} />}
                      placeholder="Pay at counter / Scan UPI QR"
                    />
                  </div>

                  <TextareaField
                    label="Receipt Footer Message"
                    name="receiptFooter"
                    value={form.receiptFooter}
                    onChange={handleChange}
                    icon={<FileText size={17} />}
                    placeholder="Thank you for dining with us."
                    rows={4}
                  />
                </SettingsSection>
              </div>

              {/* RIGHT PREVIEW */}
              <aside className="xl:sticky xl:top-24 h-fit">
                <div className="overflow-hidden rounded-[28px] border border-amber-100 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.07)]">
                  <div className="p-5 border-b border-amber-100 bg-gradient-to-r from-white via-amber-50 to-white">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
                      Live Preview
                    </p>

                    <h2
                      className="mt-2 text-2xl font-black tracking-tight text-[#111936]"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      Receipt Identity
                    </h2>
                  </div>

                  <div className="p-5">
                    <div className="rounded-[24px] border border-dashed border-amber-200 bg-[#fffaf1] p-5 text-center">
                      {form.logo ? (
                        <img
                          src={form.logo}
                          alt={form.cafeName}
                          className="object-contain w-auto h-16 mx-auto mb-4 rounded-xl"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#111936] text-xl font-black text-amber-300">
                          W
                        </div>
                      )}

                      <h3
                        className="text-2xl font-black leading-tight text-[#111936]"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        {form.cafeName || "The White House Café"}
                      </h3>

                      {form.address && (
                        <p className="max-w-xs mx-auto mt-3 text-xs font-semibold leading-6 text-slate-500">
                          {form.address}
                        </p>
                      )}

                      <div className="h-px my-5 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

                      <div className="space-y-2 text-xs font-bold text-left text-slate-500">
                        <PreviewRow label="Phone" value={form.phone} />
                        <PreviewRow label="Email" value={form.email} />
                        <PreviewRow label="GST" value={form.gstNumber} />
                        <PreviewRow label="Hours" value={form.openingHours} />
                        <PreviewRow label="UPI" value={form.upiId} />
                      </div>

                      {form.paymentNote && (
                        <div className="p-3 mt-5 text-xs font-bold leading-6 bg-white rounded-2xl text-amber-700">
                          {form.paymentNote}
                        </div>
                      )}

                      <p className="mt-5 text-xs font-black italic text-[#111936]">
                        “{form.receiptFooter || "Thank you for dining with us."}
                        ”
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 mt-5">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#111936] px-5 text-sm font-black text-amber-300 transition hover:bg-[#1c274f] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <>
                            <Loader2 size={17} className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={17} />
                            Save Settings
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={fetchSettings}
                        disabled={saving}
                        className="flex items-center justify-center h-12 gap-2 px-5 text-sm font-black transition bg-white border rounded-2xl border-amber-200 text-slate-600 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <RefreshCw size={17} />
                        Reload Saved
                      </button>

                      <button
                        type="button"
                        onClick={resetLocalForm}
                        disabled={saving}
                        className="flex items-center justify-center h-12 gap-2 px-5 text-sm font-black text-red-500 transition border border-red-100 rounded-2xl bg-red-50 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Reset Form
                      </button>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

function HeroMini({ label, value }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-300/80">
        {label}
      </p>

      <h3 className="mt-2 text-base font-black tracking-tight text-white truncate">
        {value}
      </h3>
    </div>
  );
}

function SettingsSection({ title, sub, icon, children }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-amber-100 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.06)]">
      <div className="flex items-start gap-3 px-5 py-5 border-b border-amber-100 bg-gradient-to-r from-white via-amber-50/70 to-white">
        <div className="flex items-center justify-center h-11 w-11 shrink-0 rounded-2xl bg-amber-100 text-amber-700">
          {icon}
        </div>

        <div>
          <h2
            className="text-lg font-black tracking-tight text-[#111936]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {title}
          </h2>

          <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
            {sub}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">{children}</div>
    </section>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  icon,
  placeholder,
  required,
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>

      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="h-12 w-full rounded-2xl border border-amber-100 bg-[#fffaf1] px-4 text-sm font-bold text-[#111936] outline-none transition placeholder:text-slate-300 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
      />
    </label>
  );
}

function TextareaField({
  label,
  name,
  value,
  onChange,
  icon,
  placeholder,
  rows = 4,
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
        {icon}
        {label}
      </span>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none rounded-2xl border border-amber-100 bg-[#fffaf1] px-4 py-3 text-sm font-bold leading-7 text-[#111936] outline-none transition placeholder:text-slate-300 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
      />
    </label>
  );
}

function PreviewRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 px-3 py-2 bg-white rounded-xl">
      <span className="text-slate-400">{label}</span>
      <span className="max-w-[190px] text-right text-[#111936]">
        {value || "—"}
      </span>
    </div>
  );
}

export default AdminSettings;
