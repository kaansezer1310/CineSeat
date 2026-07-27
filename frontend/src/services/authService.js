import { users } from "../data/users.js";

export const authService = {
  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(
          (u) => u.email === email && u.password === password
        );

        if (user) {
          const userWithoutPassword = { ...user };
          delete userWithoutPassword.password;
          resolve(userWithoutPassword);
        } else {
          reject(new Error("E-posta veya şifre hatalı."));
        }
      }, 500);
    });
  },

  register: async (data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const emailExists = users.some(
          (u) => u.email.toLowerCase() === data.email.toLowerCase()
        );
        if (emailExists) {
          reject(new Error("Bu e-posta adresi zaten kayıtlı."));
          return;
        }

        const usernameExists = users.some(
          (u) => u.username.toLowerCase() === data.username.toLowerCase()
        );
        if (usernameExists) {
          reject(new Error("Bu kullanıcı adı zaten kullanılıyor."));
          return;
        }

        const newUser = {
          id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
          firstName: data.firstName,
          lastName: data.lastName,
          name: `${data.firstName} ${data.lastName}`.trim(),
          username: data.username,
          email: data.email,
          password: data.password,
          phone: data.phone || "",
          gender: data.gender || "",
          role: "member",
        };

        users.push(newUser);

        const userWithoutPassword = { ...newUser };
        delete userWithoutPassword.password;
        resolve(userWithoutPassword);
      }, 500);
    });
  },
};
