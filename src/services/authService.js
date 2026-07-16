import { users } from "../data/users.js";

export const authService = {
  login: async (email, password) => {
    // Simulating network delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(
          (u) => u.email === email && u.password === password
        );

        if (user) {
          // Do not send password to the client state
          const userWithoutPassword = { ...user };
          delete userWithoutPassword.password;
          resolve(userWithoutPassword);
        } else {
          // REQ-21: Hatalı girişte alan belirtmeyen genel hata
          reject(new Error("E-posta veya şifre hatalı."));
        }
      }, 500);
    });
  },
};
