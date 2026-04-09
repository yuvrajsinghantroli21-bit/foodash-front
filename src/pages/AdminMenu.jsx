import { useEffect, useState } from "react";
import api from "../api/api";
import { Link } from "react-router-dom";
import { ChevronDown, Filter, X } from "lucide-react";
import Toast from "../components/Toast";
import { useLocation } from "react-router-dom";

function AdminMenu() {
  const [menu, setMenu] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [category, setCategory] = useState("all");

  const [showFilter, setShowFilter] = useState(false);
  const [renderFilter, setRenderFilter] = useState(false);
  const [toast, setToast] = useState(null);
  const location = useLocation();

  const fetchMenu = () => {
    api.get("/menu").then((res) => {
      setMenu(res.data);
    });
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  /* ✅ FILTER OPEN/CLOSE */
  const openFilter = () => {
    setRenderFilter(true);
    setTimeout(() => setShowFilter(true), 10);
  };

  const closeFilter = () => {
    setShowFilter(false);
    setTimeout(() => setRenderFilter(false), 300);
  };

  /* ✅ CATEGORIES */
  const categories = [
    "all",
    ...new Set(
      menu
        .map((item) => item.category)
        .filter((cat) => cat && cat.trim() !== ""),
    ),
  ];

  const countByCategory = (cat) => {
    if (cat === "all") return menu.length;
    return menu.filter((i) => i.category === cat).length;
  };

  const filteredMenu =
    category === "all"
      ? menu
      : menu.filter((item) => item.category === category);

  const deleteItem = (id) => {
    if (window.confirm("Delete this item?")) {
      api.delete(`/menu/${id}`).then(() => {
        fetchMenu();

        setToast({
          message: "Item deleted successfully ❌",
          type: "delete",
        });
      });
    }
  };

  useEffect(() => {
    if (location.state?.toast) {
      setToast(location.state.toast);

      // clear state (important)
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen text-gray-900 bg-gray-100 dark:bg-slate-950 dark:text-gray-200">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* HEADER */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm dark:bg-slate-900">
        <h1 className="text-xl font-bold">Admin Menu</h1>

        <div className="flex items-center gap-4">
          {/* ✅ SHOW ICON BELOW 1000px */}
          <button
            onClick={openFilter}
            className="p-2 border rounded-lg min-[1000px]:hidden"
          >
            <Filter size={18} />
          </button>

          <Link
            to="/admin/menu/add"
            className="px-4 py-2 text-white rounded-lg bg-emerald-500"
          >
            Add Item
          </Link>
        </div>
      </div>

      {/* 📱 FILTER DRAWER (≤1000px) */}
      {renderFilter && (
        <div
          className="fixed top-[64px] left-0 right-0 bottom-0 z-50 bg-black/40 backdrop-blur-sm flex"
          onClick={closeFilter}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-72 h-full bg-white dark:bg-slate-900 p-5 overflow-y-auto
            transform transition-transform duration-500 ease-in-out
            ${showFilter ? "translate-x-0" : "-translate-x-full"}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Filter</h2>
              <button onClick={closeFilter}>
                <X />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    closeFilter();
                  }}
                  className={`text-left px-3 py-2 rounded-lg capitalize ${
                    category === cat
                      ? "bg-emerald-500 text-white"
                      : "hover:bg-gray-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {cat} ({countByCategory(cat)})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="flex">
        {/* 💻 SIDEBAR ONLY ABOVE 1000px */}
        <div className="w-60 bg-white dark:bg-slate-900 border-r p-5 max-[1000px]:hidden">
          <h2 className="mb-4 font-bold">Filter</h2>

          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-left px-3 py-2 rounded-lg capitalize ${
                  category === cat
                    ? "bg-emerald-500 text-white"
                    : "hover:bg-gray-200 dark:hover:bg-slate-800"
                }`}
              >
                {cat} ({countByCategory(cat)})
              </button>
            ))}
          </div>
        </div>

        {/* MENU GRID */}
        <div className="flex-1 p-6 md:p-8">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredMenu.map((item) => (
              <div
                key={item._id}
                className="overflow-hidden transition-all duration-300 bg-white border shadow-lg group dark:bg-slate-900 rounded-2xl hover:-translate-y-2 hover:shadow-2xl"
              >
                <img
                  src={`https://fooadash.onrender.com/uploads/${item.image}`}
                  className="object-cover w-full h-48 transition-transform duration-500 group-hover:scale-110"
                />

                <div className="flex flex-col gap-3 p-4">
                  <h2 className="font-bold">{item.name}</h2>

                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm overflow-hidden transition-all ${
                        expanded === item._id ? "max-h-40" : "max-h-5"
                      }`}
                    >
                      {item.description || "No description"}
                    </p>

                    <button
                      onClick={() =>
                        setExpanded(expanded === item._id ? null : item._id)
                      }
                    >
                      <ChevronDown
                        size={18}
                        className={`transition ${
                          expanded === item._id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <p className="font-semibold text-emerald-500">
                    ₹{item.price}
                  </p>

                  <div className="flex justify-between mt-2">
                    <Link
                      to={`/admin/menu/edit/${item._id}`}
                      className="px-3 py-1 text-white bg-blue-500 rounded"
                    >
                      Update
                    </Link>

                    <button
                      onClick={() => deleteItem(item._id)}
                      className="px-3 py-1 text-white bg-red-500 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminMenu;
