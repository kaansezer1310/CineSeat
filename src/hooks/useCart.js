import { useContext } from "react";

import { CartContext } from "../context/CartContext.jsx";

function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart, CartProvider içerisinde kullanılmalıdır."
    );
  }

  return context;
}

export default useCart;