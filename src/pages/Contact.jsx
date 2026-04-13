import React from "react";
import { motion } from "framer-motion";

export default function Contact() {
  return (
    <section className="px-4 py-12 text-gray-900 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-gray-200 sm:px-6 lg:px-12">
      <div className="max-w-[1200px] mx-auto">
        {/* Title */}
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-4xl font-bold">
            Contact The White House ☕
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            We'd love to hear from you! Visit us in Khatipura or send us a
            message.
          </p>
        </div>

        {/* Contact + Form */}
        <div className="grid items-stretch grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left Section */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col justify-between h-full p-6 bg-white border shadow-xl rounded-2xl dark:bg-slate-900 dark:border-slate-800"
          >
            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="text-2xl text-emerald-500">📍</div>
                <div>
                  <h3 className="text-xl font-semibold">Address</h3>
                  <p className="text-gray-700 dark:text-gray-400">
                    Khatipura, Near Lal Mandir Road, Jaipur
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="text-2xl text-emerald-500">📞</div>
                <div>
                  <h3 className="text-xl font-semibold">Call Us</h3>
                  <p className="text-gray-700 dark:text-gray-400">
                    +91 98765 43210
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="text-2xl text-emerald-500">✉️</div>
                <div>
                  <h3 className="text-xl font-semibold">Email Us</h3>
                  <p className="text-gray-700 dark:text-gray-400">
                    whitehousecafe@gmail.com
                  </p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="w-full mt-6 overflow-hidden rounded-xl">
              <iframe
                src="https://www.google.com/maps?q=Khatipura,Jaipur&output=embed"
                className="w-full border-0"
                height="250"
                loading="lazy"
                title="Google Map"
              ></iframe>
            </div>
          </motion.div>

          {/* Right Section */}
          <motion.form
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-full p-6 bg-white border shadow-xl rounded-2xl dark:bg-slate-900 dark:border-slate-800 md:p-8"
          >
            {/* Name & Phone */}
            <div className="grid grid-cols-1 gap-4 mb-5 md:grid-cols-2">
              <div>
                <label className="block mb-2 font-medium">Your Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full p-3 border rounded-lg outline-none bg-gray-50 dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Phone Number</label>
                <input
                  type="number"
                  placeholder="Enter phone number"
                  className="w-full p-3 border rounded-lg outline-none bg-gray-50 dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="block mb-2 font-medium">Your Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 border rounded-lg outline-none bg-gray-50 dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Subject */}
            <div className="mb-5">
              <label className="block mb-2 font-medium">Subject</label>
              <input
                type="text"
                placeholder="Enter subject"
                className="w-full p-3 border rounded-lg outline-none bg-gray-50 dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Message */}
            <div className="mb-5">
              <label className="block mb-2 font-medium">Message</label>
              <textarea
                rows="5"
                placeholder="Write your message..."
                className="w-full p-3 border rounded-lg outline-none bg-gray-50 dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
              ></textarea>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full py-3 font-semibold text-white transition rounded-xl bg-emerald-500 hover:bg-emerald-600"
            >
              Send Message 🚀
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
