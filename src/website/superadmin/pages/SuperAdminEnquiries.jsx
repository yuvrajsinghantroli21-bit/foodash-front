import { useEffect, useMemo, useState } from "react";
import api from "../api/superAdminApi";
import toast from "react-hot-toast";
import {
  Mail,
  Phone,
  Building2,
  Search,
  Trash2,
  Eye,
  EyeOff,
  MessageSquareText,
} from "lucide-react";

export default function SuperAdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchEnquiries = () => {
    api
      .get("/saas/superadmin/enquiries")
      .then((res) => setEnquiries(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error("Failed to load enquiries"));
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const updateStatus = (id, status) => {
    api
      .put(`/saas/superadmin/enquiries/${id}/status`, { status })
      .then(() => {
        toast.success("Status updated");
        fetchEnquiries();
      })
      .catch(() => toast.error("Failed to update"));
  };

  const deleteEnquiry = (id) => {
    if (!window.confirm("Delete this enquiry?")) return;

    api
      .delete(`/saas/superadmin/enquiries/${id}`)
      .then(() => {
        toast.success("Enquiry deleted");
        fetchEnquiries();
      })
      .catch(() => toast.error("Failed to delete"));
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return enquiries.filter((e) => {
      const matchesFilter = filter === "all" || e.status === filter;

      const matchesSearch =
        !q ||
        e.name?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.phone?.toLowerCase().includes(q) ||
        e.businessName?.toLowerCase().includes(q) ||
        e.subject?.toLowerCase().includes(q) ||
        e.message?.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [enquiries, search, filter]);

  return (
    <main className="min-h-screen bg-[#f3f8ff] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-[2rem] bg-white p-6 shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
            Qzora Enquiries
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-slate-950">
            Business Enquiries
          </h1>

          <p className="mt-2 text-sm font-semibold text-slate-500">
            See restaurant owners who contacted Qzora from the SaaS website.
          </p>
        </div>

        <div className="flex flex-col gap-3 p-4 mb-6 bg-white shadow-lg rounded-3xl md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute -translate-y-1/2 left-4 top-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search enquiries..."
              className="w-full h-12 pr-4 text-sm font-bold border outline-none rounded-2xl border-slate-200 pl-11 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="flex gap-2">
            {["all", "unread", "read"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest ${
                  filter === item
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((e) => (
            <article
              key={e._id}
              className="rounded-[1.7rem] border border-blue-100 bg-white p-5 shadow-lg"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                      e.status === "unread"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {e.status}
                  </span>

                  <h2 className="mt-3 text-xl font-black text-slate-950">
                    {e.name}
                  </h2>

                  <p className="text-sm font-bold text-blue-600">{e.subject}</p>
                </div>

                <button
                  onClick={() => deleteEnquiry(e._id)}
                  className="flex items-center justify-center w-10 h-10 text-red-500 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-2 text-sm font-semibold text-slate-600">
                <p className="flex items-center gap-2">
                  <Mail size={15} /> {e.email}
                </p>

                {e.phone && (
                  <p className="flex items-center gap-2">
                    <Phone size={15} /> {e.phone}
                  </p>
                )}

                {e.businessName && (
                  <p className="flex items-center gap-2">
                    <Building2 size={15} /> {e.businessName}
                  </p>
                )}
              </div>

              <div className="p-4 mt-4 text-sm font-medium leading-6 rounded-2xl bg-slate-50 text-slate-600">
                {e.message}
              </div>

              <button
                onClick={() =>
                  updateStatus(e._id, e.status === "read" ? "unread" : "read")
                }
                className="inline-flex items-center gap-2 px-4 py-3 mt-4 text-xs font-black tracking-widest text-white uppercase rounded-2xl bg-slate-950"
              >
                {e.status === "read" ? <EyeOff size={15} /> : <Eye size={15} />}
                Mark {e.status === "read" ? "Unread" : "Read"}
              </button>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-[2rem] bg-white p-16 text-center shadow-lg">
            <MessageSquareText
              size={42}
              className="mx-auto mb-3 text-slate-300"
            />
            <p className="text-sm font-black text-slate-500">
              No enquiries found.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
