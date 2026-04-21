import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="text-gray-300  bg-gradient-to-r from-slate-950 to-slate-900">
      <div className="max-w-6xl px-6 py-12 mx-auto">
        {/* TOP SECTION */}
        <div className="grid gap-10 md:grid-cols-3">
          {/* BRAND */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-3 text-2xl font-bold text-white">
              ☕ The White House Café
            </h2>
            <p className="text-sm text-gray-400">
              Khatipura, Near Lal Mandir Road, Jaipur
            </p>
            <p className="mt-2 text-sm text-gray-500">
              A modern dining experience powered by QR ordering.
            </p>
          </motion.div>

          {/* QUICK LINKS */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="mb-3 font-semibold text-white">Quick Links</h3>

            <div className="flex flex-col gap-2 text-sm">
              <Link to="/" className="transition hover:text-emerald-400">
                Home
              </Link>
              <Link to="/order" className="transition hover:text-emerald-400">
                Order
              </Link>
              <Link to="/about" className="transition hover:text-emerald-400">
                About
              </Link>
              <Link to="/contact" className="transition hover:text-emerald-400">
                Contact
              </Link>
            </div>
          </motion.div>

          {/* CONTACT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="mb-3 font-semibold text-white">Contact</h3>

            <p className="text-sm text-gray-400">📞 +91 98765 43210</p>

            <p className="mt-1 text-sm text-gray-400">
              📧 whitehousecafe@gmail.com
            </p>
          </motion.div>
        </div>

        {/* DIVIDER */}
        <div className="my-8 border-t border-gray-800"></div>

        {/* BOTTOM */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-between gap-3 text-sm text-gray-500 md:flex-row"
        >
          <p>© 2026 The White House Café. All rights reserved.</p>

          <p className="text-xs">⚡ Powered by FoodDash QR Ordering System</p>
        </motion.div>
      </div>
    </footer>
  );
}

export default Footer;
