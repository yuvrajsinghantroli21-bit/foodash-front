import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  MessageSquareText,
  Star,
  Trash2,
  RefreshCcw,
  Search,
  Filter,
  UserRound,
  Clock,
} from "lucide-react";

import api from "../../api/api";
import socket from "../../socket/socket";

function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [search, setSearch] = useState("");

  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");
  const role = adminUser?.role || "";

  const fetchFeedbacks = () => {
    setLoading(true);

    api
      .get("/admin/feedback")
      .then((res) => {
        setFeedbacks(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to fetch feedback");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFeedbacks();

    const handleNewFeedback = (feedback) => {
      setFeedbacks((prev) => [feedback, ...prev]);
      toast.success("New customer feedback received");
    };

    const handleFeedbackDeleted = (id) => {
      setFeedbacks((prev) => prev.filter((item) => item._id !== id));
    };

    socket.on("new-feedback", handleNewFeedback);
    socket.on("feedback-deleted", handleFeedbackDeleted);

    return () => {
      socket.off("new-feedback", handleNewFeedback);
      socket.off("feedback-deleted", handleFeedbackDeleted);
    };
  }, []);

  const deleteFeedback = (id) => {
    if (role !== "admin") {
      toast.error("Only admin can delete feedback");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this feedback?",
    );

    if (!confirmDelete) return;

    api
      .delete(`/admin/feedback/${id}`)
      .then(() => {
        setFeedbacks((prev) => prev.filter((item) => item._id !== id));
        toast.success("Feedback deleted");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to delete feedback");
      });
  };

  const stats = useMemo(() => {
    const total = feedbacks.length;

    const average =
      total > 0
        ? (
            feedbacks.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
            total
          ).toFixed(1)
        : "0.0";

    const fiveStar = feedbacks.filter(
      (item) => Number(item.rating) === 5,
    ).length;
    const lowRating = feedbacks.filter(
      (item) => Number(item.rating) <= 2,
    ).length;

    return {
      total,
      average,
      fiveStar,
      lowRating,
    };
  }, [feedbacks]);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((item) => {
      const matchesRating =
        ratingFilter === "all" || Number(item.rating) === Number(ratingFilter);

      const keyword = search.toLowerCase().trim();

      const matchesSearch =
        !keyword ||
        item.customerName?.toLowerCase().includes(keyword) ||
        item.message?.toLowerCase().includes(keyword) ||
        String(item.table || "")
          .toLowerCase()
          .includes(keyword);

      return matchesRating && matchesSearch;
    });
  }, [feedbacks, ratingFilter, search]);

  const formatDate = (date) => {
    if (!date) return "Just now";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRatingText = (rating) => {
    if (rating >= 5) return "Excellent";
    if (rating === 4) return "Very Good";
    if (rating === 3) return "Average";
    if (rating === 2) return "Needs Work";
    return "Poor";
  };

  return (
    <div className="min-h-screen bg-[#f7f2ea] text-gray-900">
      <main className="max-w-[1500px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col gap-5 mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 mb-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#d97707]">
              <MessageSquareText size={16} />
              Customer Experience
            </p>

            <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] text-gray-950">
              Feedback & Ratings
            </h1>

            <p className="max-w-2xl mt-3 text-sm leading-7 text-gray-500">
              Track customer reviews, table feedback, low ratings, and overall
              dining satisfaction for The White House Café.
            </p>
          </div>

          <button
            onClick={fetchFeedbacks}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-extrabold text-white transition rounded-2xl bg-[#d97707] hover:bg-[#b45309] shadow-sm"
          >
            <RefreshCcw size={17} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-7 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Average Rating"
            value={stats.average}
            subtitle="Overall customer score"
            icon={<Star size={22} />}
          />

          <StatCard
            title="Total Feedback"
            value={stats.total}
            subtitle="Reviews submitted"
            icon={<MessageSquareText size={22} />}
          />

          <StatCard
            title="5 Star Reviews"
            value={stats.fiveStar}
            subtitle="Best experiences"
            icon={<Star size={22} />}
          />

          <StatCard
            title="Low Ratings"
            value={stats.lowRating}
            subtitle="Need attention"
            icon={<Filter size={22} />}
          />
        </div>

        <div className="p-4 bg-white border border-orange-100 shadow-sm mb-7 rounded-3xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, table, or message..."
                className="w-full py-3 pl-12 pr-4 text-sm font-semibold border border-gray-100 outline-none rounded-2xl bg-orange-50/40 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {["all", 5, 4, 3, 2, 1].map((item) => (
                <button
                  key={item}
                  onClick={() => setRatingFilter(item)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.12em] transition ${
                    ratingFilter === item
                      ? "bg-[#d97707] text-white shadow-sm"
                      : "bg-white border border-orange-100 text-gray-500 hover:text-[#d97707] hover:bg-orange-50"
                  }`}
                >
                  {item === "all" ? (
                    "All"
                  ) : (
                    <>
                      {item}
                      <Star size={13} />
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-56 bg-white border border-orange-100 shadow-sm rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center bg-white border border-orange-100 shadow-sm rounded-3xl">
            <div className="flex items-center justify-center w-16 h-16 mb-5 rounded-full bg-orange-50 text-[#d97707]">
              <MessageSquareText size={30} />
            </div>

            <h2 className="text-2xl font-black tracking-tight text-gray-900">
              No feedback found
            </h2>

            <p className="max-w-md mt-3 text-sm leading-7 text-gray-500">
              Customer feedback will appear here once guests submit reviews from
              the thank-you page.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {filteredFeedbacks.map((feedback, index) => (
              <motion.div
                key={feedback._id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.035 }}
                className="relative overflow-hidden bg-white border border-orange-100 shadow-sm rounded-3xl"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#d97707] via-[#e6b85c] to-[#d97707]" />

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-50 text-[#d97707]">
                        <UserRound size={19} />
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-gray-950">
                          {feedback.customerName || "Guest Customer"}
                        </h3>

                        <p className="text-[11px] font-bold text-gray-400">
                          {feedback.table
                            ? `Table ${feedback.table}`
                            : "Table not available"}
                        </p>
                      </div>
                    </div>

                    {role === "admin" && (
                      <button
                        onClick={() => deleteFeedback(feedback._id)}
                        className="inline-flex items-center justify-center text-red-500 transition w-9 h-9 rounded-xl hover:bg-red-50"
                      >
                        <Trash2 size={17} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 p-3 mb-4 rounded-2xl bg-[#fff7ed] border border-orange-100">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <Star
                          key={num}
                          size={17}
                          className={
                            num <= Number(feedback.rating)
                              ? "fill-[#d97707] text-[#d97707]"
                              : "text-orange-200"
                          }
                        />
                      ))}
                    </div>

                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] rounded-full bg-white text-[#d97707] border border-orange-100">
                      {getRatingText(Number(feedback.rating))}
                    </span>
                  </div>

                  <p className="min-h-[84px] text-sm leading-7 text-gray-600">
                    {feedback.message?.trim()
                      ? feedback.message
                      : "No written message was added by the customer."}
                  </p>

                  <div className="flex items-center gap-2 pt-4 mt-4 border-t border-gray-100">
                    <Clock size={14} className="text-gray-400" />
                    <p className="text-[11px] font-bold text-gray-400">
                      {formatDate(feedback.createdAt)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="relative p-5 overflow-hidden bg-white border border-orange-100 shadow-sm rounded-3xl">
      <div className="absolute right-[-35px] top-[-35px] w-24 h-24 rounded-full bg-orange-100/70" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-950">
            {value}
          </h2>

          <p className="mt-1 text-xs font-semibold text-gray-500">{subtitle}</p>
        </div>

        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-50 text-[#d97707]">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default AdminFeedback;
