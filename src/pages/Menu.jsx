import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext.jsx";
import ExpandableText from "../components/ExpandableText";
import { Filter, X } from "lucide-react";
import socket from "../socket/socket";
import "./menu.css";
import toast from "react-hot-toast";

function Menu() {
  const [menu, setMenu] = useState([]);
  const [showCards, setShowCards] = useState(false);
  const [table, setTable] = useState(null);
  const [category, setCategory] = useState("all");

  const [showFilter, setShowFilter] = useState(false);
  const [renderFilter, setRenderFilter] = useState(false);

  const { cart, addToCart, removeItem, clearCart } = useContext(CartContext);

  const { token: tokenFromUrl } = useParams();
  const navigate = useNavigate();

  const token = tokenFromUrl || localStorage.getItem("token");

  /* ================= VERIFY SESSION ================= */
  useEffect(() => {
    if (!token) {
      toast.error("FoodDash: Please scan QR first");

      setTimeout(() => {
        navigate("/scan");
      }, 1200);

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
        toast.error("FoodDash: Session expired. Scan again");

        localStorage.removeItem("token");
        localStorage.removeItem("table");
        clearCart();

        setTimeout(() => {
          navigate("/scan");
        }, 1200);
      });
  }, [token]);

  /* ================= REAL-TIME SESSION EXPIRE ================= */
  useEffect(() => {
    const currentTable = localStorage.getItem("table");

    socket.on("session-expired", (data) => {
      // ✅ FIXED: backend sends table, not token
      if (data.table == currentTable) {
        toast.error("FoodDash: Session expired");

        localStorage.removeItem("token");
        localStorage.removeItem("table");
        clearCart();

        setTimeout(() => {
          navigate("/scan");
        }, 1200);
      }
    });

    return () => {
      socket.off("session-expired");
    };
  }, []);

  /* ================= FETCH MENU ================= */
  useEffect(() => {
    axios.get("https://fooadash.onrender.com/api/menu").then((res) => {
      setMenu(res.data);
    });
  }, []);

  /* ================= CARD ANIMATION ================= */
  useEffect(() => {
    setTimeout(() => setShowCards(true), 120);
  }, []);

  const getQty = (id) => {
    const item = cart.find((i) => i._id === id);
    return item ? item.qty : 0;
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  /* ================= CATEGORY ================= */
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

  /* ================= FILTER ================= */
  const openFilter = () => {
    setRenderFilter(true);
    setTimeout(() => setShowFilter(true), 10);
  };

  const closeFilter = () => {
    setShowFilter(false);
    setTimeout(() => setRenderFilter(false), 500);
  };

  return (
    <div className="min-h-screen text-gray-900 bg-gray-100 dark:bg-slate-950 dark:text-gray-200">
      {/* HEADER */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm dark:bg-slate-900">
        <h1 className="text-xl font-bold">
          Cafe Menu — Table {table || "..."}
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={openFilter}
            className="p-2 border rounded-lg min-[1000px]:hidden"
          >
            <Filter size={18} />
          </button>

          <Link
            to="/cart"
            className="px-4 py-2 text-white rounded-lg bg-emerald-500"
          >
            Cart ({totalItems})
          </Link>
        </div>
      </div>

      {/* MOBILE FILTER */}
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

      {/* MAIN */}
      <div className="flex">
        {/* SIDEBAR */}
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
            {filteredMenu.map((item, index) => {
              const qty = getQty(item._id);
              const image = `https://fooadash.onrender.com/uploads/${item.image}`;

              return (
                <div
                  key={item._id}
                  style={{ transitionDelay: `${index * 50}ms` }}
                  className={`group bg-white dark:bg-slate-900 border rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                    showCards ? "opacity-100" : "opacity-0 translate-y-10"
                  }`}
                >
                  <img
                    src={image}
                    className="object-cover w-full h-48 transition-transform duration-500 group-hover:scale-110"
                  />

                  <div className="flex flex-col gap-3 p-4">
                    <h2 className="font-bold">{item.name}</h2>

                    <ExpandableText
                      text={item.description || "No description"}
                    />

                    <p className="font-semibold text-emerald-500">
                      ₹{item.price}
                    </p>

                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(item)}
                        className="py-2 text-white rounded-lg bg-emerald-500"
                      >
                        Add
                      </button>
                    ) : (
                      <div className="flex justify-between px-3 py-2 bg-gray-100 rounded-lg dark:bg-slate-800">
                        <button onClick={() => removeItem(item._id)}>-</button>
                        <span>{qty}</span>
                        <button onClick={() => addToCart(item)}>+</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FLOATING CART */}
      {cart.length > 0 && (
        <Link
          to="/cart"
          className="fixed px-6 py-3 text-white rounded-full shadow-lg bottom-6 right-6 bg-emerald-500"
        >
          View Cart ({totalItems})
        </Link>
      )}
    </div>
  );
}

export default Menu;
