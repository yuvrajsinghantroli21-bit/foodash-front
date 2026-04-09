function Contact() {
  return (
    <div className="min-h-screen px-8 py-16 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>

      <form className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full p-3 rounded bg-gray-800"
        />

        <input
          type="email"
          placeholder="Your Email"
          className="w-full p-3 rounded bg-gray-800"
        />

        <textarea
          placeholder="Your Message"
          rows="5"
          className="w-full p-3 rounded bg-gray-800"
        />

        <button className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-700 transition">
          Send Message
        </button>
      </form>
    </div>
  );
}

export default Contact;
