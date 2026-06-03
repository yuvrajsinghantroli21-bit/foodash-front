import { Link } from "react-router-dom";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";

const footerLinks = [
  { label: "Home", path: "/" },
  { label: "Features", path: "/features" },
  { label: "Pricing", path: "/pricing" },
  { label: "Contact", path: "/contact" },
];

function WebsiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-amber-100 bg-[#fffaf3]">
      <div className="px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-10">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr] md:items-start">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-3xl font-black tracking-[-0.06em] text-[#2d180d]"
            >
              Q<span className="text-[#d68110]">zora</span>
            </Link>

            <p className="mt-3 max-w-md text-sm font-semibold leading-6 text-[#7a5a40]">
              QR menus, online ordering, payments and restaurant websites in one
              simple platform.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-amber-700">
              Platform
            </p>

            <div className="grid gap-2">
              {footerLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="w-fit text-sm font-bold text-[#5b3822] transition hover:text-[#d68110]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-amber-700">
              Contact
            </p>

            <div className="grid gap-3 text-sm font-semibold text-[#5b3822]">
              <a
                href="mailto:support@qzora.in"
                className="flex items-center gap-2 transition hover:text-[#d68110]"
              >
                <Mail size={16} />
                support@qzora.in
              </a>

              <p className="flex items-center gap-2">
                <MapPin size={16} />
                Jaipur, India
              </p>

              <Link
                to="/register"
                className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-[#2d180d] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-amber-100 transition hover:-translate-y-0.5 hover:bg-[#3b2113]"
              >
                Get Started
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-amber-100 pt-5 text-xs font-bold text-[#8a6a4f] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Qzora. All rights reserved.</p>

          <p>Built for cafés, restaurants and food businesses.</p>
        </div>
      </div>
    </footer>
  );
}

export default WebsiteFooter;
