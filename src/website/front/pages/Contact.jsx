import { useState } from "react";
import {
  Mail,
  Phone,
  Building2,
  MessageSquareText,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../api/api";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    subject: "FoodDash Business Enquiry",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitEnquiry = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Name, email and message are required");
      return;
    }

    setLoading(true);

    api
      .post("/enquiries", form)
      .then(() => {
        toast.success("Enquiry sent successfully");
        setForm({
          name: "",
          email: "",
          phone: "",
          businessName: "",
          subject: "FoodDash Business Enquiry",
          message: "",
        });
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to send enquiry");
      })
      .finally(() => setLoading(false));
  };

  return (
    <main className="min-h-screen bg-[#f7fbff] px-4 py-16 text-slate-950">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-blue-300">
            Contact FoodDash
          </p>

          <h1 className="text-4xl font-black tracking-[-0.05em] sm:text-5xl">
            Let’s bring QR ordering to your restaurant.
          </h1>

          <p className="mt-5 text-sm font-medium leading-7 text-slate-300">
            Share your restaurant details and we’ll help you set up your
            website, menu preview, QR ordering, payments and admin dashboard.
          </p>

          <div className="mt-8 space-y-4">
            <Info
              icon={<Mail size={18} />}
              title="Email"
              text="support@foodash.in"
            />
            <Info
              icon={<Phone size={18} />}
              title="Support"
              text="+91 98765 43210"
            />
            <Info
              icon={<Building2 size={18} />}
              title="For"
              text="Restaurants, cafés and cloud kitchens"
            />
          </div>
        </div>

        <form
          onSubmit={submitEnquiry}
          className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl sm:p-8"
        >
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              Business Enquiry
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">
              Tell us about your restaurant
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Your Name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
            <Input
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
            <Input
              label="Business Name"
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
            />

            <div className="sm:col-span-2">
              <Input
                label="Subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block mb-2 text-xs font-black tracking-widest uppercase text-slate-500">
                Message
              </label>

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                placeholder="Tell us what you need..."
                className="w-full px-4 py-3 text-sm font-semibold transition border outline-none resize-none rounded-2xl border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <MessageSquareText size={17} />
            )}
            Send Enquiry
          </button>
        </form>
      </section>
    </main>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block mb-2 text-xs font-black tracking-widest uppercase text-slate-500">
        {label}
      </label>

      <input
        {...props}
        className="w-full h-12 px-4 text-sm font-semibold transition border outline-none rounded-2xl border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

function Info({ icon, title, text }) {
  return (
    <div className="flex items-center gap-3 p-4 border rounded-2xl border-white/10 bg-white/5">
      <div className="flex items-center justify-center w-10 h-10 text-blue-200 rounded-xl bg-blue-500/20">
        {icon}
      </div>

      <div>
        <p className="text-xs font-black tracking-widest uppercase text-slate-400">
          {title}
        </p>
        <p className="text-sm font-bold text-white">{text}</p>
      </div>
    </div>
  );
}
