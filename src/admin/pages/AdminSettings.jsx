import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../../api/api";
import toast from "react-hot-toast";
import { useWebsiteSettings } from "../../context/WebsiteSettingsContext";

import {
  AlignLeft,
  ArrowRight,
  BadgePercent,
  Building2,
  Check,
  Clock,
  Code2,
  Coffee,
  Cpu,
  CreditCard,
  Download,
  Eye,
  Facebook,
  FileText,
  Gift,
  Globe,
  Grid3X3,
  Home,
  Image,
  Info,
  Instagram,
  Layout,
  Link,
  Loader2,
  Mail,
  MapPin,
  Menu,
  Minus,
  Monitor,
  Move,
  Palette,
  Percent,
  Phone,
  PhoneCall,
  Plus,
  Printer,
  QrCode,
  Receipt,
  RefreshCw,
  RotateCcw,
  Save,
  Shield,
  ShoppingBag,
  Sliders,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Tag,
  Trash2,
  Type,
  Upload,
  Utensils,
  Wallet,
  Wand2,
  X,
  Zap,
  ScanLine,
  Heart,
  Send,
} from "lucide-react";

import { Navigation as NavigationIcon } from "lucide-react";

const DEFAULT_HOME_SPECIALS = [
  {
    emoji: "☕",
    tag: "Most Loved",
    name: "Signature Cold Coffee",
    desc: "Chilled coffee, soft cream, chocolate dust and a slow café finish.",
    price: "₹50",
  },
  {
    emoji: "🍕",
    tag: "Chef Pick",
    name: "Golden Cheese Pizza",
    desc: "Soft crust, melted cheese, warm herbs and slow tomato sauce.",
    price: "₹188",
  },
  {
    emoji: "🍔",
    tag: "Popular",
    name: "House Café Burger",
    desc: "Toasted bun, cheese, crisp vegetables and our warm house patty.",
    price: "₹100",
  },
  {
    emoji: "🥐",
    tag: "Fresh",
    name: "Flaky Golden Patties",
    desc: "Crisp layers, mild spices and bakery-style comfort in every bite.",
    price: "₹50",
  },
  {
    emoji: "🍰",
    tag: "Sweet",
    name: "Cream Pastry",
    desc: "Soft sponge, light cream and a gentle café dessert mood.",
    price: "₹80",
  },
];

const initialForm = {
  cafeName: "The White House Café",
  logo: "",
  address: "",
  phone: "",
  email: "",
  gstNumber: "",
  openingHours: "",

  razorpayEnabled: false,
  razorpayMode: "test",
  razorpayKeyId: "",
  razorpayKeySecret: "",

  // upiId: "",
  // paymentNote: "",
  // receiptFooter: "Thank you for dining with us.",

  heroHeading: "Crafted with Passion, Served with Love",
  heroSubtitle: "Experience the finest flavours in a warm, welcoming space.",
  heroImage: "",
  ctaText: "Explore Our Menu",
  homepageLayout: "centered",
  homepageAnimation: true,
  atmosphereStyle: "warm",
  heroPrimaryColor: "#2f1608",
  heroSecondaryColor: "#7c2d12",
  heroAccentColor: "#f59e0b",
  heroBgColor: "#fff3d8",
  heroTextColor: "#2a1408",
  heroMutedTextColor: "#735b43",
  heroButtonColor: "#7c2d12",
  heroButtonTextColor: "#fffaf1",
  heroCardBgColor: "#fff8e7",
  editorialCardBgColor: "#120d08",

  colorPalette: "warmCafe",
  primaryColor: "#111936",
  secondaryColor: "#D4A853",
  bgColor: "#f8f5ef",
  textColor: "#1a1a1a",
  cardBg: "#ffffff",
  buttonColor: "#111936",
  accentColor: "#D4A853",

  showHeroSection: true,
  showMomentsSection: true,
  showJourneySection: true,
  showMarqueeSection: true,
  showSpecialsSection: true,
  showEditorialSection: true,
  showCtaSection: true,

  globalFont: "DM Sans",
  headingFont: "Fraunces",
  bodyFont: "DM Sans",
  navbarFont: "DM Sans",
  menuCardFont: "Fraunces",
  buttonFont: "DM Sans",
  baseFontSize: 16,
  headingColor: "#111936",
  bodyTextColor: "#4a4a4a",
  buttonTextColor: "#ffffff",
  fontWeight: "500",
  letterSpacing: "0",

  menuPreviewAnimation: true,
  menuPreviewEyebrow: "• Explore Our •",
  menuPreviewSubtitle:
    "Browse our curated café menu, explore categories, and discover freshly prepared dishes before you dine.",
  menuPreviewTitleTop: "Menu",
  menuPreviewTitleBottom: "Preview",
  menuPreviewIntroSmallText: "Painting the menu mood",
  menuPreviewIntroBottomText: "Fresh plates. Warm café mood.",
  menuPreviewBgColor: "#f5f0e8",
  menuPreviewCardBg: "#ffffff",
  menuPreviewTitleColor: "#241309",

  menuAnimation: true,
  menuTitle: "Menu",
  menuIntroTagline: "Coffee • Plates • Quiet Talks",
  menuSubtitle:
    "Browse our menu, add items to your cart, and place your order — all from your table.",
  menuBgColor: "#f5f0e8",
  menuTitleColor: "#b45309",
  menuSectionCardBg: "#ffffff",

  menuLayout: "grid",
  categoryFilterStyle: "pills",
  foodBadgeStyle: "rounded",
  vegIndicatorStyle: "classic",
  menuCardPreset: "premium",

  cardWidth: 320,
  cardHeight: 420,
  cardBorderRadius: 24,
  cardImageHeight: 200,
  cardPadding: 20,
  cardShadow: 3,
  cardBorderThickness: 0,
  cardBgColor: "#ffffff",
  cardTextColor: "#111936",
  cardPriceColor: "#D4A853",
  cardBadgeColor: "#111936",
  cardButtonRadius: 14,
  cardButtonColor: "#111936",
  cardButtonTextColor: "#ffffff",

  dividerStyle: "goldLine",
  dividerColor: "#D4A853",
  dividerHeight: 2,
  dividerWidth: 100,
  customSvgCode: "",

  navbarLayout: "logoLeft",
  logoPosition: "left",
  stickyNavbar: true,
  transparentNavbar: false,
  navbarBgColor: "#fbf7ef",
  navbarTextColor: "#2d2416",
  navbarActiveLinkColor: "#d97707",
  navbarButtonStyle: "filled",
  mobileMenuStyle: "slide",
  navbarHeight: 76,
  navRounded: 14,
  showFoodDashLogo: true,
  navbarBottomLine: true,
  navbarBottomLineHeight: 2,
  navbarBottomLineStyle: "gradient",
  navbarBottomLineColor1: "#d97707",
  navbarBottomLineColor2: "#e6b85c",
  navbarBottomLineColor3: "#d97707",

  aboutAnimation: true,
  aboutEyebrow: "About The White House Café",
  aboutHeading: "A warm café corner",
  aboutHighlight: "in the heart of Jaipur.",
  aboutContent:
    "The White House Café is made for slow conversations, warm plates, rich coffee and a smooth dining experience.",
  founderMessage:
    "We wanted to create a café experience that feels warm, simple and memorable from the moment guests sit at the table.",
  storySection:
    "At The White House Café, every plate, cup and table moment is designed to feel calm, personal and effortless.",
  aboutImage: "",
  aboutLocation: "Khatipura, Near Lal Mandir Road, Jaipur, Rajasthan",
  aboutBgColor: "#f5f0e8",
  aboutTextColor: "#2b1609",
  aboutMutedTextColor: "rgba(61,36,18,0.62)",
  aboutCardBg: "#fffaf1",
  aboutSectionBg: "#fffaf1",
  aboutLocationBg: "#2b1609",
  aboutFontSize: 16,

  aboutTeamEyebrow: "People behind it",
  aboutTeamHeading: "Made with care.",
  aboutChefName: "Chef xyz",
  aboutChefNote: "Crafting warm café plates with care.",
  aboutOwnerName: "Yuvraj Singh",
  aboutOwnerNote: "Keeping the table experience smooth.",
  aboutPoweredName: "FoodDash",
  aboutPoweredNote: "Smart dining made simple.",

  contactHeading: "Get In Touch",
  contactPhone: "",
  contactEmail: "",
  whatsapp: "",
  mapEmbedUrl: "",
  mapDirectionUrl: "",
  instagram: "",
  facebook: "",
  twitter: "",
  contactFormStyle: "minimal",
  contactBgColor: "#ffffff",
  contactTextColor: "#111936",
  contactAnimation: true,
  contactEyebrow: "• Get In Touch •",
  contactSubtitle:
    "We'd love to hear from you. Visit us at Khatipura or drop us a message and we'll get back to you shortly.",

  contactAddressTitle: "Khatipura, Near Lal Mandir Road",
  contactAddressSubtitle: "Jaipur, Rajasthan 302012, India",
  contactTiming: "Mon – Sun, 9:00 AM – 10:00 PM",
  contactHours: "Daily · 9:00 AM – 10:00 PM",
  contactHoursNote: "Come by for coffee, meals & memories.",

  contactAccentColor: "#b87524",
  contactMutedTextColor: "#64748b",
  contactCardBg: "#ffffff",

  footerBrandName: "The White House Café",
  footerBrandSmall: "Café",
  footerTagline:
    "A modern dining experience where craft meets warmth — powered by QR table ordering.",
  footerAddress: "Khatipura, Near Lal Mandir Road, Jaipur, Rajasthan",
  footerHours: "10:00 AM – 11:00 PM · Daily",
  footerCopyright: "© 2026 The White House Café · All rights reserved.",
  footerNavigateTitle: "Navigate",
  footerReachTitle: "Reach Us",
  footerNewsletterTitle: "Stay Updated",
  footerNewsletterText:
    "Get notified about our seasonal menus, special events and exclusive offers.",
  footerNewsletterPlaceholder: "your@email.com",
  footerNewsletterButton: "Subscribe →",
  footerBadgeText: "Open now · Closes at 11 PM",
  footerPoweredText: "Powered by",
  footerPoweredBrand: "FoodDash",
  footerBgColor: "#0d0e14",
  footerHeadingColor: "#ffffff",
  footerTextColor: "rgba(255,255,255,0.45)",
  footerAccentColor: "#D4A853",
  footerCardBg: "rgba(255,255,255,0.03)",
  footerBorderColor: "rgba(255,255,255,0.08)",

  // showQR: true,
  // printBillTheme: "classic",
  // receiptFontStyle: "serif",

  upiId: "",
  paymentNote: "",
  receiptFooter: "Thank you for dining with us.",
  showQR: true,
  printBillTheme: "modern",
  receiptFontStyle: "sans",

  thankYouMessage: "Your order is being prepared with love!",
  feedbackPopup: true,
  rewardCoupon: false,
  sessionExpiryMessage: "Your session has expired. Please scan again.",
  orderStatusText: "We're preparing your order",

  customCSS: "",
  sectionVisibility: {
    hero: true,
    menu: true,
    about: true,
    contact: true,
    footer: true,
  },

  homeSpecials: DEFAULT_HOME_SPECIALS,
};

const COLOR_PALETTES = {
  warmCafe: {
    name: "Warm Café",
    primary: "#111936",
    secondary: "#D4A853",
    bg: "#f8f5ef",
    text: "#1a1a1a",
    card: "#ffffff",
    button: "#111936",
    accent: "#D4A853",
  },
  whiteHouse: {
    name: "White House Café",
    primary: "#3d2412",
    secondary: "#d6a84f",
    bg: "#f5f0e8",
    text: "#2d2416",
    card: "#fffaf1",
    button: "#3d2412",
    accent: "#d97707",
  },
  luxuryGold: {
    name: "Luxury Gold",
    primary: "#1a1208",
    secondary: "#C9A84C",
    bg: "#0d0a05",
    text: "#f5e6c8",
    card: "#1c1610",
    button: "#C9A84C",
    accent: "#f0d080",
  },
  modernDark: {
    name: "Modern Dark",
    primary: "#18181b",
    secondary: "#6366f1",
    bg: "#09090b",
    text: "#fafafa",
    card: "#1c1c1f",
    button: "#6366f1",
    accent: "#a5b4fc",
  },
  minimalWhite: {
    name: "Minimal White",
    primary: "#18181b",
    secondary: "#525252",
    bg: "#fafafa",
    text: "#18181b",
    card: "#ffffff",
    button: "#18181b",
    accent: "#a1a1aa",
  },
  emeraldFresh: {
    name: "Emerald Fresh",
    primary: "#064e3b",
    secondary: "#10b981",
    bg: "#f0fdf4",
    text: "#14532d",
    card: "#ffffff",
    button: "#064e3b",
    accent: "#6ee7b7",
  },
  roseDessert: {
    name: "Rose Dessert",
    primary: "#881337",
    secondary: "#f43f5e",
    bg: "#fff1f2",
    text: "#4c0519",
    card: "#ffffff",
    button: "#881337",
    accent: "#fb7185",
  },
};

const MENU_CARD_PRESETS = [
  {
    id: "premium",
    label: "Premium Rounded",
    desc: "Soft shadows, rounded corners, elegant spacing",
    values: {
      cardWidth: 320,
      cardHeight: 420,
      cardBorderRadius: 24,
      cardImageHeight: 200,
      cardPadding: 20,
      cardShadow: 3,
      cardBorderThickness: 0,
      cardBgColor: "#ffffff",
      cardTextColor: "#111936",
      cardPriceColor: "#D4A853",
      cardBadgeColor: "#111936",
      cardButtonRadius: 14,
      cardButtonColor: "#111936",
      cardButtonTextColor: "#ffffff",
    },
  },
  {
    id: "compact",
    label: "Compact Café",
    desc: "Smaller cards for long menus and mobile screens",
    values: {
      cardWidth: 280,
      cardHeight: 360,
      cardBorderRadius: 20,
      cardImageHeight: 150,
      cardPadding: 16,
      cardShadow: 2,
      cardBorderThickness: 1,
      cardBgColor: "#fffaf1",
      cardTextColor: "#3d2412",
      cardPriceColor: "#d97707",
      cardBadgeColor: "#3d2412",
      cardButtonRadius: 12,
      cardButtonColor: "#3d2412",
      cardButtonTextColor: "#fffaf1",
    },
  },
  {
    id: "editorial",
    label: "Editorial Luxury",
    desc: "Tall magazine-style cards with premium contrast",
    values: {
      cardWidth: 355,
      cardHeight: 520,
      cardBorderRadius: 34,
      cardImageHeight: 275,
      cardPadding: 22,
      cardShadow: 5,
      cardBorderThickness: 0,
      cardBgColor: "#1a1208",
      cardTextColor: "#f5e6c8",
      cardPriceColor: "#f0d080",
      cardBadgeColor: "#C9A84C",
      cardButtonRadius: 999,
      cardButtonColor: "#C9A84C",
      cardButtonTextColor: "#1a1208",
    },
  },
  {
    id: "minimal",
    label: "Minimal Bistro",
    desc: "Clean, white, fast and simple card layout",
    values: {
      cardWidth: 300,
      cardHeight: 380,
      cardBorderRadius: 16,
      cardImageHeight: 165,
      cardPadding: 16,
      cardShadow: 0,
      cardBorderThickness: 1,
      cardBgColor: "#ffffff",
      cardTextColor: "#18181b",
      cardPriceColor: "#18181b",
      cardBadgeColor: "#f4f4f5",
      cardButtonRadius: 10,
      cardButtonColor: "#18181b",
      cardButtonTextColor: "#ffffff",
    },
  },
];

const DIVIDER_PRESETS = [
  { id: "minimalLine", label: "Minimal Line" },
  { id: "goldLine", label: "Premium Gold" },
  { id: "luxuryOrnament", label: "Luxury Ornament" },
  { id: "modernWave", label: "Modern Wave" },
  { id: "floralCafe", label: "Floral Café" },
  { id: "general", label: "general Café" },
];

const NAV_SECTIONS = [
  { id: "identity", label: "Identity", icon: Store },
  { id: "navbar", label: "Header", icon: Layout },
  { id: "footer", label: "Footer", icon: AlignLeft },
  { id: "homepage", label: "Homepage", icon: Home },
  { id: "menu", label: "Menu", icon: Utensils },
  { id: "branding", label: "Colors", icon: Palette },
  { id: "fonts", label: "Fonts", icon: Type },
  { id: "dividers", label: "Dividers", icon: Minus },
  { id: "about", label: "About", icon: Info },
  { id: "contact", label: "Contact", icon: PhoneCall },
  { id: "bill", label: "Bill", icon: Receipt },
  { id: "ordering", label: "Ordering", icon: ShoppingBag, badge: "Soon" },
  { id: "presets", label: "Presets", icon: Sparkles },
  { id: "advanced", label: "Advanced", icon: Cpu, badge: "Soon" },
  { id: "ai", label: "AI Studio", icon: Wand2, badge: "Soon" },
];

function AdminSettings() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("identity");
  const [previewMode, setPreviewMode] = useState("desktop");
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  const [heroImagePreview, setHeroImagePreview] = useState("");
  const [aboutImagePreview, setAboutImagePreview] = useState("");
  const [presetName, setPresetName] = useState("");
  const [presetDescription, setPresetDescription] = useState("");
  const [themePresets, setThemePresets] = useState([]);
  const [presetLoading, setPresetLoading] = useState(false);

  const logoInputRef = useRef(null);
  const heroInputRef = useRef(null);
  const aboutInputRef = useRef(null);
  const svgInputRef = useRef(null);
  const navScrollRef = useRef(null);
  const { setSettings } = useWebsiteSettings();

  const mergeSettings = (data) => {
    const d = data || {};

    return {
      ...initialForm,
      ...d,

      sectionVisibility: {
        ...initialForm.sectionVisibility,
        ...(d.sectionVisibility || {}),
      },

      homeSpecials:
        Array.isArray(d.homeSpecials) && d.homeSpecials.length
          ? d.homeSpecials
          : DEFAULT_HOME_SPECIALS,
    };
  };

  const fetchSettings = useCallback(() => {
    setLoading(true);

    api
      .get("/admin/settings")
      .then((res) => {
        const next = mergeSettings(res.data || {});

        const updatedNext = {
          ...next,

          razorpayEnabled: next?.razorpay?.enabled || false,
          razorpayMode: next?.razorpay?.mode || "test",
          razorpayKeyId: next?.razorpay?.keyId || "",
          razorpayKeySecret: next?.razorpay?.keySecret || "",
        };

        setForm(updatedNext);
        setLogoPreview(updatedNext.logo || "");
        setHeroImagePreview(updatedNext.heroImage || "");
        setAboutImagePreview(updatedNext.aboutImage || "");
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const fetchThemePresets = useCallback(() => {
    api
      .get("/admin/theme-presets")
      .then((res) => setThemePresets(Array.isArray(res.data) ? res.data : []))
      .catch(() => setThemePresets([]));
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchThemePresets();
  }, [fetchSettings, fetchThemePresets]);

  useEffect(() => {
    sessionStorage.setItem("websitePreviewSettings", JSON.stringify(form));
  }, [form]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const setField = useCallback((name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFileUpload = (file, field, setPreview) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image must be under 3MB");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", `foodash/settings/${field}`);

    api
      .post("/admin/settings/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        const imageUrl = res.data.url;
        setField(field, imageUrl);
        setPreview(imageUrl);
        toast.success("Image uploaded successfully");
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response?.data?.message || "Image upload failed");
      });
  };

  const handleSvgUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setField("customSvgCode", e.target.result);
      setField("dividerStyle", "customSvg");
      toast.success("SVG divider loaded");
    };
    reader.readAsText(file);
  };

  const applyPalette = (key) => {
    const p = COLOR_PALETTES[key];
    if (!p) return;

    setForm((prev) => ({
      ...prev,
      colorPalette: key,
      primaryColor: p.primary,
      secondaryColor: p.secondary,
      bgColor: p.bg,
      textColor: p.text,
      cardBg: p.card,
      buttonColor: p.button,
      accentColor: p.accent,
      headingColor: p.primary,
      bodyTextColor: p.text,
      navbarActiveLinkColor: p.accent,
    }));
  };

  const applyCardPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      menuCardPreset: preset.id,
      ...preset.values,
    }));
  };

  const saveSettings = (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (!form.cafeName.trim()) {
      toast.error("Café name is required");
      return;
    }

    setSaving(true);

    const payload = {
      ...form,

      razorpay: {
        enabled: form.razorpayEnabled,
        mode: form.razorpayMode,
        keyId: form.razorpayKeyId,
        keySecret: form.razorpayKeySecret,
      },
    };

    api
      .put("/admin/settings", payload)
      .then((res) => {
        const updated = res.data?.settings || res.data;
        const merged = mergeSettings(updated);

        const finalMerged = {
          ...merged,

          razorpayEnabled: merged?.razorpay?.enabled || false,
          razorpayMode: merged?.razorpay?.mode || "test",
          razorpayKeyId: merged?.razorpay?.keyId || "",
          razorpayKeySecret: merged?.razorpay?.keySecret || "",
        };

        if (updated) {
          setForm(finalMerged);
          setSettings(finalMerged);
        }

        localStorage.setItem("websiteSettingsUpdated", Date.now().toString());

        toast.success("Settings saved successfully ✨");
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || "Failed to save"),
      )
      .finally(() => setSaving(false));
  };
  const resetLocalForm = () => {
    setForm(initialForm);
    setLogoPreview("");
    setHeroImagePreview("");
    setAboutImagePreview("");
    toast.success("Form reset locally");
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    setMobilePreviewOpen(false);
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollSectionNav = (direction) => {
    if (!navScrollRef.current) return;

    navScrollRef.current.scrollBy({
      left: direction === "left" ? -340 : 340,
      behavior: "smooth",
    });
  };

  const saveThemePreset = () => {
    if (!presetName.trim()) {
      toast.error("Preset name is required");
      return;
    }

    setPresetLoading(true);
    api
      .post("/admin/theme-presets", {
        name: presetName.trim(),
        description: presetDescription.trim(),
        settings: form,
      })
      .then(() => {
        toast.success("Theme preset saved");
        setPresetName("");
        setPresetDescription("");
        fetchThemePresets();
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || "Failed to save preset"),
      )
      .finally(() => setPresetLoading(false));
  };

  const applyThemePreset = (id) => {
    setPresetLoading(true);
    api
      .put(`/admin/theme-presets/${id}/apply`)
      .then((res) => {
        const next = mergeSettings(res.data?.settings || {});
        setForm(next);
        setLogoPreview(next.logo || "");
        setHeroImagePreview(next.heroImage || "");
        setAboutImagePreview(next.aboutImage || "");
        toast.success("Preset applied");
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || "Failed to apply preset"),
      )
      .finally(() => setPresetLoading(false));
  };

  const deleteThemePreset = (id) => {
    setPresetLoading(true);
    api
      .delete(`/admin/theme-presets/${id}`)
      .then(() => {
        toast.success("Preset deleted");
        fetchThemePresets();
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || "Failed to delete preset"),
      )
      .finally(() => setPresetLoading(false));
  };

  const exportTheme = () => {
    const blob = new Blob([JSON.stringify(form, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${form.cafeName || "restaurant"}-theme.json`.replaceAll(
      " ",
      "-",
    );
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Theme exported");
  };

  const previewProps = useMemo(
    () => ({
      form,
      logoPreview,
      heroImagePreview,
      aboutImagePreview,
      activeSection,
    }),
    [form, logoPreview, heroImagePreview, aboutImagePreview, activeSection],
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5ef]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full animate-spin border-amber-200 border-t-amber-600" />
          <p className="text-sm font-bold tracking-widest uppercase text-slate-400">
            Loading Studio
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#f5f0e8]"
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      <style>{studioStyles}</style>

      <header className="relative overflow-hidden bg-[#111936] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #D4A853 0%, transparent 50%), radial-gradient(circle at 80% 20%, #4a90d9 0%, transparent 40%)",
          }}
        />
        <div className="relative z-10 mx-auto flex max-w-[1700px] flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-amber-400">
                ✦ Restaurant Website Studio
              </span>
            </div>
            <h1 className="fraunces mb-3 text-3xl font-black leading-[1] tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
              Website Studio
              <span className="block mt-1 text-xl italic font-normal text-amber-400/80 sm:text-2xl lg:text-3xl">
                for {form.cafeName || "Your Restaurant"}
              </span>
            </h1>
            <p className="max-w-xl text-sm font-medium leading-relaxed text-white/50">
              Craft your restaurant website — brand identity, navbar, menu
              cards, dividers, typography, bill and presets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 p-1 border rounded-2xl border-white/10 bg-white/5">
              <button
                type="button"
                onClick={() => setPreviewMode("desktop")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${previewMode === "desktop" ? "bg-white text-[#111936]" : "text-white/60 hover:text-white"}`}
              >
                <Monitor size={14} /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("mobile")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${previewMode === "mobile" ? "bg-white text-[#111936]" : "text-white/60 hover:text-white"}`}
              >
                <Smartphone size={14} /> Mobile
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMobilePreviewOpen(true)}
              className="flex items-center gap-2 px-5 py-3 text-sm font-black text-white border rounded-2xl border-white/10 bg-white/10 lg:hidden"
            >
              <Eye size={15} /> Preview
            </button>

            <button
              type="button"
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-black text-[#111936] transition hover:bg-amber-300 disabled:opacity-60 sm:px-6"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </header>

      <div className="sticky top-[80px] z-40 px-2 py-3 border-b shadow-sm border-amber-100 bg-white/95 backdrop-blur-xl sm:px-4">
        <div className="mx-auto flex max-w-[1700px] items-center gap-2">
          <button
            type="button"
            onClick={() => scrollSectionNav("left")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-100 bg-white text-[#111936] shadow-sm transition hover:bg-amber-50"
            aria-label="Scroll sections left"
          >
            ‹
          </button>

          <div className="relative flex-1 min-w-0">
            <div className="absolute top-0 left-0 z-10 w-8 h-full pointer-events-none bg-gradient-to-r from-white/95 to-transparent" />
            <div className="absolute top-0 right-0 z-10 w-8 h-full pointer-events-none bg-gradient-to-l from-white/95 to-transparent" />

            <div
              ref={navScrollRef}
              className="flex gap-2 px-2 pb-1 overflow-x-auto admin-section-scroll scroll-smooth"
            >
              {NAV_SECTIONS.map(({ id, label, icon: Icon, badge }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToSection(id)}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2.5 text-xs font-black transition sm:px-4 ${
                    activeSection === id
                      ? "bg-[#111936] text-amber-400 shadow-sm"
                      : "bg-amber-50 text-slate-600 hover:bg-amber-100"
                  }`}
                >
                  <Icon size={13} />
                  <span className="whitespace-nowrap">{label}</span>
                  {badge && (
                    <span className="rounded-full bg-amber-200 px-1.5 py-0.5 text-[8px] font-black uppercase text-amber-800">
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => scrollSectionNav("right")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-100 bg-[#111936] text-amber-400 shadow-sm transition hover:bg-[#1c274f]"
            aria-label="Scroll sections right"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1700px] items-start gap-6 px-3 sm:px-4 lg:px-6">
        <main className="flex-1 min-w-0">
          <form
            onSubmit={saveSettings}
            className="max-w-5xl pt-4 mx-auto space-y-6 pb-28 sm:pt-6 lg:pt-8"
          >
            <MobileActivePreview {...previewProps} previewMode={previewMode} />

            <SectionWrap
              id="identity"
              title="Restaurant Identity"
              sub="Your café public face — name, logo, contact, and hours"
              icon={<Store size={18} />}
              activeSection={activeSection}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField
                  label="Café Name"
                  name="cafeName"
                  value={form.cafeName}
                  onChange={handleChange}
                  icon={<Building2 size={15} />}
                  placeholder="The White House Café"
                  required
                />
                <InputField
                  label="GST Number"
                  name="gstNumber"
                  value={form.gstNumber}
                  onChange={handleChange}
                  icon={<FileText size={15} />}
                  placeholder="GSTIN optional"
                />
                <InputField
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  icon={<Phone size={15} />}
                  placeholder="+91 98765 43210"
                />
                <InputField
                  label="Email Address"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  icon={<Mail size={15} />}
                  placeholder="cafe@example.com"
                />
              </div>
              <InputField
                label="Opening Hours"
                name="openingHours"
                value={form.openingHours}
                onChange={handleChange}
                icon={<Clock size={15} />}
                placeholder="10:00 AM – 11:00 PM · Mon–Sun"
              />
              <TextareaField
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                icon={<MapPin size={15} />}
                placeholder="Full restaurant address..."
                rows={3}
              />

              <ImageUploader
                label="Logo"
                value={form.logo}
                preview={logoPreview}
                inputRef={logoInputRef}
                onUrlChange={(value) => {
                  setField("logo", value);
                  setLogoPreview(value);
                }}
                onUpload={(file) =>
                  handleFileUpload(file, "logo", setLogoPreview)
                }
                onClear={() => {
                  setLogoPreview("");
                  setField("logo", "");
                }}
              />
            </SectionWrap>

            {/* TOP WEBSITE STRUCTURE: Header first */}
            <SectionWrap
              id="navbar"
              title="Navbar"
              sub="Layout, logo position, colors, buttons, mobile menu and bottom accent line"
              icon={<Layout size={18} />}
              activeSection={activeSection}
            >
              <PreviewFocusNote text="Live preview is showing navbar only while editing this section." />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectField
                  label="Navbar Layout"
                  name="navbarLayout"
                  value={form.navbarLayout}
                  onChange={handleChange}
                  icon={<Layout size={15} />}
                  options={[
                    { v: "logoLeft", l: "Logo Left" },
                    { v: "logoCentered", l: "Logo Centered" },
                    { v: "logoRight", l: "Logo Right" },
                  ]}
                />

                <SelectField
                  label="Logo Position"
                  name="logoPosition"
                  value={form.logoPosition}
                  onChange={handleChange}
                  icon={<Move size={15} />}
                  options={[
                    { v: "left", l: "Left" },
                    { v: "center", l: "Center" },
                    { v: "right", l: "Right" },
                  ]}
                />
                <SelectField
                  label="Button Style"
                  name="navbarButtonStyle"
                  value={form.navbarButtonStyle}
                  onChange={handleChange}
                  icon={<Zap size={15} />}
                  options={[
                    { v: "filled", l: "Filled" },
                    { v: "outline", l: "Outline" },
                    { v: "ghost", l: "Ghost" },
                    { v: "pill", l: "Pill" },
                  ]}
                />
                <SelectField
                  label="Mobile Menu Style"
                  name="mobileMenuStyle"
                  value={form.mobileMenuStyle}
                  onChange={handleChange}
                  icon={<Smartphone size={15} />}
                  options={[
                    { v: "slide", l: "Slide In" },
                    { v: "fullscreen", l: "Fullscreen" },
                    { v: "dropdown", l: "Dropdown" },
                  ]}
                />
                <SliderField
                  label="Navbar Height"
                  value={form.navbarHeight}
                  min={56}
                  max={100}
                  unit="px"
                  onChange={(v) => setField("navbarHeight", v)}
                />
                <SliderField
                  label="Navbar Radius"
                  value={form.navRounded}
                  min={0}
                  max={32}
                  unit="px"
                  onChange={(v) => setField("navRounded", v)}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ToggleField
                  label="Sticky Navbar"
                  value={form.stickyNavbar}
                  onChange={() => setField("stickyNavbar", !form.stickyNavbar)}
                  helper="Navbar stays at top while scrolling"
                />
                <ToggleField
                  label="Transparent Navbar"
                  value={form.transparentNavbar}
                  onChange={() =>
                    setField("transparentNavbar", !form.transparentNavbar)
                  }
                  helper="Hero section blends with navbar"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <ColorPickerField
                  label="Navbar Bg"
                  value={form.navbarBgColor}
                  onChange={(v) => setField("navbarBgColor", v)}
                />
                <ColorPickerField
                  label="Navbar Text"
                  value={form.navbarTextColor}
                  onChange={(v) => setField("navbarTextColor", v)}
                />
                <ColorPickerField
                  label="Active Link"
                  value={form.navbarActiveLinkColor}
                  onChange={(v) => setField("navbarActiveLinkColor", v)}
                />
              </div>
              <div className="space-y-4 rounded-2xl border border-amber-100 bg-[#fffdf7] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                  Navbar Bottom Line
                </p>
                <ToggleField
                  label="Show Bottom Line"
                  value={form.navbarBottomLine}
                  onChange={() =>
                    setField("navbarBottomLine", !form.navbarBottomLine)
                  }
                  helper="Small premium line below navbar"
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <SelectField
                    label="Line Style"
                    name="navbarBottomLineStyle"
                    value={form.navbarBottomLineStyle}
                    onChange={handleChange}
                    icon={<Minus size={15} />}
                    options={[
                      { v: "gradient", l: "Gradient" },
                      { v: "solid", l: "Solid" },
                      { v: "soft", l: "Soft Glow" },
                    ]}
                  />
                  <SliderField
                    label="Line Height"
                    value={form.navbarBottomLineHeight}
                    min={1}
                    max={8}
                    unit="px"
                    onChange={(v) => setField("navbarBottomLineHeight", v)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <ColorPickerField
                    label="Line Color 1"
                    value={form.navbarBottomLineColor1}
                    onChange={(v) => setField("navbarBottomLineColor1", v)}
                  />
                  <ColorPickerField
                    label="Line Color 2"
                    value={form.navbarBottomLineColor2}
                    onChange={(v) => setField("navbarBottomLineColor2", v)}
                  />
                  <ColorPickerField
                    label="Line Color 3"
                    value={form.navbarBottomLineColor3}
                    onChange={(v) => setField("navbarBottomLineColor3", v)}
                  />
                </div>
                <NavbarBottomLine form={form} />
              </div>
            </SectionWrap>

            {/* TOP WEBSITE STRUCTURE: Footer second */}
            <SectionWrap
              id="footer"
              title="Footer"
              sub="Footer branding, colors, contact details, newsletter and powered by section"
              icon={<AlignLeft size={18} />}
              activeSection={activeSection}
            >
              <div className="rounded-[28px] border border-amber-200/70 bg-gradient-to-br from-[#fffaf0] via-white to-[#f7ead2] p-5 shadow-[0_20px_55px_rgba(61,31,0,0.07)]">
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-amber-700">
                  Footer Content
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    label="Footer Brand Name"
                    name="footerBrandName"
                    value={form.footerBrandName}
                    onChange={handleChange}
                    icon={<Type size={15} />}
                    placeholder="The White House Café"
                  />

                  <InputField
                    label="Small Brand Text"
                    name="footerBrandSmall"
                    value={form.footerBrandSmall}
                    onChange={handleChange}
                    icon={<Coffee size={15} />}
                    placeholder="Café"
                  />

                  <TextareaField
                    label="Footer Tagline"
                    name="footerTagline"
                    value={form.footerTagline}
                    onChange={handleChange}
                    icon={<AlignLeft size={15} />}
                    rows={3}
                    placeholder="A modern dining experience where craft meets warmth..."
                  />

                  <InputField
                    label="Footer Address"
                    name="footerAddress"
                    value={form.footerAddress}
                    onChange={handleChange}
                    icon={<MapPin size={15} />}
                    placeholder="Khatipura, Near Lal Mandir Road, Jaipur"
                  />

                  <InputField
                    label="Footer Hours"
                    name="footerHours"
                    value={form.footerHours}
                    onChange={handleChange}
                    icon={<Clock size={15} />}
                    placeholder="10:00 AM – 11:00 PM · Daily"
                  />

                  <InputField
                    label="Copyright Text"
                    name="footerCopyright"
                    value={form.footerCopyright}
                    onChange={handleChange}
                    icon={<FileText size={15} />}
                    placeholder="© 2026 The White House Café · All rights reserved."
                  />
                </div>
              </div>

              <div className="rounded-[28px] border border-orange-200/70 bg-gradient-to-br from-[#fff9f2] via-white to-[#f8ead8] p-5 shadow-[0_20px_55px_rgba(180,83,9,0.06)]">
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-orange-700">
                  Footer Sections
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    label="Navigate Heading"
                    name="footerNavigateTitle"
                    value={form.footerNavigateTitle}
                    onChange={handleChange}
                    icon={<AlignLeft size={15} />}
                    placeholder="Navigate"
                  />

                  <InputField
                    label="Reach Heading"
                    name="footerReachTitle"
                    value={form.footerReachTitle}
                    onChange={handleChange}
                    icon={<Phone size={15} />}
                    placeholder="Reach Us"
                  />

                  <InputField
                    label="Newsletter Heading"
                    name="footerNewsletterTitle"
                    value={form.footerNewsletterTitle}
                    onChange={handleChange}
                    icon={<Mail size={15} />}
                    placeholder="Stay Updated"
                  />

                  <TextareaField
                    label="Newsletter Text"
                    name="footerNewsletterText"
                    value={form.footerNewsletterText}
                    onChange={handleChange}
                    icon={<AlignLeft size={15} />}
                    rows={3}
                    placeholder="Get notified about seasonal menus and offers..."
                  />

                  <InputField
                    label="Newsletter Placeholder"
                    name="footerNewsletterPlaceholder"
                    value={form.footerNewsletterPlaceholder}
                    onChange={handleChange}
                    icon={<Mail size={15} />}
                    placeholder="your@email.com"
                  />

                  <InputField
                    label="Newsletter Button"
                    name="footerNewsletterButton"
                    value={form.footerNewsletterButton}
                    onChange={handleChange}
                    icon={<Send size={15} />}
                    placeholder="Subscribe →"
                  />

                  <InputField
                    label="Footer Badge Text"
                    name="footerBadgeText"
                    value={form.footerBadgeText}
                    onChange={handleChange}
                    icon={<Clock size={15} />}
                    placeholder="Open now · Closes at 11 PM"
                  />
                </div>
              </div>

              <div className="rounded-[28px] border border-emerald-200/70 bg-gradient-to-br from-[#f7fff9] via-white to-[#e8fff1] p-5 shadow-[0_20px_55px_rgba(6,95,70,0.06)]">
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-emerald-700">
                  Powered By Section
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    label="Powered Text"
                    name="footerPoweredText"
                    value={form.footerPoweredText}
                    onChange={handleChange}
                    icon={<Zap size={15} />}
                    placeholder="Powered by"
                  />

                  <InputField
                    label="Powered Brand"
                    name="footerPoweredBrand"
                    value={form.footerPoweredBrand}
                    onChange={handleChange}
                    icon={<Zap size={15} />}
                    placeholder="FoodDash"
                  />
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff] p-5 shadow-[0_20px_55px_rgba(15,23,42,0.05)]">
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-slate-600">
                  Footer Colors
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  <ColorPickerField
                    label="Background"
                    value={form.footerBgColor}
                    onChange={(v) => setField("footerBgColor", v)}
                  />

                  <ColorPickerField
                    label="Heading Color"
                    value={form.footerHeadingColor}
                    onChange={(v) => setField("footerHeadingColor", v)}
                  />

                  <ColorPickerField
                    label="Text Color"
                    value={form.footerTextColor}
                    onChange={(v) => setField("footerTextColor", v)}
                  />

                  <ColorPickerField
                    label="Accent Color"
                    value={form.footerAccentColor}
                    onChange={(v) => setField("footerAccentColor", v)}
                  />

                  <ColorPickerField
                    label="Card Background"
                    value={form.footerCardBg}
                    onChange={(v) => setField("footerCardBg", v)}
                  />

                  <ColorPickerField
                    label="Border Color"
                    value={form.footerBorderColor}
                    onChange={(v) => setField("footerBorderColor", v)}
                  />
                </div>
              </div>
            </SectionWrap>

            <div className="p-6 bg-white border shadow-sm rounded-3xl border-slate-200">
              <h2 className="text-xl font-black text-slate-900">
                Payment Settings
              </h2>

              <p className="mt-1 text-sm font-semibold text-slate-400">
                Add this restaurant's Razorpay keys. Customer money will go
                directly to this restaurant.
              </p>

              <label className="flex items-center gap-3 mt-5">
                <input
                  type="checkbox"
                  checked={form.razorpayEnabled}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      razorpayEnabled: e.target.checked,
                    })
                  }
                />

                <span className="text-sm font-bold text-slate-700">
                  Enable Online Payment
                </span>
              </label>

              <div className="grid gap-4 mt-5 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-xs font-black tracking-widest uppercase text-slate-500">
                    Mode
                  </label>

                  <select
                    value={form.razorpayMode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        razorpayMode: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 text-sm font-bold border outline-none rounded-2xl border-slate-200"
                  >
                    <option value="test">Test</option>
                    <option value="live">Live</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-xs font-black tracking-widest uppercase text-slate-500">
                    Razorpay Key ID
                  </label>

                  <input
                    value={form.razorpayKeyId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        razorpayKeyId: e.target.value,
                      })
                    }
                    placeholder="rzp_test_xxxxx"
                    className="w-full px-4 py-3 text-sm font-bold border outline-none rounded-2xl border-slate-200"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 text-xs font-black tracking-widest uppercase text-slate-500">
                    Razorpay Key Secret
                  </label>

                  <input
                    type="password"
                    value={form.razorpayKeySecret}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        razorpayKeySecret: e.target.value,
                      })
                    }
                    placeholder="Enter Razorpay secret"
                    className="w-full px-4 py-3 text-sm font-bold border outline-none rounded-2xl border-slate-200"
                  />
                </div>
              </div>
            </div>

            <SectionWrap
              id="homepage"
              title="Homepage"
              sub="Hero, intro curtain, CTA, journey, specials and homepage text"
              icon={<Home size={18} />}
              activeSection={activeSection}
            >
              <div className="rounded-2xl border border-amber-100 bg-[#fffdf7] p-4">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Hero Section
                </p>

                <InputField
                  label="Hero Eyebrow"
                  name="heroEyebrow"
                  value={form.heroEyebrow}
                  onChange={handleChange}
                  icon={<Sparkles size={15} />}
                  placeholder="Jaipur’s warm café corner"
                />

                <TextareaField
                  label="Hero Main Text"
                  name="heroHeading"
                  value={form.heroHeading}
                  onChange={handleChange}
                  icon={<Type size={15} />}
                  placeholder="A premium café space for rich coffee..."
                  rows={3}
                />

                <InputField
                  label="Hero Small Line"
                  name="heroSubtitle"
                  value={form.heroSubtitle}
                  onChange={handleChange}
                  icon={<AlignLeft size={15} />}
                  placeholder="Coffee • Plates • Quiet Talks"
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    label="Main Button Text"
                    name="ctaText"
                    value={form.ctaText}
                    onChange={handleChange}
                    icon={<ArrowRight size={15} />}
                    placeholder="Explore Café Menu"
                  />

                  <InputField
                    label="Secondary CTA Text"
                    name="secondaryCtaText"
                    value={form.secondaryCtaText}
                    onChange={handleChange}
                    icon={<ScanLine size={15} />}
                    placeholder="Scan. Choose. Relax."
                  />
                </div>

                <ImageUploader
                  label="Hero Background Image"
                  value={form.heroImage}
                  preview={heroImagePreview}
                  inputRef={heroInputRef}
                  wide
                  onUrlChange={(value) => {
                    setField("heroImage", value);
                    setHeroImagePreview(value);
                  }}
                  onUpload={(file) =>
                    handleFileUpload(file, "heroImage", setHeroImagePreview)
                  }
                  onClear={() => {
                    setHeroImagePreview("");
                    setField("heroImage", "");
                  }}
                />
              </div>

              <div className="rounded-2xl border border-amber-100 bg-[#fffdf7] p-4">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Opening Curtain Animation
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    label="Intro Welcome Text"
                    name="introWelcomeText"
                    value={form.introWelcomeText}
                    onChange={handleChange}
                    icon={<Sparkles size={15} />}
                    placeholder="Welcome to"
                  />

                  <InputField
                    label="Intro Main Word"
                    name="introMainWord"
                    value={form.introMainWord}
                    onChange={handleChange}
                    icon={<Type size={15} />}
                    placeholder="Elegance."
                  />
                </div>

                <InputField
                  label="Intro Tagline"
                  name="introTagline"
                  value={form.introTagline}
                  onChange={handleChange}
                  icon={<AlignLeft size={15} />}
                  placeholder="Coffee • Plates • Quiet Talks"
                />

                <ToggleField
                  label="Homepage Animations"
                  value={form.homepageAnimation}
                  onChange={() =>
                    setField("homepageAnimation", !form.homepageAnimation)
                  }
                  helper="Enable cinematic opening animation and scroll reveals"
                />
              </div>

              <div className="p-4 mt-5 bg-white border rounded-2xl border-amber-100">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Hero Design Colors
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[
                    ["Hero Primary Color", "heroPrimaryColor", "#3d2412"],
                    ["Hero Secondary Color", "heroSecondaryColor", "#4a220e"],
                    ["Hero Accent Color", "heroAccentColor", "#d97706"],
                    ["Hero Background Color", "heroBgColor", "#f5ead7"],
                    ["Hero Text Color", "heroTextColor", "#241309"],
                    ["Hero Muted Text Color", "heroMutedTextColor", "#6b5a48"],
                    ["Hero Button Color", "heroButtonColor", "#14532d"],
                    [
                      "Hero Button Text Color",
                      "heroButtonTextColor",
                      "#ffffff",
                    ],
                    ["Hero Card Background", "heroCardBgColor", "#fffaf1"],
                  ].map(([label, name, placeholder]) => (
                    <div key={name}>
                      <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                        <Palette size={15} />
                        {label}
                      </label>

                      <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-white px-3 py-2.5 shadow-sm">
                        <input
                          type="color"
                          value={form[name] || placeholder}
                          onChange={(e) => setField(name, e.target.value)}
                          className="w-12 h-10 p-1 bg-transparent border cursor-pointer rounded-xl border-slate-200"
                        />

                        <input
                          type="text"
                          name={name}
                          value={form[name] || ""}
                          onChange={handleChange}
                          placeholder={placeholder}
                          className="flex-1 min-w-0 text-sm font-bold bg-transparent outline-none text-slate-700 placeholder:text-slate-300"
                        />

                        <span
                          className="w-8 h-8 border rounded-full shadow-inner shrink-0 border-slate-200"
                          style={{ background: form[name] || placeholder }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-[#fffdf7] p-4">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Hero Café Card
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    label="Card Title"
                    name="heroCardTitle"
                    value={form.heroCardTitle}
                    onChange={handleChange}
                    icon={<Type size={15} />}
                    placeholder="Your Table"
                  />

                  <InputField
                    label="Card Highlight"
                    name="heroCardHighlight"
                    value={form.heroCardHighlight}
                    onChange={handleChange}
                    icon={<Sparkles size={15} />}
                    placeholder="Awaits."
                  />

                  <InputField
                    label="Stat 1 Label"
                    name="heroStat1Label"
                    value={form.heroStat1Label}
                    onChange={handleChange}
                    icon={<Tag size={15} />}
                    placeholder="Open"
                  />

                  <InputField
                    label="Stat 1 Value"
                    name="heroStat1Value"
                    value={form.heroStat1Value}
                    onChange={handleChange}
                    icon={<Clock size={15} />}
                    placeholder="10 AM"
                  />

                  <InputField
                    label="Stat 2 Label"
                    name="heroStat2Label"
                    value={form.heroStat2Label}
                    onChange={handleChange}
                    icon={<Tag size={15} />}
                    placeholder="Mood"
                  />

                  <InputField
                    label="Stat 2 Value"
                    name="heroStat2Value"
                    value={form.heroStat2Value}
                    onChange={handleChange}
                    icon={<Coffee size={15} />}
                    placeholder="Warm"
                  />

                  <InputField
                    label="Stat 3 Label"
                    name="heroStat3Label"
                    value={form.heroStat3Label}
                    onChange={handleChange}
                    icon={<Tag size={15} />}
                    placeholder="Table"
                  />

                  <InputField
                    label="Stat 3 Value"
                    name="heroStat3Value"
                    value={form.heroStat3Value}
                    onChange={handleChange}
                    icon={<QrCode size={15} />}
                    placeholder="QR"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    label="Hero Dish Emoji"
                    name="heroDishEmoji"
                    value={form.heroDishEmoji}
                    onChange={handleChange}
                    icon={<Utensils size={15} />}
                    placeholder="🍝"
                  />

                  <InputField
                    label="Hero Dish Name"
                    name="heroDishName"
                    value={form.heroDishName}
                    onChange={handleChange}
                    icon={<Utensils size={15} />}
                    placeholder="Creamy Alfredo Bowl"
                  />

                  <InputField
                    label="Hero Dish Tag 1"
                    name="heroDishTag1"
                    value={form.heroDishTag1}
                    onChange={handleChange}
                    icon={<Star size={15} />}
                    placeholder="Signature"
                  />

                  <InputField
                    label="Hero Dish Tag 2"
                    name="heroDishTag2"
                    value={form.heroDishTag2}
                    onChange={handleChange}
                    icon={<Star size={15} />}
                    placeholder="Today special"
                  />

                  <InputField
                    label="Hero Dish Price"
                    name="heroDishPrice"
                    value={form.heroDishPrice}
                    onChange={handleChange}
                    icon={<BadgePercent size={15} />}
                    placeholder="₹249"
                  />
                </div>

                <TextareaField
                  label="Hero Dish Description"
                  name="heroDishDesc"
                  value={form.heroDishDesc}
                  onChange={handleChange}
                  icon={<AlignLeft size={15} />}
                  placeholder="Rich, soft, warm, and made for long café conversations."
                  rows={2}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    label="QR Box Eyebrow"
                    name="qrBoxEyebrow"
                    value={form.qrBoxEyebrow}
                    onChange={handleChange}
                    icon={<QrCode size={15} />}
                    placeholder="Smooth QR ordering"
                  />

                  <InputField
                    label="QR Box Title"
                    name="qrBoxTitle"
                    value={form.qrBoxTitle}
                    onChange={handleChange}
                    icon={<QrCode size={15} />}
                    placeholder="Scan from table. Order without rush."
                  />
                </div>

                <TextareaField
                  label="QR Box Text"
                  name="qrBoxText"
                  value={form.qrBoxText}
                  onChange={handleChange}
                  icon={<AlignLeft size={15} />}
                  placeholder="Browse, add items, and send the order directly."
                  rows={2}
                />
              </div>

              <div className="rounded-2xl border border-amber-100 bg-[#fffdf7] p-4">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Homepage Sections Text
                </p>

                <InputField
                  label="Moments Eyebrow"
                  name="momentsEyebrow"
                  value={form.momentsEyebrow}
                  onChange={handleChange}
                  icon={<Sparkles size={15} />}
                  placeholder="More than a place to eat"
                />

                <TextareaField
                  label="Moments Title"
                  name="momentsTitle"
                  value={form.momentsTitle}
                  onChange={handleChange}
                  icon={<Type size={15} />}
                  placeholder="A café that feels slow, warm and memorable."
                  rows={2}
                />

                <TextareaField
                  label="Moments Subtitle"
                  name="momentsSubtitle"
                  value={form.momentsSubtitle}
                  onChange={handleChange}
                  icon={<AlignLeft size={15} />}
                  placeholder="Made for coffee after class..."
                  rows={3}
                />

                <InputField
                  label="Journey Eyebrow"
                  name="journeyEyebrow"
                  value={form.journeyEyebrow}
                  onChange={handleChange}
                  icon={<QrCode size={15} />}
                  placeholder="The table journey"
                />

                <TextareaField
                  label="Journey Title"
                  name="journeyTitle"
                  value={form.journeyTitle}
                  onChange={handleChange}
                  icon={<Type size={15} />}
                  placeholder="From first scan to last sip."
                  rows={2}
                />

                <TextareaField
                  label="Journey Subtitle"
                  name="journeySubtitle"
                  value={form.journeySubtitle}
                  onChange={handleChange}
                  icon={<AlignLeft size={15} />}
                  placeholder="A smooth café flow..."
                  rows={3}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    label="Specials Eyebrow"
                    name="specialsEyebrow"
                    value={form.specialsEyebrow}
                    onChange={handleChange}
                    icon={<Utensils size={15} />}
                    placeholder="Café favourites"
                  />

                  <InputField
                    label="Specials Title"
                    name="specialsTitle"
                    value={form.specialsTitle}
                    onChange={handleChange}
                    icon={<Coffee size={15} />}
                    placeholder="Golden bites, warm coffee."
                  />
                </div>

                <div className="rounded-[2rem] border border-amber-100 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-black text-[#3d2412]">
                    Specials Cards
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-stone-500">
                    Edit the 5 homepage special menu cards.
                  </p>

                  <div className="mt-6 space-y-5">
                    {(Array.isArray(form.homeSpecials) &&
                    form.homeSpecials.length
                      ? form.homeSpecials
                      : DEFAULT_HOME_SPECIALS
                    ).map((item, index) => (
                      <div
                        key={index}
                        className="rounded-[1.5rem] border border-amber-100 bg-[#fffaf1] p-4"
                      >
                        <h4 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-amber-700">
                          Special Card {index + 1}
                        </h4>

                        <div className="grid gap-4 md:grid-cols-2">
                          <input
                            type="text"
                            value={item.emoji || ""}
                            onChange={(e) => {
                              const updated = [...form.homeSpecials];
                              updated[index].emoji = e.target.value;
                              setForm({ ...form, homeSpecials: updated });
                            }}
                            placeholder="Emoji e.g. ☕"
                            className="px-4 py-3 text-sm font-semibold border outline-none rounded-xl border-amber-100"
                          />

                          <input
                            type="text"
                            value={item.tag || ""}
                            onChange={(e) => {
                              const updated = [...form.homeSpecials];
                              updated[index].tag = e.target.value;
                              setForm({ ...form, homeSpecials: updated });
                            }}
                            placeholder="Tag e.g. Most Loved"
                            className="px-4 py-3 text-sm font-semibold border outline-none rounded-xl border-amber-100"
                          />

                          <input
                            type="text"
                            value={item.name || ""}
                            onChange={(e) => {
                              const updated = [...form.homeSpecials];
                              updated[index].name = e.target.value;
                              setForm({ ...form, homeSpecials: updated });
                            }}
                            placeholder="Item Name"
                            className="px-4 py-3 text-sm font-semibold border outline-none rounded-xl border-amber-100 md:col-span-2"
                          />

                          <textarea
                            value={item.desc || ""}
                            onChange={(e) => {
                              const updated = [...form.homeSpecials];
                              updated[index].desc = e.target.value;
                              setForm({ ...form, homeSpecials: updated });
                            }}
                            placeholder="Description"
                            rows={3}
                            className="px-4 py-3 text-sm font-semibold border outline-none rounded-xl border-amber-100 md:col-span-2"
                          />

                          <input
                            type="text"
                            value={item.price || ""}
                            onChange={(e) => {
                              const updated = [...form.homeSpecials];
                              updated[index].price = e.target.value;
                              setForm({ ...form, homeSpecials: updated });
                            }}
                            placeholder="Price e.g. ₹50"
                            className="px-4 py-3 text-sm font-semibold border outline-none rounded-xl border-amber-100"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-[#fffdf7] p-4">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Editorial & Final CTA
                </p>

                <InputField
                  label="Editorial Eyebrow"
                  name="editorialEyebrow"
                  value={form.editorialEyebrow}
                  onChange={handleChange}
                  icon={<Sparkles size={15} />}
                  placeholder="The feeling"
                />

                <TextareaField
                  label="Editorial Title"
                  name="editorialTitle"
                  value={form.editorialTitle}
                  onChange={handleChange}
                  icon={<Type size={15} />}
                  placeholder="Designed for the moments between meals."
                  rows={2}
                />

                <TextareaField
                  label="Editorial Big Card Title"
                  name="editorialCardTitle"
                  value={form.editorialCardTitle}
                  onChange={handleChange}
                  icon={<Type size={15} />}
                  placeholder="Premium café mood without feeling too expensive."
                  rows={2}
                />

                <InputField
                  label="Editorial Big Card Background"
                  name="editorialCardBgColor"
                  value={form.editorialCardBgColor}
                  onChange={handleChange}
                  icon={<Palette size={15} />}
                  placeholder="#120d08"
                />

                <TextareaField
                  label="Editorial Big Card Text"
                  name="editorialCardText"
                  value={form.editorialCardText}
                  onChange={handleChange}
                  icon={<AlignLeft size={15} />}
                  placeholder="The White House Café should feel warm..."
                  rows={3}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    label="Final CTA Eyebrow"
                    name="homeCtaEyebrow"
                    value={form.homeCtaEyebrow}
                    onChange={handleChange}
                    icon={<Sparkles size={15} />}
                    placeholder="Ready for a warm table?"
                  />

                  <InputField
                    label="Final CTA Menu Button"
                    name="ctaMenuButtonText"
                    value={form.ctaMenuButtonText}
                    onChange={handleChange}
                    icon={<ArrowRight size={15} />}
                    placeholder="Explore Menu"
                  />

                  <InputField
                    label="Final CTA Visit Button"
                    name="ctaVisitButtonText"
                    value={form.ctaVisitButtonText}
                    onChange={handleChange}
                    icon={<MapPin size={15} />}
                    placeholder="Visit Café"
                  />
                </div>

                <TextareaField
                  label="Final CTA Heading"
                  name="homeCtaHeading"
                  value={form.homeCtaHeading}
                  onChange={handleChange}
                  icon={<Type size={15} />}
                  placeholder="Browse the café menu before your first sip."
                  rows={2}
                />

                <TextareaField
                  label="Final CTA Subtitle"
                  name="homeCtaSubtitle"
                  value={form.homeCtaSubtitle}
                  onChange={handleChange}
                  icon={<AlignLeft size={15} />}
                  placeholder="Explore our menu or scan your table QR..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectField
                  label="Homepage Layout"
                  name="homepageLayout"
                  value={form.homepageLayout}
                  onChange={handleChange}
                  icon={<Layout size={15} />}
                  options={[
                    { v: "centered", l: "Centered" },
                    { v: "split", l: "Split" },
                    { v: "magazine", l: "Magazine" },
                    { v: "minimal", l: "Minimal" },
                  ]}
                />

                <SelectField
                  label="Atmosphere Style"
                  name="atmosphereStyle"
                  value={form.atmosphereStyle}
                  onChange={handleChange}
                  icon={<Sparkles size={15} />}
                  options={[
                    { v: "warm", l: "Warm & Cozy" },
                    { v: "luxury", l: "Luxury" },
                    { v: "modern", l: "Modern" },
                    { v: "rustic", l: "Rustic" },
                  ]}
                />
              </div>

              <div className="p-4 border rounded-2xl border-amber-100">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Section Visibility
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["showHeroSection", "Hero Section"],
                    ["showMomentsSection", "Moments Section"],
                    ["showJourneySection", "Journey Section"],
                    ["showMarqueeSection", "Marquee Strip"],
                    ["showSpecialsSection", "Specials/Menu Section"],
                    ["showEditorialSection", "Editorial Section"],
                    ["showCtaSection", "CTA Section"],
                  ].map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center justify-between p-4 bg-white border shadow-sm rounded-2xl border-amber-100"
                    >
                      <span className="text-sm font-bold text-[#3d2412]">
                        {label}
                      </span>

                      <input
                        type="checkbox"
                        checked={!!form[key]}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            [key]: e.target.checked,
                          }))
                        }
                        className="w-5 h-5 accent-amber-600"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </SectionWrap>

            <SectionWrap
              id="menu"
              title="Menu Design"
              sub="Separate controls for customer Menu page, Menu Preview page, and future menu card designer"
              icon={<Utensils size={18} />}
              activeSection={activeSection}
            >
              {/* CUSTOMER MENU PAGE SETTINGS */}
              <div className="rounded-[28px] border border-amber-200/70 bg-gradient-to-br from-[#fffaf0] via-white to-[#f7ead2] p-5 shadow-[0_20px_55px_rgba(61,31,0,0.07)]">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-700">
                      Customer Ordering Page
                    </p>

                    <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#2b1609]">
                      Menu Page
                    </h3>

                    <p className="mt-1 max-w-xl text-sm font-medium leading-relaxed text-[#7c5b35]">
                      Controls the real QR ordering menu page where customers
                      add items to cart.
                    </p>
                  </div>

                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
                    Live
                  </span>
                </div>

                <ToggleField
                  label="Menu Page Animation"
                  value={form.menuAnimation}
                  onChange={() =>
                    setField("menuAnimation", !form.menuAnimation)
                  }
                  helper="Enable or disable the cinematic opening animation on the customer Menu page"
                />

                <div className="grid grid-cols-1 gap-4 mt-5 md:grid-cols-2">
                  <InputField
                    label="Menu Heading"
                    name="menuTitle"
                    value={form.menuTitle}
                    onChange={handleChange}
                    icon={<Type size={15} />}
                    placeholder="Menu"
                  />

                  <InputField
                    label="Intro Tagline"
                    name="menuIntroTagline"
                    value={form.menuIntroTagline}
                    onChange={handleChange}
                    icon={<Coffee size={15} />}
                    placeholder="Coffee • Plates • Quiet Talks"
                  />

                  <TextareaField
                    label="Menu Subtitle"
                    name="menuSubtitle"
                    value={form.menuSubtitle}
                    onChange={handleChange}
                    icon={<AlignLeft size={15} />}
                    placeholder="Browse our menu, add items to your cart..."
                    rows={3}
                  />

                  <ColorPickerField
                    label="Menu Background"
                    value={form.menuBgColor}
                    onChange={(v) => setField("menuBgColor", v)}
                  />

                  <ColorPickerField
                    label="Menu Heading Color"
                    value={form.menuTitleColor}
                    onChange={(v) => setField("menuTitleColor", v)}
                  />

                  <ColorPickerField
                    label="Menu Wrapper Card"
                    value={form.menuSectionCardBg}
                    onChange={(v) => setField("menuSectionCardBg", v)}
                  />
                </div>
              </div>

              {/* MENU PREVIEW PAGE SETTINGS */}
              <div className="rounded-[28px] border border-orange-200/70 bg-gradient-to-br from-[#fff9f2] via-white to-[#f7ead2] p-5 shadow-[0_20px_55px_rgba(180,83,9,0.07)]">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-700">
                      Public Browsing Page
                    </p>

                    <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#2b1609]">
                      Menu Preview Page
                    </h3>

                    <p className="mt-1 max-w-xl text-sm font-medium leading-relaxed text-[#7c5b35]">
                      Controls the public menu browsing page where customers can
                      view dishes before scanning.
                    </p>
                  </div>

                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
                    Live
                  </span>
                </div>

                <ToggleField
                  label="Menu Preview Animation"
                  value={form.menuPreviewAnimation}
                  onChange={() =>
                    setField("menuPreviewAnimation", !form.menuPreviewAnimation)
                  }
                  helper="Enable or disable the cinematic Menu Preview opening animation"
                />

                <div className="grid grid-cols-1 gap-4 mt-5 md:grid-cols-2">
                  <InputField
                    label="Small Top Text"
                    name="menuPreviewEyebrow"
                    value={form.menuPreviewEyebrow}
                    onChange={handleChange}
                    icon={<Sparkles size={15} />}
                    placeholder="• Explore Our •"
                  />

                  <InputField
                    label="Title First Line"
                    name="menuPreviewTitleTop"
                    value={form.menuPreviewTitleTop}
                    onChange={handleChange}
                    icon={<Type size={15} />}
                    placeholder="Menu"
                  />

                  <InputField
                    label="Title Second Line"
                    name="menuPreviewTitleBottom"
                    value={form.menuPreviewTitleBottom}
                    onChange={handleChange}
                    icon={<Type size={15} />}
                    placeholder="Preview"
                  />

                  <InputField
                    label="Intro Small Text"
                    name="menuPreviewIntroSmallText"
                    value={form.menuPreviewIntroSmallText}
                    onChange={handleChange}
                    icon={<Sparkles size={15} />}
                    placeholder="Painting the menu mood"
                  />

                  <InputField
                    label="Intro Bottom Text"
                    name="menuPreviewIntroBottomText"
                    value={form.menuPreviewIntroBottomText}
                    onChange={handleChange}
                    icon={<Coffee size={15} />}
                    placeholder="Fresh plates. Warm café mood."
                  />

                  <TextareaField
                    label="Menu Preview Subtitle"
                    name="menuPreviewSubtitle"
                    value={form.menuPreviewSubtitle}
                    onChange={handleChange}
                    icon={<AlignLeft size={15} />}
                    placeholder="Browse our curated café menu..."
                    rows={3}
                  />

                  <ColorPickerField
                    label="Preview Background"
                    value={form.menuPreviewBgColor}
                    onChange={(v) => setField("menuPreviewBgColor", v)}
                  />

                  <ColorPickerField
                    label="Preview Card Wrapper"
                    value={form.menuPreviewCardBg}
                    onChange={(v) => setField("menuPreviewCardBg", v)}
                  />

                  <ColorPickerField
                    label="Preview Title Color"
                    value={form.menuPreviewTitleColor}
                    onChange={(v) => setField("menuPreviewTitleColor", v)}
                  />
                </div>
              </div>

              {/* MENU CARD DESIGNER - COMING SOON */}
              <div className="rounded-[28px] border border-amber-200/70 bg-gradient-to-br from-[#fffaf0] via-white to-[#f7ead2] p-6 shadow-[0_22px_60px_rgba(61,31,0,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-700">
                      Advanced Studio
                    </p>

                    <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#2b1609]">
                      Menu Card Designer
                    </h3>

                    <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-[#7c5b35]">
                      Soon you will be able to customize card radius, image
                      shape, badge style, price layout, shadows, hover effects,
                      category filters and full menu card presets.
                    </p>
                  </div>

                  <span className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-800">
                    Coming Soon
                  </span>
                </div>
              </div>
            </SectionWrap>

            {/* <SectionWrap
              id="card"
              title="Card Designer"
              sub="Fine-tune every dimension and color of your menu cards"
              icon={<Grid3X3 size={18} />}
              activeSection={activeSection}
            >
              <div className="overflow-auto rounded-2xl border border-amber-100 bg-[#fffdf7] p-4">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Real Card Preview
                </p>
                <div className="flex min-w-max justify-center rounded-2xl bg-[#f5f0e8] p-6">
                  <DesignedMenuCard form={form} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SliderField
                  label="Card Width"
                  value={form.cardWidth}
                  min={240}
                  max={480}
                  unit="px"
                  onChange={(v) => setField("cardWidth", v)}
                />
                <SliderField
                  label="Card Height"
                  value={form.cardHeight}
                  min={300}
                  max={600}
                  unit="px"
                  onChange={(v) => setField("cardHeight", v)}
                />
                <SliderField
                  label="Border Radius"
                  value={form.cardBorderRadius}
                  min={0}
                  max={48}
                  unit="px"
                  onChange={(v) => setField("cardBorderRadius", v)}
                />
                <SliderField
                  label="Image Height"
                  value={form.cardImageHeight}
                  min={100}
                  max={320}
                  unit="px"
                  onChange={(v) => setField("cardImageHeight", v)}
                />
                <SliderField
                  label="Card Padding"
                  value={form.cardPadding}
                  min={8}
                  max={48}
                  unit="px"
                  onChange={(v) => setField("cardPadding", v)}
                />
                <SliderField
                  label="Shadow Intensity"
                  value={form.cardShadow}
                  min={0}
                  max={5}
                  unit="×"
                  onChange={(v) => setField("cardShadow", v)}
                />
                <SliderField
                  label="Border Thickness"
                  value={form.cardBorderThickness}
                  min={0}
                  max={4}
                  unit="px"
                  onChange={(v) => setField("cardBorderThickness", v)}
                />
                <SliderField
                  label="Button Radius"
                  value={form.cardButtonRadius}
                  min={0}
                  max={32}
                  unit="px"
                  onChange={(v) => setField("cardButtonRadius", v)}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                <ColorPickerField
                  label="Card Background"
                  value={form.cardBgColor}
                  onChange={(v) => setField("cardBgColor", v)}
                />
                <ColorPickerField
                  label="Card Text"
                  value={form.cardTextColor}
                  onChange={(v) => setField("cardTextColor", v)}
                />
                <ColorPickerField
                  label="Price Color"
                  value={form.cardPriceColor}
                  onChange={(v) => setField("cardPriceColor", v)}
                />
                <ColorPickerField
                  label="Badge Color"
                  value={form.cardBadgeColor}
                  onChange={(v) => setField("cardBadgeColor", v)}
                />
                <ColorPickerField
                  label="Button Color"
                  value={form.cardButtonColor}
                  onChange={(v) => setField("cardButtonColor", v)}
                />
                <ColorPickerField
                  label="Button Text"
                  value={form.cardButtonTextColor}
                  onChange={(v) => setField("cardButtonTextColor", v)}
                />
              </div>
            </SectionWrap> */}

            <SectionWrap
              id="branding"
              title="Branding & Colors"
              sub="Color palettes, custom pickers and brand identity"
              icon={<Palette size={18} />}
              activeSection={activeSection}
            >
              <div>
                <FieldLabel
                  icon={<Palette size={15} />}
                  label="Color Palette"
                />
                <div className="grid grid-cols-1 gap-3 mt-2 sm:grid-cols-2 md:grid-cols-3">
                  {Object.entries(COLOR_PALETTES).map(([key, p]) => (
                    <button
                      type="button"
                      key={key}
                      onClick={() => applyPalette(key)}
                      className={`palette-card rounded-2xl border-2 p-3 text-left ${form.colorPalette === key ? "selected border-amber-400" : "border-amber-100 bg-white"}`}
                    >
                      <div className="flex gap-1 mb-2">
                        {[p.primary, p.secondary, p.bg, p.accent].map(
                          (c, i) => (
                            <div
                              key={i}
                              className="flex-1 h-5 rounded-md"
                              style={{ background: c }}
                            />
                          ),
                        )}
                      </div>
                      <p className="text-xs font-black text-[#111936]">
                        {p.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                <ColorPickerField
                  label="Primary"
                  value={form.primaryColor}
                  onChange={(v) => setField("primaryColor", v)}
                />
                <ColorPickerField
                  label="Secondary"
                  value={form.secondaryColor}
                  onChange={(v) => setField("secondaryColor", v)}
                />
                <ColorPickerField
                  label="Background"
                  value={form.bgColor}
                  onChange={(v) => setField("bgColor", v)}
                />
                <ColorPickerField
                  label="Text"
                  value={form.textColor}
                  onChange={(v) => setField("textColor", v)}
                />
                <ColorPickerField
                  label="Card Bg"
                  value={form.cardBg}
                  onChange={(v) => setField("cardBg", v)}
                />
                <ColorPickerField
                  label="Button"
                  value={form.buttonColor}
                  onChange={(v) => setField("buttonColor", v)}
                />
                <ColorPickerField
                  label="Accent"
                  value={form.accentColor}
                  onChange={(v) => setField("accentColor", v)}
                />
              </div>
            </SectionWrap>

            <SectionWrap
              id="fonts"
              title="Fonts & Typography"
              sub="Global, heading, body and component font settings"
              icon={<Type size={18} />}
              activeSection={activeSection}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectField
                  label="Global Font"
                  name="globalFont"
                  value={form.globalFont}
                  onChange={handleChange}
                  icon={<Type size={15} />}
                  options={fontOptions()}
                />
                <SelectField
                  label="Heading Font"
                  name="headingFont"
                  value={form.headingFont}
                  onChange={handleChange}
                  icon={<Type size={15} />}
                  options={fontOptions()}
                />
                <SelectField
                  label="Body Font"
                  name="bodyFont"
                  value={form.bodyFont}
                  onChange={handleChange}
                  icon={<AlignLeft size={15} />}
                  options={fontOptions()}
                />
                <SelectField
                  label="Navbar Font"
                  name="navbarFont"
                  value={form.navbarFont}
                  onChange={handleChange}
                  icon={<Layout size={15} />}
                  options={fontOptions()}
                />
                <SelectField
                  label="Menu Card Font"
                  name="menuCardFont"
                  value={form.menuCardFont}
                  onChange={handleChange}
                  icon={<Utensils size={15} />}
                  options={fontOptions()}
                />
                <SelectField
                  label="Button Font"
                  name="buttonFont"
                  value={form.buttonFont}
                  onChange={handleChange}
                  icon={<Zap size={15} />}
                  options={fontOptions()}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SliderField
                  label="Base Font Size"
                  value={form.baseFontSize}
                  min={12}
                  max={24}
                  unit="px"
                  onChange={(v) => setField("baseFontSize", v)}
                />
                <SelectField
                  label="Font Weight"
                  name="fontWeight"
                  value={form.fontWeight}
                  onChange={handleChange}
                  icon={<Type size={15} />}
                  options={[
                    { v: "300", l: "Light 300" },
                    { v: "400", l: "Regular 400" },
                    { v: "500", l: "Medium 500" },
                    { v: "600", l: "Semibold 600" },
                    { v: "700", l: "Bold 700" },
                    { v: "800", l: "ExtraBold 800" },
                  ]}
                />
              </div>
              <SelectField
                label="Letter Spacing"
                name="letterSpacing"
                value={form.letterSpacing}
                onChange={handleChange}
                icon={<Move size={15} />}
                options={[
                  { v: "0", l: "Normal" },
                  { v: "0.02em", l: "Slight" },
                  { v: "0.05em", l: "Loose" },
                  { v: "0.1em", l: "Wide" },
                  { v: "-0.02em", l: "Tight" },
                ]}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <ColorPickerField
                  label="Heading Color"
                  value={form.headingColor}
                  onChange={(v) => setField("headingColor", v)}
                />
                <ColorPickerField
                  label="Body Text"
                  value={form.bodyTextColor}
                  onChange={(v) => setField("bodyTextColor", v)}
                />
                <ColorPickerField
                  label="Button Text"
                  value={form.buttonTextColor}
                  onChange={(v) => setField("buttonTextColor", v)}
                />
              </div>
            </SectionWrap>

            <SectionWrap
              id="dividers"
              title="Dividers"
              sub="Section separators, ornaments and custom SVG dividers"
              icon={<Minus size={18} />}
              activeSection={activeSection}
            >
              <div>
                <FieldLabel icon={<Minus size={15} />} label="Divider Style" />
                <div className="grid grid-cols-1 gap-3 mt-2 sm:grid-cols-2 md:grid-cols-3">
                  {DIVIDER_PRESETS.map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => setField("dividerStyle", d.id)}
                      className={`preset-card rounded-2xl border-2 p-4 text-center ${form.dividerStyle === d.id ? "selected border-amber-400 bg-amber-50" : "border-amber-100 bg-white"}`}
                    >
                      <DividerPreview type={d.id} color={form.dividerColor} />
                      <p className="mt-2 text-xs font-bold text-slate-600">
                        {d.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <ColorPickerField
                  label="Divider Color"
                  value={form.dividerColor}
                  onChange={(v) => setField("dividerColor", v)}
                />
                <SliderField
                  label="Divider Height"
                  value={form.dividerHeight}
                  min={1}
                  max={20}
                  unit="px"
                  onChange={(v) => setField("dividerHeight", v)}
                />
                <SliderField
                  label="Divider Width"
                  value={form.dividerWidth}
                  min={20}
                  max={100}
                  unit="%"
                  onChange={(v) => setField("dividerWidth", v)}
                />
              </div>
              <div className="p-4 border rounded-2xl border-amber-100">
                <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  <Code2 size={13} /> Custom SVG Divider
                </p>
                <button
                  type="button"
                  onClick={() => svgInputRef.current?.click()}
                  className="flex flex-col items-center w-full gap-2 p-4 text-center upload-zone rounded-xl"
                >
                  <Upload size={18} className="text-amber-600" />
                  <span className="text-xs font-bold text-slate-500">
                    Upload SVG file
                  </span>
                </button>
                <input
                  ref={svgInputRef}
                  type="file"
                  accept=".svg,image/svg+xml"
                  className="hidden"
                  onChange={(e) => handleSvgUpload(e.target.files?.[0])}
                />
                <div className="mt-3">
                  <TextareaField
                    label="Or paste SVG code"
                    name="customSvgCode"
                    value={form.customSvgCode}
                    onChange={handleChange}
                    icon={<Code2 size={13} />}
                    placeholder="<svg xmlns=...>...</svg>"
                    rows={4}
                  />
                </div>
              </div>
            </SectionWrap>

            <SectionWrap
              id="about"
              title="About Page"
              sub="Story, founder message, imagery, colors and page animation"
              icon={<Info size={18} />}
              activeSection={activeSection}
            >
              <div className="rounded-[28px] border border-amber-200/70 bg-gradient-to-br from-[#fffaf0] via-white to-[#f7ead2] p-5 shadow-[0_20px_55px_rgba(61,31,0,0.07)]">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-700">
                      Café Story
                    </p>

                    <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#2b1609]">
                      About Page Content
                    </h3>

                    <p className="mt-1 max-w-xl text-sm font-medium leading-relaxed text-[#7c5b35]">
                      Manage the story, founder message, image and visual style
                      of your About page.
                    </p>
                  </div>

                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
                    Live
                  </span>
                </div>

                <ToggleField
                  label="About Page Animation"
                  value={form.aboutAnimation}
                  onChange={() =>
                    setField("aboutAnimation", !form.aboutAnimation)
                  }
                  helper="Enable or disable scroll animations on the About page"
                />

                <div className="grid grid-cols-1 gap-4 mt-5 md:grid-cols-2">
                  <InputField
                    label="Small Top Text"
                    name="aboutEyebrow"
                    value={form.aboutEyebrow}
                    onChange={handleChange}
                    icon={<Sparkles size={15} />}
                    placeholder="About The White House Café"
                  />

                  <InputField
                    label="Main Heading"
                    name="aboutHeading"
                    value={form.aboutHeading}
                    onChange={handleChange}
                    icon={<Type size={15} />}
                    placeholder="A warm café corner"
                  />

                  <InputField
                    label="Heading Highlight"
                    name="aboutHighlight"
                    value={form.aboutHighlight}
                    onChange={handleChange}
                    icon={<Type size={15} />}
                    placeholder="in the heart of Jaipur."
                  />

                  <InputField
                    label="Location"
                    name="aboutLocation"
                    value={form.aboutLocation}
                    onChange={handleChange}
                    icon={<MapPin size={15} />}
                    placeholder="Khatipura, Near Lal Mandir Road, Jaipur"
                  />
                </div>

                <TextareaField
                  label="About Content"
                  name="aboutContent"
                  value={form.aboutContent}
                  onChange={handleChange}
                  icon={<AlignLeft size={15} />}
                  placeholder="Tell your café's story..."
                  rows={5}
                />

                <TextareaField
                  label="Founder Message"
                  name="founderMessage"
                  value={form.founderMessage}
                  onChange={handleChange}
                  icon={<Coffee size={15} />}
                  placeholder="A personal note from the founder..."
                  rows={3}
                />

                <TextareaField
                  label="Story Section"
                  name="storySection"
                  value={form.storySection}
                  onChange={handleChange}
                  icon={<FileText size={15} />}
                  placeholder="How it all began..."
                  rows={3}
                />

                <ImageUploader
                  label="About Image"
                  value={form.aboutImage}
                  preview={aboutImagePreview}
                  inputRef={aboutInputRef}
                  wide
                  onUrlChange={(value) => {
                    setField("aboutImage", value);
                    setAboutImagePreview(value);
                  }}
                  onUpload={(file) =>
                    handleFileUpload(file, "aboutImage", setAboutImagePreview)
                  }
                  onClear={() => {
                    setAboutImagePreview("");
                    setField("aboutImage", "");
                  }}
                />
              </div>

              <div className="rounded-[28px] border border-orange-200/70 bg-gradient-to-br from-[#fff9f2] via-white to-[#f8ead8] p-5 shadow-[0_20px_55px_rgba(180,83,9,0.06)]">
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-orange-700">
                  About Page Colors
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  <ColorPickerField
                    label="Background"
                    value={form.aboutBgColor}
                    onChange={(v) => setField("aboutBgColor", v)}
                  />

                  <ColorPickerField
                    label="Text Color"
                    value={form.aboutTextColor}
                    onChange={(v) => setField("aboutTextColor", v)}
                  />

                  <ColorPickerField
                    label="Muted Text"
                    value={form.aboutMutedTextColor}
                    onChange={(v) => setField("aboutMutedTextColor", v)}
                  />

                  <ColorPickerField
                    label="Card Background"
                    value={form.aboutCardBg}
                    onChange={(v) => setField("aboutCardBg", v)}
                  />

                  <ColorPickerField
                    label="Section Background"
                    value={form.aboutSectionBg}
                    onChange={(v) => setField("aboutSectionBg", v)}
                  />

                  <ColorPickerField
                    label="Location Box"
                    value={form.aboutLocationBg}
                    onChange={(v) => setField("aboutLocationBg", v)}
                  />
                </div>

                <div className="mt-4">
                  <SliderField
                    label="Body Font Size"
                    value={form.aboutFontSize}
                    min={12}
                    max={24}
                    unit="px"
                    onChange={(v) => setField("aboutFontSize", v)}
                  />
                </div>
              </div>

              <div className="rounded-[28px] border border-emerald-200/70 bg-gradient-to-br from-[#f7fff9] via-white to-[#e8fff1] p-5 shadow-[0_20px_55px_rgba(6,95,70,0.06)]">
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-emerald-700">
                  People Behind It
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    label="Team Section Small Text"
                    name="aboutTeamEyebrow"
                    value={form.aboutTeamEyebrow}
                    onChange={handleChange}
                    icon={<Sparkles size={15} />}
                    placeholder="People behind it"
                  />

                  <InputField
                    label="Team Section Heading"
                    name="aboutTeamHeading"
                    value={form.aboutTeamHeading}
                    onChange={handleChange}
                    icon={<Type size={15} />}
                    placeholder="Made with care."
                  />

                  <InputField
                    label="Head Chef Name"
                    name="aboutChefName"
                    value={form.aboutChefName}
                    onChange={handleChange}
                    icon={<Coffee size={15} />}
                    placeholder="Chef xyz"
                  />

                  <InputField
                    label="Head Chef Note"
                    name="aboutChefNote"
                    value={form.aboutChefNote}
                    onChange={handleChange}
                    icon={<AlignLeft size={15} />}
                    placeholder="Crafting warm café plates with care."
                  />

                  <InputField
                    label="Owner / Manager Name"
                    name="aboutOwnerName"
                    value={form.aboutOwnerName}
                    onChange={handleChange}
                    icon={<Heart size={15} />}
                    placeholder="Yuvraj Singh"
                  />

                  <InputField
                    label="Owner / Manager Note"
                    name="aboutOwnerNote"
                    value={form.aboutOwnerNote}
                    onChange={handleChange}
                    icon={<AlignLeft size={15} />}
                    placeholder="Keeping the table experience smooth."
                  />

                  <InputField
                    label="Powered By Name"
                    name="aboutPoweredName"
                    value={form.aboutPoweredName}
                    onChange={handleChange}
                    icon={<QrCode size={15} />}
                    placeholder="FoodDash"
                  />

                  <InputField
                    label="Powered By Note"
                    name="aboutPoweredNote"
                    value={form.aboutPoweredNote}
                    onChange={handleChange}
                    icon={<AlignLeft size={15} />}
                    placeholder="Smart dining made simple."
                  />
                </div>
              </div>

              <div className="rounded-[28px] border border-purple-200/70 bg-gradient-to-br from-[#fffafc] via-white to-[#f1e8ff] p-6 shadow-[0_22px_60px_rgba(88,28,135,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-purple-700">
                      Advanced About Studio
                    </p>

                    <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#241309]">
                      More About Layouts
                    </h3>

                    <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-[#6b5478]">
                      Soon you will be able to choose founder card layouts,
                      timeline styles, team sections, image collage presets and
                      AI-generated café story sections.
                    </p>
                  </div>

                  <span className="rounded-full border border-purple-300 bg-purple-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-purple-800">
                    Coming Soon
                  </span>
                </div>
              </div>
            </SectionWrap>

            <SectionWrap
              id="contact"
              title="Contact Page"
              sub="Phone, email, WhatsApp, map and social links"
              icon={<PhoneCall size={18} />}
              activeSection={activeSection}
            >
              <ToggleField
                label="Contact Page Animation"
                value={form.contactAnimation}
                onChange={() =>
                  setField("contactAnimation", !form.contactAnimation)
                }
                helper="Enable or disable scroll animations on Contact page"
              />
              <InputField
                label="Contact Heading"
                name="contactHeading"
                value={form.contactHeading}
                onChange={handleChange}
                icon={<Type size={15} />}
                placeholder="Get In Touch"
              />

              <InputField
                label="Small Top Text"
                name="contactEyebrow"
                value={form.contactEyebrow}
                onChange={handleChange}
                icon={<Sparkles size={15} />}
                placeholder="• Get In Touch •"
              />

              <TextareaField
                label="Contact Subtitle"
                name="contactSubtitle"
                value={form.contactSubtitle}
                onChange={handleChange}
                icon={<AlignLeft size={15} />}
                placeholder="We'd love to hear from you..."
                rows={3}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField
                  label="Phone"
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={handleChange}
                  icon={<Phone size={15} />}
                  placeholder="+91 98765 43210"
                />
                <InputField
                  label="Email"
                  name="contactEmail"
                  value={form.contactEmail}
                  onChange={handleChange}
                  icon={<Mail size={15} />}
                  placeholder="hello@cafe.com"
                />
                <InputField
                  label="Address Title"
                  name="contactAddressTitle"
                  value={form.contactAddressTitle}
                  onChange={handleChange}
                  icon={<MapPin size={15} />}
                  placeholder="Khatipura, Near Lal Mandir Road"
                />

                <InputField
                  label="Address Subtitle"
                  name="contactAddressSubtitle"
                  value={form.contactAddressSubtitle}
                  onChange={handleChange}
                  icon={<MapPin size={15} />}
                  placeholder="Jaipur, Rajasthan 302012, India"
                />

                <InputField
                  label="Opening Timing"
                  name="contactTiming"
                  value={form.contactTiming}
                  onChange={handleChange}
                  icon={<Clock size={15} />}
                  placeholder="Mon – Sun, 9:00 AM – 10:00 PM"
                />

                <InputField
                  label="Hours Title"
                  name="contactHours"
                  value={form.contactHours}
                  onChange={handleChange}
                  icon={<Clock size={15} />}
                  placeholder="Daily · 9:00 AM – 10:00 PM"
                />

                <InputField
                  label="Hours Note"
                  name="contactHoursNote"
                  value={form.contactHoursNote}
                  onChange={handleChange}
                  icon={<Clock size={15} />}
                  placeholder="Come by for coffee, meals & memories."
                />

                <InputField
                  label="Map Direction URL"
                  name="mapDirectionUrl"
                  value={form.mapDirectionUrl}
                  onChange={handleChange}
                  icon={<NavigationIcon size={15} />}
                  placeholder="https://www.google.com/maps?q=Khatipura,Jaipur"
                />

                <InputField
                  label="WhatsApp Number"
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={handleChange}
                  icon={<MessageSquareIcon />}
                  placeholder="+91 98765 43210"
                />
                <InputField
                  label="Map Embed URL"
                  name="mapEmbedUrl"
                  value={form.mapEmbedUrl}
                  onChange={handleChange}
                  icon={<MapPin size={15} />}
                  placeholder="Google Maps embed URL"
                />
              </div>
              <div>
                <FieldLabel icon={<Globe size={15} />} label="Social Links" />
                <div className="grid grid-cols-1 gap-3 mt-2 md:grid-cols-2">
                  <InputField
                    label=""
                    name="instagram"
                    value={form.instagram}
                    onChange={handleChange}
                    icon={<Instagram size={15} />}
                    placeholder="Instagram URL"
                  />
                  <InputField
                    label=""
                    name="facebook"
                    value={form.facebook}
                    onChange={handleChange}
                    icon={<Facebook size={15} />}
                    placeholder="Facebook URL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectField
                  label="Contact Form Style"
                  name="contactFormStyle"
                  value={form.contactFormStyle}
                  onChange={handleChange}
                  icon={<FileText size={15} />}
                  options={[
                    { v: "minimal", l: "Minimal" },
                    { v: "card", l: "Card" },
                    { v: "floating", l: "Floating Labels" },
                    { v: "glassmorphism", l: "Glassmorphism" },
                  ]}
                />
                <ColorPickerField
                  label="Text Color"
                  value={form.contactTextColor}
                  onChange={(v) => setField("contactTextColor", v)}
                />

                <ColorPickerField
                  label="Accent Color"
                  value={form.contactAccentColor}
                  onChange={(v) => setField("contactAccentColor", v)}
                />

                <ColorPickerField
                  label="Muted Text"
                  value={form.contactMutedTextColor}
                  onChange={(v) => setField("contactMutedTextColor", v)}
                />

                <ColorPickerField
                  label="Card Background"
                  value={form.contactCardBg}
                  onChange={(v) => setField("contactCardBg", v)}
                />
                <ColorPickerField
                  label="Background"
                  value={form.contactBgColor}
                  onChange={(v) => setField("contactBgColor", v)}
                />
              </div>
            </SectionWrap>

            <SectionWrap
              id="bill"
              title="Bill & Receipt"
              sub="UPI, QR, receipt footer and print theme"
              icon={<Receipt size={18} />}
              activeSection={activeSection}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField
                  label="UPI ID"
                  name="upiId"
                  value={form.upiId}
                  onChange={handleChange}
                  icon={<Wallet size={15} />}
                  placeholder="cafe@upi"
                />
                <InputField
                  label="Payment Note"
                  name="paymentNote"
                  value={form.paymentNote}
                  onChange={handleChange}
                  icon={<CreditCard size={15} />}
                  placeholder="Pay at counter / Scan QR"
                />
              </div>
              <TextareaField
                label="Receipt Footer Message"
                name="receiptFooter"
                value={form.receiptFooter}
                onChange={handleChange}
                icon={<FileText size={15} />}
                placeholder="Thank you for dining with us."
                rows={3}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectField
                  label="Print Bill Theme"
                  name="printBillTheme"
                  value={form.printBillTheme}
                  onChange={handleChange}
                  icon={<Printer size={15} />}
                  options={[
                    { v: "classic", l: "Classic" },
                    { v: "modern", l: "Modern" },
                    { v: "minimal", l: "Minimal" },
                    { v: "luxury", l: "Luxury" },
                  ]}
                />
                <SelectField
                  label="Receipt Font Style"
                  name="receiptFontStyle"
                  value={form.receiptFontStyle}
                  onChange={handleChange}
                  icon={<Type size={15} />}
                  options={[
                    { v: "serif", l: "Serif" },
                    { v: "sans", l: "Sans-Serif" },
                    { v: "mono", l: "Monospace" },
                  ]}
                />
              </div>
              <ToggleField
                label="Show QR Code on Receipt"
                value={form.showQR}
                onChange={() => setField("showQR", !form.showQR)}
                helper="Displays UPI QR code on printed bill"
              />
            </SectionWrap>

            {/* ordering experience */}
            {/* <SectionWrap
              id="ordering"
              title="Ordering Experience"
              sub="Thank-you messages, feedback and session settings"
              icon={<ShoppingBag size={18} />}
              activeSection={activeSection}
            >
              <InputField
                label="Thank You Message"
                name="thankYouMessage"
                value={form.thankYouMessage}
                onChange={handleChange}
                icon={<MessageSquareIcon />}
                placeholder="Your order is being prepared with love!"
              />
              <InputField
                label="Order Status Text"
                name="orderStatusText"
                value={form.orderStatusText}
                onChange={handleChange}
                icon={<Clock size={15} />}
                placeholder="We're preparing your order..."
              />
              <TextareaField
                label="Session Expiry Message"
                name="sessionExpiryMessage"
                value={form.sessionExpiryMessage}
                onChange={handleChange}
                icon={<Shield size={15} />}
                placeholder="Your session has expired. Please scan again."
                rows={2}
              />
              <div className="space-y-3">
                <ToggleField
                  label="Feedback Popup"
                  value={form.feedbackPopup}
                  onChange={() =>
                    setField("feedbackPopup", !form.feedbackPopup)
                  }
                  helper="Show feedback prompt after order completion"
                />
                <ToggleField
                  label="Reward Coupon After Feedback"
                  value={form.rewardCoupon}
                  onChange={() => setField("rewardCoupon", !form.rewardCoupon)}
                  helper="Give discount coupon for completing feedback"
                />
              </div>
            </SectionWrap> */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="relative p-5 overflow-hidden border rounded-2xl border-amber-100 bg-amber-50/80">
                <div className="absolute right-4 top-4 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                  Coming Soon
                </div>

                <p className="text-sm font-black text-slate-800">
                  Feedback Popup
                </p>

                <p className="max-w-sm mt-2 text-xs font-semibold leading-5 text-slate-500">
                  Show feedback prompt after order completion.
                </p>
              </div>

              <div className="relative p-5 overflow-hidden border rounded-2xl border-amber-100 bg-amber-50/80">
                <div className="absolute right-4 top-4 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                  Coming Soon
                </div>

                <p className="text-sm font-black text-slate-800">
                  Reward Coupon After Feedback
                </p>

                <p className="max-w-sm mt-2 text-xs font-semibold leading-5 text-slate-500">
                  Give discount coupon for completing feedback.
                </p>
              </div>
            </div>

            <SectionWrap
              id="presets"
              title="Theme Presets"
              sub="Save the current full configuration with a name and apply it later"
              icon={<Sparkles size={18} />}
              activeSection={activeSection}
            >
              <div className="rounded-2xl border border-amber-100 bg-[#fffdf7] p-4">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Save Current Configuration
                </p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <InputField
                    label=""
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    icon={<Sparkles size={15} />}
                    placeholder="Preset name e.g. Diwali Theme"
                  />
                  <InputField
                    label=""
                    value={presetDescription}
                    onChange={(e) => setPresetDescription(e.target.value)}
                    icon={<AlignLeft size={15} />}
                    placeholder="Optional description"
                  />
                  <button
                    type="button"
                    onClick={saveThemePreset}
                    disabled={presetLoading}
                    className="h-11 rounded-2xl bg-[#111936] px-5 text-sm font-black text-amber-400 disabled:opacity-60"
                  >
                    {presetLoading ? "Saving..." : "Save Preset"}
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {themePresets.length === 0 ? (
                  <div className="p-6 text-center border border-dashed rounded-2xl border-amber-200 bg-amber-50">
                    <Sparkles className="mx-auto mb-2 text-amber-500" />
                    <p className="text-sm font-bold text-slate-600">
                      No presets saved yet.
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Create one after customizing the website.
                    </p>
                  </div>
                ) : (
                  themePresets.map((preset) => (
                    <div
                      key={preset._id}
                      className="flex flex-col gap-3 p-4 bg-white border rounded-2xl border-amber-100 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-black text-[#111936]">
                          {preset.name}
                        </p>
                        {preset.description && (
                          <p className="mt-1 text-xs font-medium text-slate-400">
                            {preset.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => applyThemePreset(preset._id)}
                          disabled={presetLoading}
                          className="rounded-xl bg-[#111936] px-4 py-2 text-xs font-black text-amber-400 disabled:opacity-60"
                        >
                          Apply
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteThemePreset(preset._id)}
                          disabled={presetLoading}
                          className="px-3 py-2 text-red-500 rounded-xl bg-red-50 disabled:opacity-60"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionWrap>

            {/* custom css */}
            {/* <SectionWrap
              id="advanced"
              title="Advanced"
              sub="Custom CSS, export/import and developer tools"
              icon={<Cpu size={18} />}
              activeSection={activeSection}
            >
              <TextareaField
                label="Custom CSS"
                name="customCSS"
                value={form.customCSS}
                onChange={handleChange}
                icon={<Code2 size={15} />}
                placeholder=""
                rows={8}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={exportTheme}
                  className="flex items-center justify-center gap-2 text-sm font-bold transition bg-white border h-11 rounded-2xl border-amber-200 text-slate-600 hover:bg-amber-50"
                >
                  <Download size={14} /> Export Theme
                </button>
                <button
                  type="button"
                  onClick={fetchSettings}
                  className="flex items-center justify-center gap-2 text-sm font-bold transition bg-white border h-11 rounded-2xl border-amber-200 text-slate-600 hover:bg-amber-50"
                >
                  <RefreshCw size={14} /> Reload
                </button>
                <button
                  type="button"
                  onClick={resetLocalForm}
                  className="flex items-center justify-center gap-2 text-sm font-bold text-red-500 transition border border-red-100 h-11 rounded-2xl bg-red-50 hover:bg-red-100"
                >
                  <RotateCcw size={14} /> Reset Local
                </button>
              </div>

           
            </SectionWrap> */}

            <SectionWrap
              id="advanced"
              title="Advanced"
              sub="Custom CSS, export/import and developer tools"
              icon={<Cpu size={18} />}
              activeSection={activeSection}
            >
              <div className="relative overflow-hidden rounded-[28px] border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-8 text-center shadow-sm">
                <div className="absolute w-32 h-32 rounded-full -right-10 -top-10 bg-amber-200/30 blur-3xl" />
                <div className="absolute rounded-full -bottom-12 -left-10 h-36 w-36 bg-orange-200/30 blur-3xl" />

                <div className="relative flex items-center justify-center w-16 h-16 mx-auto bg-white shadow-md rounded-2xl">
                  <Cpu size={28} className="text-amber-600" />
                </div>

                <div className="relative mt-5 inline-flex rounded-full border border-amber-200 bg-white px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-amber-700">
                  Coming Soon
                </div>

                <h3 className="relative mt-5 text-2xl font-black tracking-[-0.04em] text-slate-900">
                  Advanced Developer Tools
                </h3>

                <p className="relative max-w-xl mx-auto mt-3 text-sm font-semibold leading-7 text-slate-500">
                  Custom CSS, theme export/import, reset tools, and developer
                  controls will be available here in the next version.
                </p>
              </div>
            </SectionWrap>

            <SectionWrap
              id="ai"
              title="AI Theme Studio"
              sub="Generate complete themes with AI assistance"
              icon={<Wand2 size={18} />}
              activeSection={activeSection}
            >
              <div className="relative p-8 overflow-hidden text-center border rounded-2xl border-amber-200 bg-gradient-to-br from-amber-50 via-amber-100/50 to-orange-50">
                <Wand2 size={40} className="mx-auto mb-4 text-amber-500" />
                <h3 className="fraunces mb-2 text-2xl font-black text-[#111936]">
                  AI Theme Generator
                </h3>
                <p className="max-w-sm mx-auto mb-4 text-sm leading-relaxed text-slate-600">
                  Later, AI can generate safe theme JSON/config based on
                  restaurant style.
                </p>
                <button
                  type="button"
                  className="h-12 cursor-not-allowed rounded-2xl bg-[#111936] px-8 text-sm font-black text-amber-400 opacity-60"
                >
                  Coming Soon
                </button>
              </div>
            </SectionWrap>

            <div className="sticky z-20 flex gap-3 p-2 border shadow-xl bottom-4 rounded-2xl border-amber-100 bg-white/90 shadow-slate-900/10 backdrop-blur-xl sm:bottom-6">
              <button
                type="submit"
                disabled={saving}
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#111936] text-sm font-black text-amber-400 transition hover:bg-[#1c274f] disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {saving ? "Saving..." : "Save All Settings"}
              </button>
              <button
                type="button"
                onClick={() => setMobilePreviewOpen(true)}
                className="flex items-center justify-center gap-2 px-4 text-sm font-bold transition bg-white border-2 h-14 rounded-2xl border-amber-200 text-slate-600 hover:bg-amber-50 xl:hidden"
              >
                <Eye size={16} />
              </button>
              <button
                type="button"
                onClick={fetchSettings}
                disabled={saving}
                className="items-center justify-center hidden gap-2 px-6 text-sm font-bold transition bg-white border-2 h-14 rounded-2xl border-amber-200 text-slate-600 hover:bg-amber-50 disabled:opacity-60 sm:flex"
              >
                <RefreshCw size={16} /> Reload
              </button>
            </div>
          </form>
        </main>

        <aside className="sticky top-[76px] hidden h-[calc(100vh-88px)] w-[410px] shrink-0 overflow-y-auto rounded-l-[2rem] border border-amber-100 bg-white p-5 shadow-[0_24px_80px_rgba(17,25,54,0.10)] xl:block">
          <PreviewPanel
            {...previewProps}
            previewMode={previewMode}
            setPreviewMode={setPreviewMode}
          />
        </aside>
      </div>

      {mobilePreviewOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 p-3 backdrop-blur-sm xl:hidden">
          <div className="h-full p-4 overflow-y-auto bg-white rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
                  Live Preview
                </p>
                <h3 className="fraunces text-lg font-black text-[#111936]">
                  {sectionTitle(activeSection)} Preview
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMobilePreviewOpen(false)}
                className="flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>
            <PreviewPanel
              {...previewProps}
              previewMode={previewMode}
              setPreviewMode={setPreviewMode}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewPanel({
  form,
  logoPreview,
  heroImagePreview,
  aboutImagePreview,
  activeSection,
  previewMode,
  setPreviewMode,
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-600">
            Live Preview
          </p>
          <h3 className="fraunces mt-0.5 text-lg font-black text-[#111936]">
            Real Website Preview
          </h3>
        </div>

        <div className="flex items-center gap-1 p-1 border rounded-xl border-amber-100 bg-amber-50">
          <button
            type="button"
            onClick={() => setPreviewMode("desktop")}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
              previewMode === "desktop"
                ? "bg-[#111936] text-amber-400"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Monitor size={13} />
          </button>

          <button
            type="button"
            onClick={() => setPreviewMode("mobile")}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
              previewMode === "mobile"
                ? "bg-[#111936] text-amber-400"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Smartphone size={13} />
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm ${
          previewMode === "mobile" ? "mx-auto w-[280px]" : "w-full"
        }`}
      >
        <iframe
          title="Live Website Preview"
          src="/preview/home"
          className={`w-full border-0 bg-white ${
            previewMode === "mobile" ? "h-[560px]" : "h-[720px]"
          }`}
        />
      </div>
    </div>
  );
}

function MobileActivePreview(props) {
  return (
    <div className="xl:hidden">
      <div className="flex items-center justify-between p-3 mb-2 bg-white border rounded-2xl border-amber-100">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-600">
            Active Preview
          </p>
          <p className="fraunces text-base font-black text-[#111936]">
            {sectionTitle(props.activeSection)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("open-mobile-preview"))}
          className="hidden"
        />
        <Eye size={18} className="text-amber-600" />
      </div>
      <div className="p-3 overflow-hidden bg-white border rounded-2xl border-amber-100">
        <ActiveSectionPreview {...props} compact />
      </div>
    </div>
  );
}

function DesktopPreview(props) {
  return (
    <div
      className="overflow-hidden border rounded-2xl border-amber-100"
      style={{ fontSize: "10px" }}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 bg-slate-100">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 rounded-md bg-white px-3 py-1 text-[9px] font-medium text-slate-400">
          yourrestaurant.com
        </div>
      </div>
      <ActiveSectionPreview {...props} />
    </div>
  );
}

function MobilePreview(props) {
  return (
    <div className="mx-auto max-w-[280px] rounded-[34px] bg-[#1a1a1a] p-3 shadow-2xl">
      <div className="mx-auto mb-1 h-5 w-24 rounded-b-2xl bg-[#1a1a1a]" />
      <div className="max-h-[560px] overflow-y-auto rounded-[26px] bg-white">
        <ActiveSectionPreview {...props} compact />
      </div>
    </div>
  );
}

function ActiveSectionPreview({
  form,
  logoPreview,
  heroImagePreview,
  aboutImagePreview,
  activeSection,
  compact = false,
}) {
  const section = activeSection || "identity";

  return (
    <div
      style={{
        background: form.bgColor,
        color: form.textColor,
        fontFamily: fontFamily(form.bodyFont),
      }}
    >
      {section === "navbar" && (
        <div className="p-4 bg-[#f5f0e8]">
          <NavbarPreview form={form} logoPreview={logoPreview} />
        </div>
      )}
      {section === "identity" && (
        <IdentityPreview form={form} logoPreview={logoPreview} />
      )}
      {section === "homepage" && (
        <HomePreview
          form={form}
          heroImagePreview={heroImagePreview}
          compact={compact}
        />
      )}
      {(section === "menu" || section === "card") && (
        <MenuPreview form={form} compact={compact} />
      )}
      {section === "branding" && <BrandingPreview form={form} />}
      {section === "fonts" && <FontsPreview form={form} />}
      {section === "dividers" && <DividersFullPreview form={form} />}
      {section === "about" && (
        <AboutPreview form={form} aboutImagePreview={aboutImagePreview} />
      )}
      {section === "contact" && <ContactPreview form={form} />}
      {section === "footer" && <FooterPreview form={form} />}
      {section === "bill" && (
        <ReceiptPreview form={form} logoPreview={logoPreview} plain />
      )}
      {section === "ordering" && <OrderingPreview form={form} />}
      {section === "presets" && <PresetPreview form={form} />}
      {section === "advanced" && <AdvancedPreview form={form} />}
      {section === "ai" && <AiPreview form={form} />}
    </div>
  );
}

function NavbarPreview({ form, logoPreview }) {
  const logoPosition = form.logoPosition || "left";
  const layout = form.navbarLayout || "logoLeft";
  const reverse = layout === "logoRight" || logoPosition === "right";
  const centered = layout === "logoCentered" || logoPosition === "center";

  return (
    <div
      className="relative overflow-hidden border shadow-sm rounded-2xl border-amber-100"
      style={{
        background: form.navbarBgColor || "#fbf7ef",
        minHeight: "96px",
      }}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 ${centered ? "justify-center" : reverse ? "flex-row-reverse justify-between" : "justify-between"}`}
        style={{
          minHeight: Number(form.navbarHeight || 76),
          color: form.navbarTextColor,
          fontFamily: fontFamily(form.navbarFont),
        }}
      >
        <div className="flex items-center gap-2">
          {logoPreview ? (
            <img
              src={logoPreview}
              alt=""
              className="object-cover rounded-full h-9 w-9"
            />
          ) : (
            <div className="flex items-center justify-center font-black bg-white rounded-full h-9 w-9">
              {(form.cafeName || "W")[0]}
            </div>
          )}
          <div>
            <p className="text-[11px] font-black leading-none">
              {form.cafeName || "Café"}
            </p>
            <p
              style={{ color: form.navbarActiveLinkColor }}
              className="mt-1 text-[8px] font-black uppercase tracking-[0.18em]"
            >
              Café
            </p>
          </div>
        </div>
        {!centered && (
          <div className="hidden gap-2 sm:flex">
            {["Home", "Menu", "About"].map((x, i) => (
              <span
                key={x}
                className="rounded-lg px-2 py-1 text-[9px] font-black"
                style={{
                  background:
                    i === 1 ? form.navbarActiveLinkColor : "transparent",
                  color: i === 1 ? "#fff" : form.navbarTextColor,
                }}
              >
                {x}
              </span>
            ))}
          </div>
        )}
        <span
          className="rounded-lg px-3 py-1 text-[9px] font-black"
          style={{ background: form.buttonColor, color: form.buttonTextColor }}
        >
          My Order
        </span>
      </div>
      {form.navbarBottomLine !== false && <NavbarBottomLine form={form} />}
    </div>
  );
}

function NavbarBottomLine({ form }) {
  return (
    <div
      className="w-full rounded-full"
      style={{
        height: `${form.navbarBottomLineHeight || 2}px`,
        background:
          form.navbarBottomLineStyle === "solid"
            ? form.navbarBottomLineColor1 || "#d97707"
            : `linear-gradient(to right, ${form.navbarBottomLineColor1 || "#d97707"}, ${form.navbarBottomLineColor2 || "#e6b85c"}, ${form.navbarBottomLineColor3 || "#d97707"})`,
        boxShadow:
          form.navbarBottomLineStyle === "soft"
            ? `0 0 18px ${form.navbarBottomLineColor2 || "#e6b85c"}`
            : "none",
      }}
    />
  );
}

function IdentityPreview({ form, logoPreview }) {
  return (
    <div className="p-5 text-center">
      {logoPreview ? (
        <img
          src={logoPreview}
          alt=""
          className="object-cover w-16 h-16 mx-auto rounded-2xl"
        />
      ) : (
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#111936] text-xl font-black text-amber-400">
          {(form.cafeName || "W")[0]}
        </div>
      )}
      <h3 className="fraunces mt-3 text-2xl font-black text-[#111936]">
        {form.cafeName}
      </h3>
      <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
        {form.address || "Restaurant address will appear here"}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600">
        <span className="p-2 bg-white rounded-xl">{form.phone || "Phone"}</span>
        <span className="p-2 bg-white rounded-xl">{form.email || "Email"}</span>
      </div>
    </div>
  );
}

function HomePreview({ form, heroImagePreview }) {
  return (
    <div
      className="relative p-6 overflow-hidden"
      style={{
        minHeight: 260,
        background: heroImagePreview
          ? `linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.45)), url(${heroImagePreview}) center/cover`
          : `linear-gradient(135deg, ${form.bgColor}, #efe0c8)`,
      }}
    >
      <p
        className="mb-2 text-[9px] font-black uppercase tracking-[0.22em]"
        style={{ color: form.accentColor }}
      >
        Welcome
      </p>
      <h2
        className="fraunces max-w-[280px] text-3xl font-black leading-none"
        style={{ color: heroImagePreview ? "#fffaf1" : form.headingColor }}
      >
        {form.heroHeading}
      </h2>
      <p
        className="mt-3 max-w-[260px] text-xs font-medium leading-5"
        style={{
          color: heroImagePreview ? "rgba(255,255,255,.8)" : form.bodyTextColor,
        }}
      >
        {form.heroSubtitle}
      </p>
      <button
        type="button"
        className="mt-4 rounded-full px-4 py-2 text-[10px] font-black"
        style={{ background: form.buttonColor, color: form.buttonTextColor }}
      >
        {form.ctaText}
      </button>
    </div>
  );
}

function MenuPreview({ form, compact }) {
  return (
    <div className="p-5">
      <div className="mb-4 text-center">
        <p
          className="text-[9px] font-black uppercase tracking-[0.2em]"
          style={{ color: form.accentColor }}
        >
          Freshly prepared
        </p>
        <h3 className="fraunces text-3xl font-black text-[#111936]">
          Our Menu
        </h3>
        <DividerPreview type={form.dividerStyle} color={form.dividerColor} />
      </div>
      <div className="flex justify-center gap-2 mb-4">
        {["All", "Coffee", "Meals"].map((x, i) => (
          <span
            key={x}
            className="rounded-full px-3 py-1 text-[9px] font-black"
            style={{
              background: i === 0 ? form.primaryColor : "#fff",
              color: i === 0 ? form.accentColor : form.primaryColor,
            }}
          >
            {x}
          </span>
        ))}
      </div>
      <div className="flex justify-center p-2 overflow-auto">
        <ScaledMenuCard form={form} maxWidth={compact ? 230 : 310} />
      </div>
    </div>
  );
}

function ScaledMenuCard({ form, maxWidth }) {
  const scale = Math.min(1, maxWidth / Number(form.cardWidth || 320));
  return (
    <div
      style={{
        width: Number(form.cardWidth || 320) * scale,
        height: Number(form.cardHeight || 420) * scale,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: Number(form.cardWidth || 320),
        }}
      >
        <DesignedMenuCard form={form} />
      </div>
    </div>
  );
}

function DesignedMenuCard({ form }) {
  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        width: Number(form.cardWidth || 320),
        height: Number(form.cardHeight || 420),
        borderRadius: Number(form.cardBorderRadius || 24),
        padding: Number(form.cardPadding || 20),
        background: form.cardBgColor,
        color: form.cardTextColor,
        border: `${Number(form.cardBorderThickness || 0)}px solid rgba(212,168,83,.35)`,
        boxShadow: cardShadow(form.cardShadow),
      }}
    >
      <div
        className="relative overflow-hidden bg-amber-100"
        style={{
          height: Number(form.cardImageHeight || 200),
          borderRadius: Math.max(10, Number(form.cardBorderRadius || 24) - 8),
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Coffee size={64} className="text-amber-700/35" />
        </div>
        <span
          className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider"
          style={{
            background: form.cardBadgeColor,
            color: form.cardButtonTextColor,
          }}
        >
          Chef Pick
        </span>
      </div>
      <h4
        className="mt-4 text-xl font-black fraunces"
        style={{ color: form.cardTextColor }}
      >
        Truffle Cream Pasta
      </h4>
      <p className="mt-2 text-xs leading-5 line-clamp-2 text-slate-500">
        Silky café-style pasta with herbs, cream, parmesan and a warm house
        finish.
      </p>
      <div className="flex items-center justify-between mt-auto">
        <p
          className="text-lg font-black"
          style={{ color: form.cardPriceColor }}
        >
          ₹299
        </p>
        <button
          type="button"
          className="px-4 py-2 text-xs font-black"
          style={{
            borderRadius: Number(form.cardButtonRadius || 14),
            background: form.cardButtonColor,
            color: form.cardButtonTextColor,
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function BrandingPreview({ form }) {
  return (
    <div className="grid grid-cols-2 gap-3 p-5">
      {[
        form.primaryColor,
        form.secondaryColor,
        form.bgColor,
        form.textColor,
        form.cardBg,
        form.buttonColor,
        form.accentColor,
      ].map((c, i) => (
        <div
          key={i}
          className="p-4 text-xs font-black shadow-sm rounded-2xl"
          style={{ background: c, color: readableText(c) }}
        >
          {c}
        </div>
      ))}
    </div>
  );
}

function FontsPreview({ form }) {
  return (
    <div className="p-6">
      <h3
        className="text-3xl font-black"
        style={{
          fontFamily: fontFamily(form.headingFont),
          color: form.headingColor,
        }}
      >
        Premium Café Typography
      </h3>
      <p
        className="mt-3 text-sm leading-7"
        style={{
          fontFamily: fontFamily(form.bodyFont),
          color: form.bodyTextColor,
          fontSize: form.baseFontSize,
          fontWeight: form.fontWeight,
          letterSpacing: form.letterSpacing,
        }}
      >
        This is how your public website text will feel after applying typography
        settings.
      </p>
    </div>
  );
}

function DividersFullPreview({ form }) {
  return (
    <div className="p-6 space-y-5 text-center">
      <h3 className="fraunces text-2xl font-black text-[#111936]">
        Section Divider
      </h3>
      <DividerPreview
        type={form.dividerStyle}
        color={form.dividerColor}
        height={form.dividerHeight}
        width={form.dividerWidth}
        customSvgCode={form.customSvgCode}
      />
      <p className="text-xs text-slate-500">
        Used between premium café sections.
      </p>
    </div>
  );
}

function AboutPreview({ form, aboutImagePreview }) {
  return (
    <div
      className="grid grid-cols-2 gap-4 p-5"
      style={{ background: form.aboutBgColor, color: form.aboutTextColor }}
    >
      <div className="rounded-2xl bg-amber-100">
        {aboutImagePreview ? (
          <img
            src={aboutImagePreview}
            alt=""
            className="h-full min-h-[120px] w-full rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-full min-h-[120px] items-center justify-center">
            <Coffee className="text-amber-600" />
          </div>
        )}
      </div>
      <div>
        <h3 className="text-xl font-black fraunces">{form.aboutHeading}</h3>
        <p
          className="mt-2 text-xs leading-5 line-clamp-5"
          style={{ fontSize: form.aboutFontSize }}
        >
          {form.aboutContent || "Your café story will appear here."}
        </p>
      </div>
    </div>
  );
}

function ContactPreview({ form }) {
  return (
    <div
      className="p-6 text-center"
      style={{ background: form.contactBgColor, color: form.contactTextColor }}
    >
      <h3 className="text-2xl font-black fraunces">{form.contactHeading}</h3>
      <div className="mt-5 grid grid-cols-2 gap-2 text-[10px] font-bold">
        <span className="p-3 bg-white rounded-xl">
          {form.contactPhone || form.phone || "Phone"}
        </span>
        <span className="p-3 bg-white rounded-xl">
          {form.contactEmail || form.email || "Email"}
        </span>
        <span className="p-3 bg-white rounded-xl">
          {form.whatsapp || "WhatsApp"}
        </span>
        <span className="p-3 bg-white rounded-xl">Map</span>
      </div>
    </div>
  );
}

function FooterPreview({ form }) {
  return (
    <div
      className="p-6 text-center"
      style={{ background: form.primaryColor, color: form.buttonTextColor }}
    >
      <h3 className="text-xl font-black fraunces">{form.cafeName}</h3>
      <p className="mt-2 text-xs opacity-70">
        Warm plates. Soft lights. Better café moments.
      </p>
      <div className="h-px mx-auto my-4 bg-current w-28 opacity-20" />
      <p className="text-[10px] opacity-60">Powered by FoodDash</p>
    </div>
  );
}

function ReceiptPreview({ form, logoPreview, plain = false }) {
  const body = (
    <div className="space-y-2 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-600">
        Receipt Preview
      </p>
      {logoPreview ? (
        <img
          src={logoPreview}
          alt="Logo"
          className="object-contain w-auto h-10 mx-auto"
        />
      ) : (
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#111936] text-sm font-black text-amber-400">
          {(form.cafeName || "W")[0]}
        </div>
      )}
      <p className="fraunces text-sm font-black text-[#111936]">
        {form.cafeName || "Café Name"}
      </p>
      <div className="h-px my-2 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
      <div className="space-y-1 text-left text-[10px]">
        <BillRow label="Pasta × 1" value="₹299" />
        <BillRow label="Coffee × 2" value="₹240" />
        <BillRow label="Total" value="₹539" bold />
      </div>
      {form.showQR && (
        <div className="flex items-center justify-center mx-auto mt-3 bg-white border h-14 w-14 rounded-xl border-slate-200">
          <QrCode size={30} />
        </div>
      )}
      <p className="text-[10px] italic text-slate-500">
        “{form.receiptFooter}”
      </p>
    </div>
  );
  if (plain) return <div className="p-4">{body}</div>;
  return (
    <div className="rounded-2xl border border-amber-100 bg-[#fffdf7] p-4">
      {body}
    </div>
  );
}

function OrderingPreview({ form }) {
  return (
    <div className="p-6 text-center">
      <Check className="mx-auto mb-3 text-emerald-500" />
      <h3 className="fraunces text-2xl font-black text-[#111936]">Thank You</h3>
      <p className="mt-2 text-sm text-slate-500">{form.thankYouMessage}</p>
      <p className="p-3 mt-4 text-xs font-bold rounded-2xl bg-amber-50 text-amber-700">
        {form.orderStatusText}
      </p>
    </div>
  );
}

function PresetPreview({ form }) {
  return (
    <div className="p-6">
      <div className="p-5 text-center border rounded-2xl border-amber-100 bg-amber-50">
        <Sparkles className="mx-auto mb-3 text-amber-500" />
        <h3 className="fraunces text-2xl font-black text-[#111936]">
          Save as Preset
        </h3>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Save this complete configuration and apply it later for festivals,
          seasons or special events.
        </p>
      </div>
    </div>
  );
}

function AdvancedPreview({ form }) {
  return (
    <div className="p-6">
      <Code2 className="mb-3 text-amber-600" />
      <h3 className="fraunces text-2xl font-black text-[#111936]">
        Advanced Theme
      </h3>
      <p className="mt-2 text-xs text-slate-500">
        Custom CSS length: {form.customCSS?.length || 0} characters
      </p>
    </div>
  );
}

function AiPreview() {
  return (
    <div className="p-6 text-center">
      <Wand2 className="mx-auto mb-3 text-amber-500" />
      <h3 className="fraunces text-2xl font-black text-[#111936]">
        AI Theme Studio
      </h3>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        Coming soon: generate theme JSON safely from restaurant style.
      </p>
    </div>
  );
}

function BillRow({ label, value, bold }) {
  return (
    <div
      className={`flex justify-between ${bold ? "font-black text-[#111936]" : "font-medium text-slate-500"}`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function SectionWrap({ id, title, sub, icon, children, activeSection }) {
  return (
    <section
      id={`section-${id}`}
      className={`section-fade scroll-mt-24 rounded-[1.5rem] border bg-white p-4 shadow-xl shadow-slate-900/[0.03] sm:rounded-[2rem] sm:p-6 ${activeSection === id ? "border-amber-300" : "border-amber-100"}`}
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#111936] text-amber-400">
          {icon}
        </div>
        <div>
          <h2 className="fraunces text-2xl font-black tracking-[-0.03em] text-[#111936]">
            {title}
          </h2>
          <p className="max-w-2xl mt-1 text-sm font-medium leading-6 text-slate-500">
            {sub}
          </p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function ImageUploader({
  label,
  value,
  preview,
  inputRef,
  onUrlChange,
  onUpload,
  onClear,
  wide = false,
}) {
  return (
    <div>
      <FieldLabel icon={<Image size={15} />} label={label} />
      <div className="grid grid-cols-1 gap-3 mt-2 md:grid-cols-2">
        <InputField
          label=""
          value={value}
          onChange={(e) => onUrlChange(e.target.value)}
          icon={<Link size={15} />}
          placeholder="Paste image URL..."
        />
        <button
          type="button"
          className="flex flex-col items-center gap-2 p-4 text-center upload-zone rounded-2xl"
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={20} className="text-amber-600" />
          <span className="text-xs font-bold text-slate-500">
            Upload from device
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onUpload(e.target.files?.[0])}
          />
        </button>
      </div>
      {preview && (
        <div className="flex items-center gap-3 p-3 mt-3 border rounded-2xl border-amber-100 bg-amber-50">
          <img
            src={preview}
            alt="Preview"
            className={`${wide ? "h-20 w-32" : "h-14 w-14"} rounded-xl border border-amber-100 bg-white object-cover`}
          />
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-600">Preview ready</p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Image URL will be saved.
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="flex items-center justify-center w-8 h-8 text-red-400 rounded-xl bg-red-50 hover:bg-red-100"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
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
      {label && <FieldLabel icon={icon} label={label} required={required} />}
      <input
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-2xl border border-amber-100 bg-[#fffdf7] px-4 text-sm font-semibold text-[#111936] outline-none transition placeholder:text-slate-300 hover:border-amber-200 focus:border-amber-300 focus:ring-4 focus:ring-amber-50"
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
      <FieldLabel icon={icon} label={label} />
      <textarea
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none rounded-2xl border border-amber-100 bg-[#fffdf7] px-4 py-3 text-sm font-semibold leading-6 text-[#111936] outline-none transition placeholder:text-slate-300 hover:border-amber-200 focus:border-amber-300 focus:ring-4 focus:ring-amber-50"
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, icon, options }) {
  return (
    <label className="block">
      <FieldLabel icon={icon} label={label} />
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="h-11 w-full cursor-pointer appearance-none rounded-2xl border border-amber-100 bg-[#fffdf7] px-4 text-sm font-semibold text-[#111936] outline-none transition hover:border-amber-200 focus:border-amber-300 focus:ring-4 focus:ring-amber-50"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </label>
  );
}

function SliderField({ label, value, min, max, unit, onChange }) {
  const safeValue = Number(value ?? min);
  const pct = ((safeValue - min) / (max - min)) * 100;
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-black uppercase tracking-[0.13em] text-slate-400">
          {label}
        </span>
        <span className="rounded-lg border border-amber-100 bg-amber-50 px-2 py-0.5 text-xs font-black text-[#111936]">
          {safeValue}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={safeValue}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer range-input"
        style={{ "--val": `${pct}%` }}
      />
    </label>
  );
}

function ColorPickerField({ label, value, onChange }) {
  const [inputVal, setInputVal] = useState(value || "");
  useEffect(() => setInputVal(value || ""), [value]);
  const colorValue = /^#[0-9A-F]{6}$/i.test(inputVal) ? inputVal : "#ffffff";
  return (
    <div>
      <p className="mb-2 text-[11px] font-black uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>
      <div className="flex items-center gap-2 rounded-2xl border border-amber-100 bg-[#fffdf7] p-2">
        <input
          type="color"
          value={colorValue}
          onChange={(e) => {
            setInputVal(e.target.value);
            onChange(e.target.value);
          }}
        />
        <input
          value={inputVal}
          onChange={(e) => {
            setInputVal(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="#HEX / rgb() / hsl()"
          className="min-w-0 flex-1 bg-transparent text-xs font-bold text-[#111936] outline-none"
        />
      </div>
    </div>
  );
}

function ToggleField({ label, value, onChange, helper }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-100 bg-[#fffdf7] p-4">
      <div>
        <p className="text-sm font-black text-[#111936]">{label}</p>
        {helper && <p className="mt-1 text-xs text-slate-400">{helper}</p>}
      </div>
      <ToggleButton value={value} onChange={onChange} />
    </div>
  );
}

function ToggleButton({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${value ? "bg-[#111936]" : "bg-slate-300"}`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${value ? "left-6" : "left-1"}`}
      />
    </button>
  );
}

function FieldLabel({ icon, label, required }) {
  return (
    <span className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.13em] text-slate-400">
      {icon}
      {label}
      {required && <span className="text-red-500">*</span>}
    </span>
  );
}

function PreviewFocusNote({ text }) {
  return (
    <div className="px-4 py-3 text-xs font-bold border rounded-2xl border-amber-100 bg-amber-50 text-amber-800">
      <Eye size={14} className="inline mr-2" />
      {text}
    </div>
  );
}

function MiniCardPreview({ form }) {
  return (
    <div
      className="mx-auto overflow-hidden border rounded-xl border-amber-100"
      style={{ width: 90, height: 80, background: form.cardBgColor }}
    >
      <div className="h-8 bg-amber-100" />
      <div className="p-2 space-y-1">
        <div className="w-12 h-2 rounded bg-slate-300" />
        <div className="w-16 h-2 rounded bg-slate-200" />
        <div
          className="w-10 h-3 rounded"
          style={{ background: form.cardButtonColor }}
        />
      </div>
    </div>
  );
}

function DividerPreview({
  type,
  color = "#D4A853",
  height = 14,
  width = 100,
  customSvgCode,
}) {
  if (type === "customSvg" && customSvgCode)
    return (
      <div
        className="mx-auto"
        style={{ width: `${width}%` }}
        dangerouslySetInnerHTML={{ __html: customSvgCode }}
      />
    );
  if (type === "modernWave")
    return (
      <div className="mx-auto" style={{ width: `${width}%`, height }}>
        <svg viewBox="0 0 180 18" className="w-full h-full" fill="none">
          <path
            d="M4 9C28 0 42 18 66 9C90 0 104 18 128 9C148 2 160 5 176 9"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );

  if (type === "generalCafe")
    return (
      <div className="mx-auto" style={{ width: `${width}%`, height }}>
        if (type === "modernWave") return (
        <div className="mx-auto" style={{ width: `${width}%`, height }}>
          <svg viewBox="0 0 180 18" className="w-full h-full" fill="none">
            <path
              d="M4 9C28 0 42 18 66 9C90 0 104 18 128 9C148 2 160 5 176 9"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        );
      </div>
    );
  if (type === "luxuryOrnament" || type === "floralCafe")
    return (
      <div
        className="flex items-center justify-center mx-auto"
        style={{ width: `${width}%`, height }}
      >
        <svg viewBox="0 0 190 18" className="w-full h-full" fill="none">
          <line x1="0" y1="9" x2="60" y2="9" stroke={color} />
          <line x1="130" y1="9" x2="190" y2="9" stroke={color} />
          <path
            d="M65 9 Q78 1 95 9 Q112 17 125 9"
            stroke={color}
            fill="none"
            strokeWidth="1.2"
          />
          <circle cx="95" cy="9" r="2.5" fill={color} />
        </svg>
      </div>
    );
  return (
    <div
      className="flex items-center gap-2 mx-auto my-2"
      style={{ width: `${width}%` }}
    >
      <span
        className="flex-1 h-px"
        style={{
          background: `linear-gradient(to right, transparent, ${color})`,
        }}
      />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: color }} />
      <span
        className="flex-1 h-px"
        style={{
          background: `linear-gradient(to right, ${color}, transparent)`,
        }}
      />
    </div>
  );
}

function MessageSquareIcon() {
  return <Gift size={15} />;
}
function LayersIcon() {
  return <Grid3X3 size={15} />;
}

function fontOptions() {
  return [
    { v: "DM Sans", l: "DM Sans" },
    { v: "Fraunces", l: "Fraunces" },
    { v: "Playfair Display", l: "Playfair Display" },
    { v: "Lato", l: "Lato" },
    { v: "Nunito", l: "Nunito" },
    { v: "Merriweather", l: "Merriweather" },
    { v: "Inter", l: "Inter" },
  ];
}

function sectionTitle(id) {
  return NAV_SECTIONS.find((s) => s.id === id)?.label || "Website";
}

function fontFamily(font) {
  if (!font) return "DM Sans, Inter, sans-serif";
  return `'${font}', Inter, sans-serif`;
}

function cardShadow(level) {
  const shadows = [
    "none",
    "0 8px 20px rgba(17,25,54,.08)",
    "0 14px 34px rgba(17,25,54,.12)",
    "0 22px 55px rgba(17,25,54,.16)",
    "0 30px 80px rgba(17,25,54,.22)",
    "0 42px 100px rgba(17,25,54,.28)",
  ];
  return shadows[Math.max(0, Math.min(5, Number(level || 0)))] || shadows[3];
}

function readableText(hex) {
  if (!hex || !hex.startsWith("#")) return "#111936";
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#111936" : "#ffffff";
}

const studioStyles = `
  .admin-section-scroll::-webkit-scrollbar { height: 0px; }
  .admin-section-scroll { scrollbar-width: none; -webkit-overflow-scrolling: touch; overscroll-behavior-x: contain; }

@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,700&family=DM+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap');
.fraunces { font-family: 'Fraunces', Georgia, serif; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #f5f0e8; }
::-webkit-scrollbar-thumb { background: #d4a853; border-radius: 999px; }
.sidebar-link { transition: all 0.18s ease; }
.sidebar-link:hover { background: rgba(212,168,83,0.12); color: #111936; }
.sidebar-link.active { background: #111936; color: #D4A853; }
.sidebar-link.active svg { color: #D4A853; }
.range-input { -webkit-appearance: none; height: 6px; border-radius: 999px; background: linear-gradient(to right, #D4A853 0%, #D4A853 var(--val, 50%), #e5e1d8 var(--val, 50%)); outline: none; }
.range-input::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #111936; cursor: pointer; box-shadow: 0 2px 6px rgba(17,25,54,0.3); }
.section-fade { animation: sectionFade 0.3s ease; }
@keyframes sectionFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.palette-card, .preset-card { transition: all .2s ease; cursor: pointer; }
.palette-card:hover, .preset-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.10); }
.upload-zone { border: 2px dashed #d4c4a0; background: #fffdf7; transition: all .2s ease; cursor: pointer; }
.upload-zone:hover { border-color: #D4A853; background: #fffbf0; }
input[type=color] { -webkit-appearance: none; width: 36px; height: 36px; border: none; padding: 0; background: none; cursor: pointer; border-radius: 8px; }
input[type=color]::-webkit-color-swatch-wrapper { padding: 0; }
input[type=color]::-webkit-color-swatch { border: none; border-radius: 8px; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-5 { display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden; }
`;

export default AdminSettings;
