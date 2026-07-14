export const initialCartState = {
  items: [],
};

export function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_TICKET": {
      const newTicket = action.payload;

      const existingItem = state.items.find((item) => {
        return item.sessionId === newTicket.sessionId;
      });

      if (!existingItem) {
        return {
          ...state,
          items: [...state.items, newTicket],
        };
      }

      const mergedSeats = [
        ...new Set([
          ...existingItem.seats,
          ...newTicket.seats,
        ]),
      ];

      const updatedItems = state.items.map((item) => {
        if (item.sessionId === newTicket.sessionId) {
          return {
            ...item,
            seats: mergedSeats,
          };
        }

        return item;
      });

      return {
        ...state,
        items: updatedItems,
      };
    }

    case "REMOVE_TICKET": {
      const itemId = action.payload;

      return {
        ...state,
        items: state.items.filter((item) => {
          return item.id !== itemId;
        }),
      };
    }

    case "CLEAR_CART": {
      return {
        ...state,
        items: [],
      };
    }

    default: {
      return state;
    }
  }
}