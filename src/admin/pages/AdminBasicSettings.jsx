import { useEffect, useRef, useState } from "react";
import {
  Save,
  Loader2,
  Image,
  Globe,
  Phone,
  Mail,
  MapPin,
  Clock,
  CreditCard,
  HelpCircle,
  Upload,
  X,
  UserRound,
  ChefHat,
  AlignLeft,
  Receipt,
  Wallet,
  ShieldCheck,
  Instagram,
  Facebook,
  Link as LinkIcon,
  Eye,
  QrCode,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/api";

const initialForm = {
  // Identity
  logo: "",
  favicon: "",
  browserTitle: "",
  cafeName: "",
  gstNumber: "",
  address: "",
  phone: "",
  email: "",
  openingHours: "",
  mapDirectionUrl: "",

  // Contact page
  contactHeading: "Contact Us",
  contactSubtitle: "",
  contactPhone: "",
  contactEmail: "",
  whatsapp: "",
  instagram: "",
  facebook: "",
  contactAddressTitle: "",
  contactAddressSubtitle: "",
  contactTiming: "",
  contactHours: "",
  contactHoursNote: "",
  mapEmbedUrl: "",

  // About / team
  aboutEyebrow: "About The White House Café",
  aboutHeading: "A Café Built Around Warmth",
  aboutHighlight: "in the heart of Jaipur.",
  aboutContent: "",
  founderMessage: "",
  storySection: "",
  aboutImage: "",
  aboutLocation: "",
  aboutTeamEyebrow: "People behind it",
  aboutTeamHeading: "Made with care.",
  aboutChefName: "Chef xyz",
  aboutChefNote: "Crafting warm café plates with care.",
  aboutOwnerName: "Yuvraj Singh",
  aboutOwnerNote: "Keeping the table experience smooth.",
  aboutPoweredName: "FoodDash",
  aboutPoweredNote: "Smart dining made simple.",

  // Footer
  footerBrandName: "The White House Café",
  footerBrandSmall: "Café",
  footerTagline: "",
  footerAddress: "",
  footerHours: "",
  footerCopyright: "",
  footerNavigateTitle: "Navigate",
  footerReachTitle: "Reach Us",
  footerNewsletterTitle: "Stay Updated",
  footerNewsletterText: "",
  footerNewsletterPlaceholder: "your@email.com",
  footerNewsletterButton: "Subscribe →",
  footerBadgeText: "Open now",
  footerPoweredText: "Powered by",
  footerPoweredBrand: "FoodDash",

  // Bill / receipt
  upiId: "",
  paymentNote: "Please pay at the counter.",
  receiptFooter: "Thank you for visiting!",
  showQR: true,
  printBillTheme: "premiumCafe",
  receiptFontStyle: "sans",

  // Razorpay nested values are flattened in UI and sent as razorpay object
  razorpayEnabled: false,
  razorpayMode: "test",
  razorpayKeyId: "",
  razorpayKeySecret: "",

  // Optional future help UI
  showHelpButton: true,
  helpWhatsapp: "",
  helpPhone: "",
};

function AdminBasicSettings() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState("");

  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);
  const aboutImageInputRef = useRef(null);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const normalizeSettings = (data = {}) => {
    return {
      ...initialForm,
      ...data,
      razorpayEnabled: data?.razorpay?.enabled || false,
      razorpayMode: data?.razorpay?.mode || "test",
      razorpayKeyId: data?.razorpay?.keyId || "",
      razorpayKeySecret: data?.razorpay?.keySecret || "",
      contactPhone: data?.contactPhone || data?.phone || "",
      contactEmail: data?.contactEmail || data?.email || "",
      footerBrandName: data?.footerBrandName || data?.cafeName || "",
      footerAddress: data?.footerAddress || data?.address || "",
      footerHours: data?.footerHours || data?.openingHours || "",
      helpWhatsapp: data?.helpWhatsapp || data?.whatsapp || "",
      helpPhone: data?.helpPhone || data?.phone || "",
    };
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Use full settings route so Basic Settings and Full Studio always share same document.
      const res = await api.get("/admin/settings/basic");
      setForm(normalizeSettings(res.data || {}));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file, field) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image must be under 3MB");
      return;
    }

    try {
      setUploadingField(field);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", `foodash/basic-settings/${field}`);

      const res = await api.post("/admin/settings/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = res.data?.url;
      if (!imageUrl) throw new Error("No image URL returned");

      updateField(field, imageUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Image upload failed");
    } finally {
      setUploadingField("");
    }
  };

  const saveSettings = async () => {
    if (!form.cafeName?.trim()) {
      toast.error("Restaurant name is required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        contactPhone: form.contactPhone || form.phone,
        contactEmail: form.contactEmail || form.email,
        footerBrandName: form.footerBrandName || form.cafeName,
        footerAddress: form.footerAddress || form.address,
        footerHours: form.footerHours || form.openingHours,
        razorpay: {
          enabled: Boolean(form.razorpayEnabled),
          mode: form.razorpayMode || "test",
          keyId: form.razorpayKeyId || "",
          keySecret: form.razorpayKeySecret || "",
        },
      };

      delete payload.razorpayEnabled;
      delete payload.razorpayMode;
      delete payload.razorpayKeyId;
      delete payload.razorpayKeySecret;

      const res = await api.put("/admin/settings/basic", payload);
      const updated = res.data?.settings || res.data || payload;
      setForm(normalizeSettings(updated));

      localStorage.setItem("websiteSettingsUpdated", Date.now().toString());
      window.dispatchEvent(new Event("websiteSettingsUpdated"));
      toast.success("Basic settings saved successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8ec] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-700 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#fff8ec] px-4 py-8"
      style={{ fontFamily: "'DM Sans', Inter, sans-serif" }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-700">
              Simple Restaurant Setup
            </p>
            <h1 className="mt-2 font-serif text-4xl font-black tracking-tight text-[#2b1608] sm:text-5xl">
              Basic Settings
            </h1>
            <p className="max-w-2xl mt-2 text-sm font-semibold leading-relaxed text-stone-500">
              A clean plan-friendly settings page for Website and Starter plans.
              It edits the same fields as the full Website Studio.
            </p>
          </div>

          <button
            type="button"
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#8a4b16] px-6 py-3 text-sm font-black text-white shadow-xl shadow-amber-900/15 transition hover:bg-[#6f390f] disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Saving..." : "Save Basic Settings"}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Section
              icon={<Globe size={18} />}
              title="Restaurant Identity"
              sub="Name, logo, favicon, browser title and core contact information."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Café / Restaurant Name"
                  value={form.cafeName}
                  onChange={(v) => updateField("cafeName", v)}
                />
                <Input
                  label="Browser Tab Title"
                  value={form.browserTitle}
                  onChange={(v) => updateField("browserTitle", v)}
                  placeholder="The White House Café"
                />
                <Input
                  label="GST Number"
                  value={form.gstNumber}
                  onChange={(v) => updateField("gstNumber", v)}
                  placeholder="Optional GSTIN"
                />
                <Input
                  label="Opening Hours"
                  value={form.openingHours}
                  onChange={(v) => updateField("openingHours", v)}
                  placeholder="10:00 AM – 11:00 PM · Daily"
                />
              </div>

              <ImageUploadBox
                label="Restaurant Logo"
                value={form.logo}
                field="logo"
                inputRef={logoInputRef}
                uploadingField={uploadingField}
                onUrlChange={(v) => updateField("logo", v)}
                onUpload={(file) => uploadImage(file, "logo")}
                onClear={() => updateField("logo", "")}
              />

              <ImageUploadBox
                label="Favicon / Browser Icon"
                value={form.favicon}
                field="favicon"
                inputRef={faviconInputRef}
                uploadingField={uploadingField}
                onUrlChange={(v) => updateField("favicon", v)}
                onUpload={(file) => uploadImage(file, "favicon")}
                onClear={() => updateField("favicon", "")}
              />
            </Section>

            <Section
              icon={<MapPin size={18} />}
              title="Main Contact & Location"
              sub="Used across footer, contact page, basic website and bill details."
            >
              <TextArea
                label="Full Address"
                value={form.address}
                onChange={(v) => updateField("address", v)}
                placeholder="Full restaurant address..."
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Main Phone"
                  value={form.phone}
                  onChange={(v) => updateField("phone", v)}
                  placeholder="+91 98765 43210"
                />
                <Input
                  label="Main Email"
                  value={form.email}
                  onChange={(v) => updateField("email", v)}
                  placeholder="cafe@example.com"
                />
                <Input
                  label="Google Map Direction URL"
                  value={form.mapDirectionUrl}
                  onChange={(v) => updateField("mapDirectionUrl", v)}
                  placeholder="https://maps.google.com/..."
                />
                <Input
                  label="Map Embed URL"
                  value={form.mapEmbedUrl}
                  onChange={(v) => updateField("mapEmbedUrl", v)}
                  placeholder="https://www.google.com/maps?...output=embed"
                />
              </div>
            </Section>

            <Section
              icon={<Phone size={18} />}
              title="Contact Page Details"
              sub="Texts and social links for the customer Contact page."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Contact Heading"
                  value={form.contactHeading}
                  onChange={(v) => updateField("contactHeading", v)}
                />
                <Input
                  label="Contact Eyebrow"
                  value={form.contactEyebrow}
                  onChange={(v) => updateField("contactEyebrow", v)}
                  placeholder="• Get In Touch •"
                />
              </div>
              <TextArea
                label="Contact Subtitle"
                value={form.contactSubtitle}
                onChange={(v) => updateField("contactSubtitle", v)}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Contact Phone"
                  value={form.contactPhone}
                  onChange={(v) => updateField("contactPhone", v)}
                />
                <Input
                  label="Contact Email"
                  value={form.contactEmail}
                  onChange={(v) => updateField("contactEmail", v)}
                />
                <Input
                  label="WhatsApp Number"
                  value={form.whatsapp}
                  onChange={(v) => updateField("whatsapp", v)}
                />
                <Input
                  label="Instagram URL"
                  value={form.instagram}
                  onChange={(v) => updateField("instagram", v)}
                />
                <Input
                  label="Facebook URL"
                  value={form.facebook}
                  onChange={(v) => updateField("facebook", v)}
                />
                <Input
                  label="Contact Timing"
                  value={form.contactTiming}
                  onChange={(v) => updateField("contactTiming", v)}
                />
                <Input
                  label="Address Title"
                  value={form.contactAddressTitle}
                  onChange={(v) => updateField("contactAddressTitle", v)}
                />
                <Input
                  label="Address Subtitle"
                  value={form.contactAddressSubtitle}
                  onChange={(v) => updateField("contactAddressSubtitle", v)}
                />
                <Input
                  label="Contact Hours"
                  value={form.contactHours}
                  onChange={(v) => updateField("contactHours", v)}
                />
                <Input
                  label="Contact Hours Note"
                  value={form.contactHoursNote}
                  onChange={(v) => updateField("contactHoursNote", v)}
                />
              </div>
            </Section>

            <Section
              icon={<UserRound size={18} />}
              title="About & People"
              sub="Basic story, owner, head chef and powered-by details for the About page."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="About Eyebrow"
                  value={form.aboutEyebrow}
                  onChange={(v) => updateField("aboutEyebrow", v)}
                />
                <Input
                  label="About Heading"
                  value={form.aboutHeading}
                  onChange={(v) => updateField("aboutHeading", v)}
                />
                <Input
                  label="About Highlight"
                  value={form.aboutHighlight}
                  onChange={(v) => updateField("aboutHighlight", v)}
                />
                <Input
                  label="About Location"
                  value={form.aboutLocation}
                  onChange={(v) => updateField("aboutLocation", v)}
                />
              </div>
              <TextArea
                label="About Content"
                value={form.aboutContent}
                onChange={(v) => updateField("aboutContent", v)}
                placeholder="Tell customers about the café..."
              />
              <TextArea
                label="Founder Message"
                value={form.founderMessage}
                onChange={(v) => updateField("founderMessage", v)}
                placeholder="A short message from the owner/founder..."
              />
              <TextArea
                label="Story Section"
                value={form.storySection}
                onChange={(v) => updateField("storySection", v)}
                placeholder="Your café story..."
              />

              <ImageUploadBox
                label="About Image"
                value={form.aboutImage}
                field="aboutImage"
                inputRef={aboutImageInputRef}
                uploadingField={uploadingField}
                onUrlChange={(v) => updateField("aboutImage", v)}
                onUpload={(file) => uploadImage(file, "aboutImage")}
                onClear={() => updateField("aboutImage", "")}
              />

              <div className="rounded-[1.5rem] border border-amber-100 bg-amber-50/50 p-4">
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-amber-700">
                  Team Cards
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Team Eyebrow"
                    value={form.aboutTeamEyebrow}
                    onChange={(v) => updateField("aboutTeamEyebrow", v)}
                  />
                  <Input
                    label="Team Heading"
                    value={form.aboutTeamHeading}
                    onChange={(v) => updateField("aboutTeamHeading", v)}
                  />
                  <Input
                    label="Head Chef Name"
                    value={form.aboutChefName}
                    onChange={(v) => updateField("aboutChefName", v)}
                  />
                  <Input
                    label="Owner Name"
                    value={form.aboutOwnerName}
                    onChange={(v) => updateField("aboutOwnerName", v)}
                  />
                </div>
                <div className="grid gap-4 mt-4 md:grid-cols-2">
                  <TextArea
                    label="Head Chef Note"
                    value={form.aboutChefNote}
                    onChange={(v) => updateField("aboutChefNote", v)}
                  />
                  <TextArea
                    label="Owner Note"
                    value={form.aboutOwnerNote}
                    onChange={(v) => updateField("aboutOwnerNote", v)}
                  />
                </div>
                <div className="grid gap-4 mt-4 md:grid-cols-2">
                  <Input
                    label="Powered Name"
                    value={form.aboutPoweredName}
                    onChange={(v) => updateField("aboutPoweredName", v)}
                  />
                  <Input
                    label="Powered Note"
                    value={form.aboutPoweredNote}
                    onChange={(v) => updateField("aboutPoweredNote", v)}
                  />
                </div>
              </div>
            </Section>

            <Section
              icon={<AlignLeft size={18} />}
              title="Footer Basics"
              sub="Footer content shown at the bottom of public restaurant pages."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Footer Brand Name"
                  value={form.footerBrandName}
                  onChange={(v) => updateField("footerBrandName", v)}
                />
                <Input
                  label="Small Brand Text"
                  value={form.footerBrandSmall}
                  onChange={(v) => updateField("footerBrandSmall", v)}
                />
                <Input
                  label="Footer Address"
                  value={form.footerAddress}
                  onChange={(v) => updateField("footerAddress", v)}
                />
                <Input
                  label="Footer Hours"
                  value={form.footerHours}
                  onChange={(v) => updateField("footerHours", v)}
                />
                <Input
                  label="Copyright Text"
                  value={form.footerCopyright}
                  onChange={(v) => updateField("footerCopyright", v)}
                />
                <Input
                  label="Footer Badge Text"
                  value={form.footerBadgeText}
                  onChange={(v) => updateField("footerBadgeText", v)}
                />
              </div>
              <TextArea
                label="Footer Tagline"
                value={form.footerTagline}
                onChange={(v) => updateField("footerTagline", v)}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Navigate Heading"
                  value={form.footerNavigateTitle}
                  onChange={(v) => updateField("footerNavigateTitle", v)}
                />
                <Input
                  label="Reach Heading"
                  value={form.footerReachTitle}
                  onChange={(v) => updateField("footerReachTitle", v)}
                />
                <Input
                  label="Newsletter Heading"
                  value={form.footerNewsletterTitle}
                  onChange={(v) => updateField("footerNewsletterTitle", v)}
                />
                <Input
                  label="Newsletter Placeholder"
                  value={form.footerNewsletterPlaceholder}
                  onChange={(v) =>
                    updateField("footerNewsletterPlaceholder", v)
                  }
                />
                <Input
                  label="Newsletter Button"
                  value={form.footerNewsletterButton}
                  onChange={(v) => updateField("footerNewsletterButton", v)}
                />
                <Input
                  label="Powered Brand"
                  value={form.footerPoweredBrand}
                  onChange={(v) => updateField("footerPoweredBrand", v)}
                />
              </div>
              <TextArea
                label="Newsletter Text"
                value={form.footerNewsletterText}
                onChange={(v) => updateField("footerNewsletterText", v)}
              />
              <Input
                label="Powered Text"
                value={form.footerPoweredText}
                onChange={(v) => updateField("footerPoweredText", v)}
              />
            </Section>

            <Section
              icon={<Receipt size={18} />}
              title="Bill & Receipt"
              sub="Simple receipt settings for Starter QR ordering and counter payments."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="UPI ID"
                  value={form.upiId}
                  onChange={(v) => updateField("upiId", v)}
                  placeholder="restaurant@upi"
                />
                <Select
                  label="Print Bill Theme"
                  value={form.printBillTheme}
                  onChange={(v) => updateField("printBillTheme", v)}
                  options={["premiumCafe", "modern", "classic"]}
                />
                <Select
                  label="Receipt Font Style"
                  value={form.receiptFontStyle}
                  onChange={(v) => updateField("receiptFontStyle", v)}
                  options={["sans", "serif", "mono"]}
                />
                <Toggle
                  label="Show QR on Bill"
                  value={form.showQR}
                  onChange={(v) => updateField("showQR", v)}
                />
              </div>
              <TextArea
                label="Payment Note"
                value={form.paymentNote}
                onChange={(v) => updateField("paymentNote", v)}
              />
              <TextArea
                label="Receipt Footer"
                value={form.receiptFooter}
                onChange={(v) => updateField("receiptFooter", v)}
              />
            </Section>

            <Section
              icon={<Wallet size={18} />}
              title="Razorpay Online Payment"
              sub="Restaurant-specific Razorpay keys. Keep secret key private."
            >
              <Toggle
                label="Enable Online Payment"
                value={form.razorpayEnabled}
                onChange={(v) => updateField("razorpayEnabled", v)}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  label="Razorpay Mode"
                  value={form.razorpayMode}
                  onChange={(v) => updateField("razorpayMode", v)}
                  options={["test", "live"]}
                />
                <Input
                  label="Razorpay Key ID"
                  value={form.razorpayKeyId}
                  onChange={(v) => updateField("razorpayKeyId", v)}
                  placeholder="rzp_test_xxxxx"
                />
              </div>
              <SecretInput
                label="Razorpay Key Secret"
                value={form.razorpayKeySecret}
                onChange={(v) => updateField("razorpayKeySecret", v)}
                placeholder="Enter Razorpay secret"
              />
              <div className="p-4 text-xs font-bold leading-relaxed text-orange-800 border border-orange-100 rounded-2xl bg-orange-50">
                Online payment will only work after this restaurant has valid
                Razorpay keys and the backend payment route uses these saved
                settings.
              </div>
            </Section>

            <Section
              icon={<HelpCircle size={18} />}
              title="Customer Help Details"
              sub="Optional future floating help button settings."
            >
              <Toggle
                label="Show Help Button"
                value={form.showHelpButton}
                onChange={(v) => updateField("showHelpButton", v)}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Help WhatsApp Number"
                  value={form.helpWhatsapp}
                  onChange={(v) => updateField("helpWhatsapp", v)}
                />
                <Input
                  label="Help Phone Number"
                  value={form.helpPhone}
                  onChange={(v) => updateField("helpPhone", v)}
                />
              </div>
            </Section>
          </div>

          <aside className="lg:sticky lg:top-6 h-fit">
            <LivePreview form={form} saving={saving} onSave={saveSettings} />
          </aside>
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, sub, children }) {
  return (
    <section className="rounded-[2rem] border border-amber-100 bg-white p-5 shadow-sm shadow-amber-900/5">
      <div className="flex items-start gap-3 mb-5">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-700">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-black text-[#2b1608]">{title}</h2>
          <p className="mt-1 text-xs font-semibold leading-relaxed text-stone-400">
            {sub}
          </p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Input({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-stone-500">
        {label}
      </span>
      <input
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 text-sm font-semibold transition bg-white border outline-none rounded-2xl border-amber-100 text-stone-800 placeholder:text-stone-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
      />
    </label>
  );
}

function SecretInput({ label, value, onChange, placeholder = "" }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-stone-500">
        {label}
      </span>
      <div className="flex items-center px-4 py-3 bg-white border rounded-2xl border-amber-100 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-100">
        <input
          type={show ? "text" : "password"}
          value={value || ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 text-sm font-semibold bg-transparent outline-none text-stone-800 placeholder:text-stone-300"
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="text-xs font-black text-amber-700"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-stone-500">
        {label}
      </span>
      <textarea
        rows={3}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 text-sm font-semibold transition bg-white border outline-none resize-none rounded-2xl border-amber-100 text-stone-800 placeholder:text-stone-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
      />
    </label>
  );
}

function Select({ label, value, onChange, options = [] }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-stone-500">
        {label}
      </span>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 text-sm font-black transition bg-white border outline-none rounded-2xl border-amber-100 text-stone-800 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 p-4 bg-white border rounded-2xl border-amber-100">
      <span className="text-sm font-black text-stone-800">{label}</span>
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 accent-amber-700"
      />
    </label>
  );
}

function ImageUploadBox({
  label,
  value,
  field,
  inputRef,
  uploadingField,
  onUrlChange,
  onUpload,
  onClear,
}) {
  const isUploading = uploadingField === field;

  return (
    <div className="rounded-[1.5rem] border border-amber-100 bg-[#fffdf8] p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
            {label}
          </p>
          <p className="mt-1 text-xs font-semibold text-stone-400">
            Upload from PC or paste image URL.
          </p>
        </div>
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="p-2 text-red-500 rounded-full bg-red-50"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-[120px_1fr]">
        <div className="grid w-full overflow-hidden border h-28 place-items-center rounded-2xl border-amber-100 bg-amber-50 md:w-28">
          {value ? (
            <img
              src={value}
              alt={label}
              className="object-cover w-full h-full"
            />
          ) : (
            <Image className="text-amber-700" />
          )}
        </div>

        <div className="space-y-3">
          <input
            value={value || ""}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="Paste image URL"
            className="w-full px-4 py-3 text-sm font-semibold bg-white border outline-none rounded-2xl border-amber-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
          />

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onUpload(e.target.files?.[0])}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#2b1608] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white disabled:opacity-60"
          >
            {isUploading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Upload size={15} />
            )}
            {isUploading ? "Uploading..." : "Upload From PC"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LivePreview({ form, saving, onSave }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-amber-100 bg-white shadow-xl shadow-amber-900/5">
      <div className="p-5 border-b border-amber-100 bg-gradient-to-br from-amber-50 to-white">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-700">
          Live Preview
        </p>
        <h2 className="mt-1 text-2xl font-black text-[#2b1608]">
          {form.cafeName || "Restaurant Name"}
        </h2>
      </div>

      <div className="p-5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="grid w-16 h-16 overflow-hidden place-items-center rounded-2xl bg-amber-100">
            {form.logo ? (
              <img
                src={form.logo}
                alt="Logo"
                className="object-cover w-full h-full"
              />
            ) : (
              <Image className="text-amber-700" />
            )}
          </div>
          <div>
            <p className="text-sm font-black text-stone-800">
              {form.browserTitle || "Browser title"}
            </p>
            <p className="text-xs font-semibold text-stone-400">
              Favicon + tab title
            </p>
          </div>
        </div>

        <PreviewRow
          icon={<MapPin size={15} />}
          text={form.address || "Address not added"}
        />
        <PreviewRow
          icon={<Phone size={15} />}
          text={form.phone || "Phone not added"}
        />
        <PreviewRow
          icon={<Mail size={15} />}
          text={form.email || "Email not added"}
        />
        <PreviewRow
          icon={<Clock size={15} />}
          text={form.openingHours || "Hours not added"}
        />

        <div className="rounded-2xl bg-[#fff8ec] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
            People
          </p>
          <PreviewRow
            icon={<UserRound size={15} />}
            text={form.aboutOwnerName || "Owner not added"}
          />
          <PreviewRow
            icon={<ChefHat size={15} />}
            text={form.aboutChefName || "Chef not added"}
          />
        </div>

        <div className="p-4 text-white rounded-2xl bg-stone-950">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
            Bill
          </p>
          <p className="mt-2 text-sm font-bold">
            Theme: {form.printBillTheme || "premiumCafe"}
          </p>
          <p className="mt-1 text-xs text-white/60">
            {form.receiptFooter || "Receipt footer not added"}
          </p>
        </div>

        <div className="p-4 text-xs font-bold border rounded-2xl border-emerald-100 bg-emerald-50 text-emerald-800">
          Razorpay:{" "}
          {form.razorpayEnabled ? `Enabled (${form.razorpayMode})` : "Disabled"}
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#8a4b16] px-5 py-3 text-sm font-black text-white transition hover:bg-[#6f390f] disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          Save Basic Settings
        </button>
      </div>
    </div>
  );
}

function PreviewRow({ icon, text }) {
  return (
    <div className="flex items-center gap-3 text-sm text-stone-600">
      <div className="text-amber-700">{icon}</div>
      <p className="font-semibold break-words">{text}</p>
    </div>
  );
}

export default AdminBasicSettings;
