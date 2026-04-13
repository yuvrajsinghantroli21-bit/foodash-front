import React from "react";
import { motion } from "framer-motion";

export default function Contact() {
  return (
    <section className="px-4 py-12 text-gray-800 bg-white sm:px-6 lg:px-12">
      <div className="max-w-[1200px] mx-auto">
        {/* Title */}
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-4xl font-bold">Contact</h2>
          <p className="max-w-2xl mx-auto text-gray-600">
            We'd love to hear from you! Fill the form below or reach us
            directly.
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
            className="flex flex-col justify-between h-full p-6 rounded-lg shadow-md bg-gray-50"
          >
            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start gap-4">
                <i className="text-2xl text-blue-600 bi bi-geo-alt-fill"></i>
                <div>
                  <h3 className="text-xl font-semibold">Address</h3>
                  <p className="text-gray-700">
                    A108 Adam Street, New York, NY 535022
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <i className="text-2xl text-blue-600 bi bi-telephone-fill"></i>
                <div>
                  <h3 className="text-xl font-semibold">Call Us</h3>
                  <p className="text-gray-700">+1 5589 55488 55</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <i className="text-2xl text-blue-600 bi bi-envelope-fill"></i>
                <div>
                  <h3 className="text-xl font-semibold">Email Us</h3>
                  <p className="text-gray-700">info@example.com</p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="w-full mt-6">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d48389.78314118045!2d-74.006138!3d40.710059!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a22a3bda30d%3A0xb89d1fe6bc499443!2sDowntown%20Conference%20Center!5e0!3m2!1sen!2sus!4v1676961268712!5m2!1sen!2sus"
                className="w-full border rounded-md"
                height="300"
                allowFullScreen=""
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
            className="w-full p-6 rounded-lg shadow-md bg-gray-50 md:p-8"
          >
            {/* Name & Phone */}
            <div className="grid grid-cols-1 gap-4 mb-5 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="block mb-2 font-medium">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter your name"
                  className="w-full p-3 transition border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block mb-2 font-medium">
                  Phone Number
                </label>
                <input
                  type="number"
                  id="phone"
                  placeholder="Enter phone number"
                  className="w-full p-3 transition border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-5">
              <label htmlFor="email" className="block mb-2 font-medium">
                Your Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="w-full p-3 transition border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Subject */}
            <div className="mb-5">
              <label htmlFor="subject" className="block mb-2 font-medium">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                placeholder="Enter subject"
                className="w-full p-3 transition border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Message */}
            <div className="mb-5">
              <label htmlFor="message" className="block mb-2 font-medium">
                Message
              </label>
              <textarea
                id="message"
                rows="6"
                placeholder="Write your message here"
                className="w-full p-3 transition border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                className="px-8 py-3 text-white transition bg-blue-600 rounded-md cursor-pointer hover:bg-blue-700"
              >
                Send Message
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
