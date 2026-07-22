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

  /**
   * Sprint 2 / 1.2.1 — Yeni kullanıcı kaydı.
   * @param {Object} data - Kayıt formu verileri
   * @returns {Promise<Object>} Oluşturulan kullanıcı (password hariç)
   */
  register: async (data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // E-posta benzersizlik kontrolü
        const emailExists = users.some(
          (u) => u.email.toLowerCase() === data.email.toLowerCase()
        );
        if (emailExists) {
          reject(new Error("Bu e-posta adresi zaten kayıtlı."));
          return;
        }

        // Kullanıcı adı benzersizlik kontrolü
        const usernameExists = users.some(
          (u) => u.username.toLowerCase() === data.username.toLowerCase()
        );
        if (usernameExists) {
          reject(new Error("Bu kullanıcı adı zaten kullanılıyor."));
          return;
        }

        // Yeni kullanıcı oluştur
        const newUser = {
          id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
          firstName: data.firstName,
          lastName: data.lastName,
          name: `${data.firstName} ${data.lastName}`.trim(), // backward-compat
          username: data.username,
          email: data.email,
          password: data.password,
          phone: data.phone || "",
          gender: data.gender || "",
          role: "member", // Yeni kayıt her zaman member
        };

        // Mock store'a ekle (runtime — sayfa yenilenince sıfırlanır)
        users.push(newUser);

        // Password olmadan döndür
        const userWithoutPassword = { ...newUser };
        delete userWithoutPassword.password;
        resolve(userWithoutPassword);
      }, 500);
    });
  },
};
