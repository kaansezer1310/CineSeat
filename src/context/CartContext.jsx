import {
  createContext,
  useReducer,
} from "react";

import {
  cartReducer,
  initialCartState,
} from "./cartReducer.js";

export const CartContext = createContext(null);

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(
    cartReducer,
    initialCartState
  );

  const cartStore = {
    state,
    dispatch,
  };

  return (
    <CartContext.Provider value={cartStore}>
      {children}
    </CartContext.Provider>
  );
}

export default CartProvider;