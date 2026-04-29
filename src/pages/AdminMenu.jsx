import { useEffect, useState } from "react";
import api from "../api/api";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  Filter,
  X,
  Plus,
  Trash2,
  LayoutGrid,
  UtensilsCrossed,
  Pencil,
} from "lucide-react";
import Toast from "../components/Toast";
import ExpandableText from "../components/ExpandableText";

const CategoryIcon = ({ cat, categoryIcons, active = false }) => {
  if (cat === "all") return <LayoutGrid size={16} />;

  const iconSvg = categoryIcons[cat?.toLowerCase()];

  if (!iconSvg) return <UtensilsCrossed size={16} />;

  return (
    <span
      className={`flex items-center justify-center w-5 h-5 shrink-0 ${
        active ? "text-white" : "text-current"
      }`}
      dangerouslySetInnerHTML={{ __html: iconSvg }}
    />
  );
};

const Divider = () => (
  <div className="flex items-center justify-center gap-2 my-1">
    <div className="w-6 h-[1px] bg-amber-400" />
    <span className="text-sm text-amber-500">🌿</span>
    <div className="w-6 h-[1px] bg-amber-400" />
  </div>
);

function AdminMenu() {
  const [menu, setMenu] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [category, setCategory] = useState("all");

  const [dbCategories, setDbCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("");

  const [showFilter, setShowFilter] = useState(false);
  const [renderFilter, setRenderFilter] = useState(false);
  const [toast, setToast] = useState(null);

  const location = useLocation();

  const fetchMenu = () => {
    api.get("/menu").then((res) => {
      setMenu(res.data);
    });
  };

  const fetchCategories = () => {
    api.get("/categories").then((res) => {
      setDbCategories(res.data || []);
    });
  };

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (location.state?.toast) {
      setToast(location.state.toast);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const openFilter = () => {
    setRenderFilter(true);
    setTimeout(() => setShowFilter(true), 10);
  };

  const closeFilter = () => {
    setShowFilter(false);
    setTimeout(() => setRenderFilter(false), 300);
  };

  const categoryIcons = dbCategories.reduce((acc, cat) => {
    acc[cat.name?.toLowerCase()] = cat.iconSvg;
    return acc;
  }, {});

  const menuCategories = [
    ...new Set(
      menu
        .map((item) => item.category)
        .filter((cat) => cat && cat.trim() !== ""),
    ),
  ];

  const dbCategoryNames = dbCategories.map((cat) => cat.name);

  const categories = [
    "all",
    ...new Set([...dbCategoryNames, ...menuCategories]),
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

  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      setToast({
        message: "Category name is required",
        type: "error",
      });
      return;
    }

    await api.post("/categories", {
      name: newCategoryName.trim(),
      iconSvg: newCategoryIcon.trim(),
    });

    setNewCategoryName("");
    setNewCategoryIcon("");
    setShowAddCategory(false);
    fetchCategories();

    setToast({
      message: "Category added successfully ✅",
      type: "success",
    });
  };

  const deleteCategory = async (catName) => {
    if (catName === "all") return;

    const usedItems = menu.filter((item) => item.category === catName).length;

    if (usedItems > 0) {
      alert(
        `This category is used in ${usedItems} menu item(s). First change/delete those items.`,
      );
      return;
    }

    const dbCat = dbCategories.find(
      (cat) => cat.name?.toLowerCase() === catName.toLowerCase(),
    );

    if (!dbCat?._id) {
      alert("This category is not from database.");
      return;
    }

    if (window.confirm(`Delete category "${catName}"?`)) {
      await api.delete(`/categories/${dbCat._id}`);
      fetchCategories();

      if (category === catName) setCategory("all");

      setToast({
        message: "Category deleted successfully ❌",
        type: "delete",
      });
    }
  };

  const renderCategoryFilterList = (mobile = false) => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold">Filter</h2>

        <button
          onClick={() => setShowAddCategory(true)}
          className="flex items-center justify-center w-8 h-8 text-white transition rounded-full bg-emerald-500 hover:bg-emerald-600"
        >
          <Plus size={17} />
        </button>
      </div>

      {showAddCategory && (
        <div className="p-3 mb-3 border rounded-2xl bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name"
            className="w-full px-3 py-2 mb-2 text-sm border rounded-lg outline-none dark:bg-slate-900 dark:border-slate-700"
          />

          <textarea
            value={newCategoryIcon}
            onChange={(e) => setNewCategoryIcon(e.target.value)}
            placeholder="Paste SVG icon code"
            rows="3"
            className="w-full px-3 py-2 mb-2 text-sm border rounded-lg outline-none resize-none dark:bg-slate-900 dark:border-slate-700"
          />

          <div className="flex gap-2">
            <button
              onClick={addCategory}
              className="flex-1 py-2 text-sm font-semibold text-white rounded-lg bg-emerald-500"
            >
              Add
            </button>

            <button
              onClick={() => setShowAddCategory(false)}
              className="flex-1 py-2 text-sm font-semibold bg-gray-200 rounded-lg dark:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {categories.map((cat) => {
        const active = category === cat;

        return (
          <div key={cat} className="flex items-center gap-2">
            <button
              onClick={() => {
                setCategory(cat);
                if (mobile) closeFilter();
              }}
              className={`flex flex-1 items-center gap-2 px-3 py-2.5 rounded-xl capitalize text-sm transition ${
                active
                  ? "bg-emerald-500 text-white shadow"
                  : "hover:bg-gray-200 dark:hover:bg-slate-800"
              }`}
            >
              <CategoryIcon
                cat={cat}
                categoryIcons={categoryIcons}
                active={active}
              />

              <span className="truncate">{cat}</span>

              <span className="ml-auto text-xs opacity-70">
                ({countByCategory(cat)})
              </span>
            </button>

            {cat !== "all" && (
              <button
                onClick={() => deleteCategory(cat)}
                className="flex items-center justify-center w-8 h-8 text-red-500 transition rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );

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
      <div className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <h1 className="text-xl font-bold">Admin Menu</h1>

        <div className="flex items-center gap-4">
          <button
            onClick={openFilter}
            className="p-2 border rounded-lg min-[1000px]:hidden dark:border-slate-700"
          >
            <Filter size={18} />
          </button>

          <Link
            to="/admin/menu/add"
            className="px-4 py-2 text-white rounded-lg bg-emerald-500 hover:bg-emerald-600"
          >
            Add Item
          </Link>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {renderFilter && (
        <div
          className="fixed top-[64px] left-0 right-0 bottom-0 z-50 bg-black/40 backdrop-blur-sm flex"
          onClick={closeFilter}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-80 h-full bg-white dark:bg-slate-900 p-5 overflow-y-auto
            transform transition-transform duration-500 ease-in-out
            ${showFilter ? "translate-x-0" : "-translate-x-full"}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Categories</h2>
              <button onClick={closeFilter}>
                <X />
              </button>
            </div>

            {renderCategoryFilterList(true)}
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="flex">
        {/* DESKTOP SIDEBAR */}
        <div className="w-72 min-h-[calc(100vh-65px)] bg-white dark:bg-slate-900 border-r dark:border-slate-800 p-5 max-[1000px]:hidden">
          {renderCategoryFilterList(false)}
        </div>

        {/* MENU GRID */}
        <div className="flex-1 p-6 md:p-8">
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {filteredMenu.map((item) => {
              const isVeg = item.foodType !== "nonveg";
              const isAvailable = item.available !== false;
              const badge = item.badge;

              return (
                <div
                  key={item._id}
                  className="flex flex-col overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-md group rounded-2xl hover:shadow-xl hover:-translate-y-1"
                >
                  {/* IMAGE */}
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className={`object-cover w-full h-full transition-transform duration-700 group-hover:scale-110 ${
                        !isAvailable ? "opacity-50 grayscale" : ""
                      }`}
                    />

                    {/* Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />

                    {/* 🔥 PREMIUM BADGE (same as menu) */}
                    {badge &&
                      badge !== "none" &&
                      isAvailable &&
                      (() => {
                        const configs = {
                          bestseller: {
                            bg: "#7b1c1c",
                            text: "#ffd4d4",
                            iconBg: "#ffd4d4",
                            iconColor: "#7b1c1c",
                            icon: "★",
                            label: "Best Seller",
                          },
                          chef: {
                            bg: "#3d1f00",
                            text: "#ffd280",
                            iconBg: "#ffd280",
                            iconColor: "#3d1f00",
                            icon: "✦",
                            label: "Chef's Pick",
                          },
                          musttry: {
                            bg: "#6b2200",
                            text: "#ffb399",
                            iconBg: "#ffb399",
                            iconColor: "#6b2200",
                            icon: "▲",
                            label: "Must Try",
                          },
                          new: {
                            bg: "#0a3d1f",
                            text: "#86efac",
                            iconBg: "#86efac",
                            iconColor: "#0a3d1f",
                            icon: "◆",
                            label: "New Arrival",
                          },
                          limited: {
                            bg: "#2d1563",
                            text: "#c4b5fd",
                            iconBg: "#c4b5fd",
                            iconColor: "#2d1563",
                            icon: "⬡",
                            label: "Limited",
                          },
                        };

                        const c = configs[badge];
                        if (!c) return null;

                        return (
                          <span
                            className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full"
                            style={{
                              background: c.bg,
                              color: c.text,
                              padding: "5px 10px 5px 6px",
                              fontSize: 10,
                              fontWeight: 500,
                            }}
                          >
                            <span
                              className="relative flex items-center justify-center rounded-full"
                              style={{
                                width: 18,
                                height: 18,
                                background: c.iconBg,
                                color: c.iconColor,
                                fontSize: 10,
                              }}
                            >
                              {badge === "new" && (
                                <span className="absolute inset-0 bg-green-300 rounded-full opacity-50 animate-ping" />
                              )}
                              {c.icon}
                            </span>

                            {c.label}
                          </span>
                        );
                      })()}

                    {/* SOLD OUT */}
                    {!isAvailable && (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className="px-5 py-1.5 bg-gray-900/80 backdrop-blur-sm border border-white/20 rounded-full shadow-xl"
                            style={{ transform: "rotate(-12deg)" }}
                          >
                            <span className="text-xs font-black tracking-widest text-white uppercase">
                              Sold Out
                            </span>
                          </div>
                        </div>

                        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 text-[10px] font-bold text-white rounded-full bg-gray-900/80 backdrop-blur-md border border-white/10 shadow">
                          Sold Out
                        </span>
                      </>
                    )}

                    {/* VEG / NON-VEG */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <span
                        className={`hidden group-hover:flex px-2 py-0.5 text-[9px] font-bold rounded-full backdrop-blur border ${
                          isVeg
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-600 border-red-200"
                        }`}
                      >
                        {isVeg ? "VEG" : "NON-VEG"}
                      </span>

                      <span
                        className={`flex items-center justify-center w-6 h-6 bg-white border-2 rounded-md shadow ${
                          isVeg ? "border-emerald-400" : "border-red-400"
                        }`}
                      >
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isVeg ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                      </span>
                    </div>

                    {/* CATEGORY */}
                    {item.category && (
                      <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-semibold uppercase text-white/90 bg-black/30 backdrop-blur rounded-full border border-white/10">
                        <CategoryIcon
                          cat={item.category}
                          categoryIcons={categoryIcons}
                          active
                          small
                        />
                        {item.category}
                      </span>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="flex flex-col flex-1 p-5 text-center">
                    <h2
                      className="text-[17px] font-extrabold text-gray-900 dark:text-white"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {item.name}
                    </h2>

                    <div className="mt-2">
                      <ExpandableText
                        text={
                          item.description ||
                          "A delicious item crafted with care."
                        }
                        className="text-[13px] leading-relaxed text-gray-500 dark:text-gray-400"
                      />
                    </div>

                    <div className="my-3">
                      <Divider />
                    </div>

                    {/* PRICE */}
                    <div className="flex flex-col items-center mt-auto">
                      {item.salePrice ? (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-400 line-through">
                              ₹{item.price}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-bold text-red-600 bg-red-50 rounded-full">
                              SAVE ₹{item.price - item.salePrice}
                            </span>
                          </div>

                          <div className="text-2xl font-extrabold text-emerald-600">
                            ₹{item.salePrice}
                          </div>
                        </>
                      ) : (
                        <div className="text-2xl font-extrabold text-emerald-600">
                          ₹{item.price}
                        </div>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <Link
                        to={`/admin/menu/edit/${item._id}`}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-blue-500 rounded-xl hover:bg-blue-600"
                      >
                        Update
                      </Link>

                      <button
                        onClick={() => deleteItem(item._id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMenu.length === 0 && (
            <div className="py-24 text-center text-gray-400">
              <UtensilsCrossed size={40} className="mx-auto mb-3 opacity-30" />
              <p>No items found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminMenu;
