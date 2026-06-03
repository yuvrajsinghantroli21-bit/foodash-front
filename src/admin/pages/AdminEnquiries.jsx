import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import socket from "../../socket/socket";
import toast from "react-hot-toast";
import {
  Mail,
  Phone,
  User,
  MessageCircle,
  RefreshCw,
  CheckCircle2,
  Eye,
  EyeOff,
  Trash2,
  Inbox,
  X,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const fmtDateTime = (d) =>
  new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const fmtShortTime = (d) =>
  new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const itemsPerPage = 6;

  const fetchEnquiries = (showLoading = true) => {
    if (showLoading) setLoading(true);

    api
      .get("/admin/enquiries")
      .then((res) => {
        setEnquiries(res.data || []);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to fetch enquiries");
      })
      .finally(() => {
        if (showLoading) setLoading(false);
      });
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  useEffect(() => {
    const handleNewEnquiry = (enquiry) => {
      setEnquiries((prev) => [enquiry, ...prev]);
      toast.success("New enquiry received");
    };

    const handleUpdated = (updated) => {
      setEnquiries((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item)),
      );

      setSelectedEnquiry((prev) =>
        prev && prev._id === updated._id ? updated : prev,
      );
    };

    const handleDeleted = (id) => {
      setEnquiries((prev) => prev.filter((item) => item._id !== id));

      setSelectedEnquiry((prev) => (prev && prev._id === id ? null : prev));
    };

    socket.on("new-enquiry", handleNewEnquiry);
    socket.on("enquiry-updated", handleUpdated);
    socket.on("enquiry-deleted", handleDeleted);

    return () => {
      socket.off("new-enquiry", handleNewEnquiry);
      socket.off("enquiry-updated", handleUpdated);
      socket.off("enquiry-deleted", handleDeleted);
    };
  }, []);

  const markStatus = (id, status) => {
    api
      .put(`/admin/enquiries/${id}/status`, { status })
      .then((res) => {
        setEnquiries((prev) =>
          prev.map((item) => (item._id === id ? res.data : item)),
        );

        setSelectedEnquiry((prev) =>
          prev && prev._id === id ? res.data : prev,
        );

        toast.success(
          status === "read" ? "Marked as read" : "Marked as unread",
        );
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to update enquiry");
      });
  };

  const deleteEnquiry = (id) => {
    if (!window.confirm("Delete this enquiry?")) return;

    api
      .delete(`/admin/enquiries/${id}`)
      .then(() => {
        setEnquiries((prev) => prev.filter((item) => item._id !== id));
        setSelectedEnquiry((prev) => (prev && prev._id === id ? null : prev));
        toast.success("Enquiry deleted");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to delete enquiry");
      });
  };

  const stats = useMemo(() => {
    const unread = enquiries.filter((item) => item.status === "unread").length;
    const read = enquiries.filter((item) => item.status === "read").length;

    return {
      total: enquiries.length,
      unread,
      read,
    };
  }, [enquiries]);

  const filteredEnquiries = useMemo(() => {
    if (filter === "read") {
      return enquiries.filter((item) => item.status === "read");
    }

    if (filter === "unread") {
      return enquiries.filter((item) => item.status === "unread");
    }

    return enquiries;
  }, [enquiries, filter]);

  const totalPages = Math.ceil(filteredEnquiries.length / itemsPerPage) || 1;

  const paginatedEnquiries = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredEnquiries.slice(start, start + itemsPerPage);
  }, [filteredEnquiries, page]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openDetails = (item) => {
    setSelectedEnquiry(item);

    if (item.status === "unread") {
      markStatus(item._id, "read");
    }
  };

  return (
    <div
      className="min-h-screen bg-[#fbfaf8] text-[#111827]"
      style={{ fontFamily: "'Inter', 'DM Sans', sans-serif" }}
    >
      <main className="px-4 py-7 mx-auto max-w-[1500px] sm:px-6">
        {/* HEADER */}
        <div className="flex flex-col gap-5 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 text-xs font-extrabold rounded-full text-amber-700 bg-amber-50">
              <Inbox size={14} />
              Customer Enquiries
            </div>

            <h1 className="text-4xl font-extrabold tracking-[-0.04em] text-[#111936] sm:text-5xl">
              Enquiry Inbox
            </h1>

            <p className="max-w-2xl mt-2 text-sm font-semibold leading-relaxed text-slate-500 sm:text-base">
              Quickly view contact messages, check unread enquiries, and open
              full details only when needed.
            </p>
          </div>

          <button
            onClick={() => fetchEnquiries()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-extrabold bg-white border border-gray-200 shadow-sm rounded-xl text-slate-600 hover:bg-gray-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
          <button
            onClick={() => setFilter("all")}
            className={`p-5 text-left border shadow-[0_8px_26px_rgba(15,23,42,0.07)] rounded-2xl transition ${
              filter === "all"
                ? "bg-[#071832] border-[#071832] text-white"
                : "bg-white border-gray-100 text-slate-700"
            }`}
          >
            <p
              className={`text-sm font-bold ${
                filter === "all" ? "text-white/70" : "text-slate-500"
              }`}
            >
              Total Enquiries
            </p>
            <h3 className="mt-1 text-3xl font-extrabold">{stats.total}</h3>
          </button>

          <button
            onClick={() => setFilter("unread")}
            className={`p-5 text-left border shadow-[0_8px_26px_rgba(15,23,42,0.07)] rounded-2xl transition ${
              filter === "unread"
                ? "bg-amber-600 border-amber-600 text-white"
                : "bg-white border-gray-100 text-slate-700"
            }`}
          >
            <p
              className={`text-sm font-bold ${
                filter === "unread" ? "text-white/80" : "text-slate-500"
              }`}
            >
              Unread
            </p>
            <h3 className="mt-1 text-3xl font-extrabold">{stats.unread}</h3>
          </button>

          <button
            onClick={() => setFilter("read")}
            className={`p-5 text-left border shadow-[0_8px_26px_rgba(15,23,42,0.07)] rounded-2xl transition ${
              filter === "read"
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-white border-gray-100 text-slate-700"
            }`}
          >
            <p
              className={`text-sm font-bold ${
                filter === "read" ? "text-white/80" : "text-slate-500"
              }`}
            >
              Read
            </p>
            <h3 className="mt-1 text-3xl font-extrabold">{stats.read}</h3>
          </button>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="py-24 text-center text-slate-400">
            Loading enquiries...
          </div>
        ) : filteredEnquiries.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paginatedEnquiries.map((item) => {
                const unread = item.status === "unread";

                return (
                  <div
                    key={item._id}
                    className={`relative overflow-hidden bg-white border shadow-[0_8px_26px_rgba(15,23,42,0.07)] rounded-2xl ${
                      unread ? "border-amber-200" : "border-gray-100"
                    }`}
                  >
                    <div
                      className={`h-1 ${
                        unread ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                    />

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span
                              className={`px-3 py-1 rounded-full text-[11px] font-extrabold ${
                                unread
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {unread ? "Unread" : "Read"}
                            </span>

                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                              <CalendarClock size={12} />
                              {fmtShortTime(item.createdAt)}
                            </span>
                          </div>

                          <h2 className="text-lg font-extrabold tracking-tight text-[#111936] truncate">
                            {item.subject || "General Enquiry"}
                          </h2>
                        </div>

                        <button
                          onClick={() =>
                            markStatus(item._id, unread ? "read" : "unread")
                          }
                          className="flex items-center justify-center transition bg-white border border-gray-200 w-9 h-9 text-slate-500 rounded-xl hover:bg-gray-50 shrink-0"
                          title={unread ? "Mark as read" : "Mark as unread"}
                        >
                          {unread ? <Eye size={17} /> : <EyeOff size={17} />}
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#fbfaf8]">
                          <User size={15} className="text-amber-700 shrink-0" />
                          <span className="text-sm font-bold truncate text-slate-700">
                            {item.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#fbfaf8]">
                          <Mail size={15} className="text-amber-700 shrink-0" />
                          <span className="text-sm font-semibold truncate text-slate-500">
                            {item.email}
                          </span>
                        </div>
                      </div>

                      {/* <p className="mt-4 text-sm font-medium leading-relaxed text-slate-500 line-clamp-2">
                        {item.message}
                      </p> */}

                      <div className="flex items-center justify-between gap-3 mt-5">
                        <button
                          onClick={() => openDetails(item)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-extrabold text-white bg-[#071832] rounded-xl shadow-[0_8px_18px_rgba(7,24,50,0.16)]"
                        >
                          <MessageCircle size={15} />
                          View Details
                        </button>

                        <button
                          onClick={() => deleteEnquiry(item._id)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-extrabold text-red-500 rounded-xl bg-red-50 hover:bg-red-100"
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            <div className="flex flex-col items-center justify-between gap-4 p-4 mt-6 bg-white border border-gray-100 shadow-sm rounded-2xl sm:flex-row">
              <p className="text-sm font-semibold text-slate-500">
                Showing{" "}
                <span className="font-extrabold text-slate-800">
                  {(page - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-extrabold text-slate-800">
                  {Math.min(page * itemsPerPage, filteredEnquiries.length)}
                </span>{" "}
                of{" "}
                <span className="font-extrabold text-slate-800">
                  {filteredEnquiries.length}
                </span>{" "}
                enquiries
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="inline-flex items-center justify-center w-10 h-10 border border-gray-200 rounded-xl text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNo = index + 1;

                  return (
                    <button
                      key={pageNo}
                      onClick={() => setPage(pageNo)}
                      className={`inline-flex items-center justify-center w-10 h-10 text-sm font-extrabold border rounded-xl ${
                        page === pageNo
                          ? "bg-[#071832] text-white border-[#071832]"
                          : "bg-white text-slate-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {pageNo}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={page === totalPages}
                  className="inline-flex items-center justify-center w-10 h-10 border border-gray-200 rounded-xl text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-28 text-slate-400">
            <Inbox size={54} className="mb-4 opacity-30" />
            <p className="text-lg font-bold text-slate-500">
              No enquiries found
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Messages from your contact page will appear here.
            </p>
          </div>
        )}
      </main>

      {/* DETAIL MODAL */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 py-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] rounded-3xl">
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-extrabold ${
                      selectedEnquiry.status === "unread"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {selectedEnquiry.status === "unread" ? "Unread" : "Read"}
                  </span>

                  <span className="text-xs font-semibold text-slate-400">
                    {fmtDateTime(selectedEnquiry.createdAt)}
                  </span>
                </div>

                <h2 className="text-2xl font-extrabold tracking-tight text-[#111936]">
                  {selectedEnquiry.subject || "General Enquiry"}
                </h2>
              </div>

              <button
                onClick={() => setSelectedEnquiry(null)}
                className="flex items-center justify-center w-10 h-10 transition bg-white border border-gray-200 text-slate-500 rounded-xl hover:bg-gray-50 shrink-0"
              >
                <X size={19} />
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="grid grid-cols-1 gap-3 mb-5 sm:grid-cols-2">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#fbfaf8]">
                  <User size={17} className="text-amber-700" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400">Name</p>
                    <p className="text-sm font-extrabold truncate text-slate-700">
                      {selectedEnquiry.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#fbfaf8]">
                  <Phone size={17} className="text-amber-700" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400">
                      Phone
                    </p>
                    <p className="text-sm font-extrabold truncate text-slate-700">
                      {selectedEnquiry.phone || "No phone"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#fbfaf8] sm:col-span-2">
                  <Mail size={17} className="text-amber-700" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400">
                      Email
                    </p>
                    <p className="text-sm font-extrabold break-all text-slate-700">
                      {selectedEnquiry.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 border border-gray-100 rounded-2xl bg-[#fbfaf8]">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle size={17} className="text-amber-700" />
                  <p className="text-sm font-extrabold text-slate-700">
                    Full Message
                  </p>
                </div>

                <p className="text-sm font-medium leading-relaxed whitespace-pre-line text-slate-600">
                  {selectedEnquiry.message}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 px-6 py-5 border-t border-gray-100 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    markStatus(
                      selectedEnquiry._id,
                      selectedEnquiry.status === "unread" ? "read" : "unread",
                    )
                  }
                  className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-xl ${
                    selectedEnquiry.status === "unread"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  <CheckCircle2 size={15} />
                  {selectedEnquiry.status === "unread"
                    ? "Mark Read"
                    : "Mark Unread"}
                </button>

                <button
                  onClick={() => deleteEnquiry(selectedEnquiry._id)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold text-red-500 rounded-xl bg-red-50"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>

              <button
                onClick={() => setSelectedEnquiry(null)}
                className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-extrabold text-slate-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
