import { createContext, useState } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // ADD ITEM
  const addToCart = (product) => {
    setCart((prevCart) => {
      const exist = prevCart.find(
        (item) => String(item._id) === String(product._id),
      );

      if (exist) {
        return prevCart.map((item) =>
          String(item._id) === String(product._id)
            ? { ...item, qty: item.qty + 1 }
            : item,
        );
      }

      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  // DECREASE ITEM
  const removeItem = (id) => {
    console.log("REMOVE CLICKED:", id);

    setCart((prevCart) => {
      const exist = prevCart.find((item) => String(item._id) === String(id));

      if (!exist) return prevCart;

      // if qty becomes 0 remove item
      if (exist.qty === 1) {
        return prevCart.filter((item) => String(item._id) !== String(id));
      }

      return prevCart.map((item) =>
        String(item._id) === String(id) ? { ...item, qty: item.qty - 1 } : item,
      );
    });
  };

  // REMOVE ITEM COMPLETELY
  const deleteItem = (id) => {
    setCart((prevCart) =>
      prevCart.filter((item) => String(item._id) !== String(id)),
    );
  };

  // CLEAR CART
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeItem,
        deleteItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
