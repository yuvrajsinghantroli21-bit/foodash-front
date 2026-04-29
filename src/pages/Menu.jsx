import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext.jsx";
import ExpandableText from "../components/ExpandableText";
import socket from "../socket/socket";
import toast from "react-hot-toast";
import img from "../../public/plate.png";
import StickyHeader from "../components/StickyHeader";
import AddToCartButton from "../components/AddToCartButton";
import {
  Filter,
  X,
  UtensilsCrossed,
  LayoutGrid,
  ChevronUp,
  ShoppingCart,
} from "lucide-react";

const API = "https://fooadash.onrender.com/api";

/* ── Thin decorative divider used inside cards ── */
const Divider = () => (
  <div className="flex items-center justify-center gap-2 my-1">
    <div className="w-6 h-[1px] bg-amber-400" />
    <span className="text-sm text-amber-500">🌿</span>
    <div className="w-6 h-[1px] bg-amber-400" />
  </div>
);

/* ── Dynamic category icon ── */
const CategoryIcon = ({
  cat,
  categoryIcons,
  active = false,
  small = false,
}) => {
  if (cat === "all") {
    return <LayoutGrid size={small ? 13 : 15} />;
  }

  const iconSvg = categoryIcons[cat?.toLowerCase()];

  if (!iconSvg) {
    return <UtensilsCrossed size={small ? 13 : 15} />;
  }

  return (
    <span
      className={`flex items-center justify-center shrink-0 ${
        small ? "w-4 h-4" : "w-5 h-5"
      } ${active ? "text-white" : "text-current"}`}
      dangerouslySetInnerHTML={{ __html: iconSvg }}
    />
  );
};

function Menu() {
  const [menu, setMenu] = useState([]);
  const [table, setTable] = useState(null);
  const [category, setCategory] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [renderFilter, setRenderFilter] = useState(false);
  const [showScroll, setShowScroll] = useState(false);

  const [vegOnly, setVegOnly] = useState(false);

  // ✅ NEW: DB categories
  const [dbCategories, setDbCategories] = useState([]);

  const { cart, addToCart, removeItem, clearCart } = useContext(CartContext);
  const { token: tokenFromUrl } = useParams();
  const navigate = useNavigate();

  const token = tokenFromUrl || localStorage.getItem("token");

  /* ── Scroll-to-top visibility ── */
  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!token) {
      toast.error("FoodDash: Please scan QR first");
      setTimeout(() => navigate("/thank-you"), 1200);
      return;
    }
    axios
      .get(`https://fooadash.onrender.com/api/session/${token}`)
      .then((res) => {
        setTable(res.data.table);
        if (tokenFromUrl) {
          localStorage.setItem("table", res.data.table);
          localStorage.setItem("token", token);
        }
      })
      .catch(() => {
        toast.error("Session expired. Please scan again.");
        localStorage.removeItem("token");
        localStorage.removeItem("table");
        clearCart();
        navigate("/thank-you");
      });
  }, [token]);

  /* ── Real-time session expiry ── */
  useEffect(() => {
    const handleSessionExpire = (data) => {
      const currentToken = localStorage.getItem("token");

      if (data.token === currentToken) {
        toast.error("Session expired");

        clearCart();
        localStorage.removeItem("token");
        localStorage.removeItem("table");

        setTimeout(() => {
          navigate("/thank-you");
        }, 1200);
      }
    };

    socket.on("session-expired", handleSessionExpire);

    return () => {
      socket.off("session-expired", handleSessionExpire);
    };
  }, [clearCart, navigate]);

  /* ── Fetch menu ── */
  useEffect(() => {
    axios.get(`${API}/menu`).then((res) => {
      setMenu(res.data);
    });
  }, []);

  /* ── Fetch dynamic categories ── */
  useEffect(() => {
    axios
      .get(`${API}/categories`)
      .then((res) => {
        setDbCategories(res.data || []);
      })
      .catch(() => {
        console.log("Could not fetch categories");
      });
  }, []);

  /* ── Category icon lookup ── */
  const categoryIcons = dbCategories.reduce((acc, cat) => {
    acc[cat.name?.toLowerCase()] = cat.iconSvg;
    return acc;
  }, {});

  /* ── Derived categories ── */
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

  const countByCategory = (cat) =>
    cat === "all" ? menu.length : menu.filter((i) => i.category === cat).length;

  const filteredMenu = menu.filter((item) => {
    const categoryMatch = category === "all" || item.category === category;
    const vegMatch = !vegOnly || item.foodType === "veg";

    return categoryMatch && vegMatch;
  });

  const getQty = (id) => {
    const item = cart.find((i) => i._id === id);
    return item ? item.qty : 0;
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  /* ── Filter drawer ── */
  const openFilter = () => {
    setRenderFilter(true);
    setTimeout(() => setShowFilter(true), 10);
  };

  const closeFilter = () => {
    setShowFilter(false);
    setTimeout(() => setRenderFilter(false), 400);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f0e8" }}>
      {/* <StickyHeader table={table} totalItems={totalItems} /> */}

      {/* HERO SECTION */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: "#f5f0e8" }}
      >
        <div className="flex flex-col items-center max-w-6xl gap-6 px-4 py-10 mx-auto md:flex-row sm:px-6 lg:px-8">
          <div className="flex-1 order-1 md:order-2 flex items-center justify-center relative select-none min-h-[220px] sm:min-h-[280px] md:min-h-[320px] px-1">
            <img
              src={img}
              alt="Cafe Menu"
              className="w-[220px] sm:w-[280px] md:w-[340px] lg:w-[400px] xl:w-[440px] h-auto object-contain drop-shadow-xl"
            />
          </div>

          <div className="flex-1 order-2 text-center md:order-1 md:text-left">
            <p className="text-emerald-600 text-xs tracking-[0.3em] uppercase font-semibold">
              • Table {table || "..."} •
            </p>

            <h1
              className="mt-2 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Cafe Menu
            </h1>

            <div className="flex items-center justify-center gap-3 mt-3 md:justify-start">
              <div className="w-10 h-[1px] bg-amber-400" />
              <span className="text-lg text-amber-500">🌿</span>
              <div className="w-10 h-[1px] bg-amber-400" />
            </div>

            <p className="max-w-xs mx-auto mt-4 text-sm leading-relaxed text-gray-500 sm:max-w-sm md:mx-0">
              Browse our menu, add items to your cart, and place your order —
              all from your table.
            </p>
          </div>
        </div>
      </div>

      {/* MENU SECTION */}
      <div className="px-4 py-6 pb-24 mx-auto max-w-7xl">
        <div className="p-5 bg-white shadow-xl rounded-3xl">
          {/* Category Tabs + Filter Button */}
          <div className="flex items-center justify-center mb-6 md:justify-between">
            <div className="flex-wrap hidden gap-2 md:flex">
              {categories.map((cat) => {
                const active = category === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${
                      active
                        ? "bg-emerald-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <CategoryIcon
                      cat={cat}
                      categoryIcons={categoryIcons}
                      active={active}
                    />
                    <span className="capitalize">{cat}</span>
                  </button>
                );
              })}

              {/* Veg Filter */}
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`relative w-[120px] h-[42px] rounded-full p-1 border shadow-sm transition-all duration-500
                ${
                  vegOnly
                    ? "bg-emerald-500 border-emerald-500"
                    : "bg-white border-gray-200"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-[54px] h-[32px] rounded-full shadow transition-all duration-500
                  ${
                    vegOnly
                      ? "translate-x-[56px] bg-white"
                      : "translate-x-0 bg-emerald-500"
                  }`}
                />

                <span className="relative z-10 flex items-center justify-between h-full px-3 text-xs font-semibold">
                  <span className={!vegOnly ? "text-white" : "text-white/80"}>
                    All
                  </span>

                  <span
                    className={vegOnly ? "text-emerald-600" : "text-gray-500"}
                  >
                    Veg
                  </span>
                </span>
              </button>
            </div>

            <button
              onClick={openFilter}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-300 border rounded-full shadow-sm hover:shadow-md hover:bg-emerald-50 text-emerald-700 border-emerald-300"
            >
              <Filter size={16} />
              Filter
            </button>
          </div>

          {/* Drawer Filter */}
          {renderFilter && (
            <div
              className="fixed inset-0 z-50 flex bg-black/40"
              onClick={closeFilter}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className={`w-72 h-full bg-white p-5 overflow-y-auto shadow-2xl transform transition-transform duration-300
                ${showFilter ? "translate-x-0" : "-translate-x-full"}`}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold">Categories</h2>
                  <button
                    onClick={closeFilter}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {categories.map((cat) => {
                    const active = category === cat;

                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setCategory(cat);
                          closeFilter();
                        }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl capitalize text-sm transition
                        ${
                          active
                            ? "bg-emerald-500 text-white font-medium"
                            : "hover:bg-gray-100 text-gray-600"
                        }`}
                      >
                        <CategoryIcon
                          cat={cat}
                          categoryIcons={categoryIcons}
                          active={active}
                        />
                        <span>{cat}</span>
                        <span className="ml-auto text-xs opacity-60">
                          ({countByCategory(cat)})
                        </span>
                      </button>
                    );
                  })}

                  {/* Veg Filter */}
                  <button
                    onClick={() => setVegOnly(!vegOnly)}
                    className={`relative w-[120px] h-[42px] rounded-full p-1 border shadow-sm transition-all duration-500 mt-3
                    ${
                      vegOnly
                        ? "bg-emerald-500 border-emerald-500"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-[54px] h-[32px] rounded-full shadow transition-all duration-500
                      ${
                        vegOnly
                          ? "translate-x-[56px] bg-white"
                          : "translate-x-0 bg-emerald-500"
                      }`}
                    />

                    <span className="relative z-10 flex items-center justify-between h-full px-3 text-xs font-semibold">
                      <span
                        className={!vegOnly ? "text-white" : "text-white/80"}
                      >
                        All
                      </span>

                      <span
                        className={
                          vegOnly ? "text-emerald-600" : "text-gray-500"
                        }
                      >
                        Veg
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Menu Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredMenu.map((item) => {
              const qty = getQty(item._id);
              const image = item.image;

              const isVeg = item.foodType !== "nonveg";
              const badge = item.badge;
              const isAvailable = item.available !== false;

              return (
                <div
                  key={item._id}
                  className="flex flex-col overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-md rounded-2xl hover:shadow-xl hover:-translate-y-1"
                >
                  {/* IMAGE */}
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img
                      src={image}
                      alt={item.name}
                      className={`object-cover w-full h-full transition-transform duration-700 group-hover:scale-110 ${
                        !isAvailable ? "opacity-50 grayscale" : ""
                      }`}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />

                    {/* BADGE */}
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
                              letterSpacing: "0.03em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span
                              className="relative flex items-center justify-center rounded-full shrink-0"
                              style={{
                                width: 18,
                                height: 18,
                                background: c.iconBg,
                                color: c.iconColor,
                                fontSize: 10,
                              }}
                            >
                              {badge === "new" && (
                                <span
                                  className="absolute inset-0 rounded-full animate-ping"
                                  style={{
                                    background: "#86efac",
                                    opacity: 0.5,
                                  }}
                                />
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
                              Unavailable
                            </span>
                          </div>
                        </div>
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

                    {/* Dynamic category pill */}
                    {item.category && isAvailable && (
                      <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-semibold tracking-widest uppercase text-white/90 bg-black/35 backdrop-blur-sm rounded-full border border-white/10">
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
                      className="text-[17px] sm:text-[18px] font-extrabold text-gray-900 leading-snug"
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
                        className="text-[13px] leading-relaxed text-gray-500"
                      />
                    </div>

                    <div className="my-3">
                      <Divider />
                    </div>

                    {/* PRICE */}
                    <div className="flex flex-col items-center justify-end mt-auto">
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

                          <div className="text-2xl font-extrabold leading-none text-emerald-600">
                            ₹{item.salePrice}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="invisible mb-2 text-sm">
                            placeholder
                          </div>

                          <div className="text-2xl font-extrabold leading-none text-emerald-600">
                            ₹{item.price}
                          </div>
                        </>
                      )}
                    </div>

                    {/* BUTTON */}
                    <div className="mt-4">
                      <AddToCartButton
                        item={item}
                        qty={qty}
                        isAvailable={isAvailable}
                        addToCart={addToCart}
                        removeItem={removeItem}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {filteredMenu.length === 0 && (
            <div className="py-24 text-center text-gray-400">
              <UtensilsCrossed size={40} className="mx-auto mb-3 opacity-30" />
              <p>No items found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* FLOATING CART */}
      {cart.length > 0 && (
        <Link
          to="/cart"
          className="fixed z-50 flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all rounded-full shadow-lg bottom-6 right-6 bg-emerald-500 hover:bg-emerald-600 active:scale-95"
        >
          <ShoppingCart size={18} />
          View Cart ({totalItems})
        </Link>
      )}

      {/* SCROLL TO TOP */}
      {showScroll && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed z-50 flex items-center justify-center text-white transition-all duration-200 rounded-full shadow-lg bottom-6 left-6 w-11 h-11 bg-emerald-500 hover:bg-emerald-600"
        >
          <ChevronUp size={20} />
        </button>
      )}
    </div>
  );
}

export default Menu;
