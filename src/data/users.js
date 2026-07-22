// Mutable mock user store — register() pushes new entries at runtime.
// Sprint 2 (1.2.1) genişletmesi: username, phone, gender alanları eklendi.
export const users = [
  {
    id: 1,
    firstName: "Ömer Faruk",
    lastName: "Çendek",
    name: "Ömer Faruk", // backward-compat (Layout header uses `user.name`)
    username: "omerfaruk",
    email: "omer@cineseat.com",
    password: "Admin1!", // Mock data for testing
    phone: "",
    gender: "",
    role: "admin",
  },
  {
    id: 2,
    firstName: "Kaan",
    lastName: "Sezer",
    name: "Kaan Sezer",
    username: "kaansezer",
    email: "kaan@cineseat.com",
    password: "Test12",
    phone: "",
    gender: "",
    role: "member",
  },
  {
    id: 3,
    firstName: "Alptuğ",
    lastName: "Dursun",
    name: "Alptuğ",
    username: "alptug",
    email: "alptug@cineseat.com",
    password: "Test12",
    phone: "",
    gender: "",
    role: "member",
  },
  {
    id: 4,
    firstName: "Berke",
    lastName: "Kuş",
    name: "Berke",
    username: "berke",
    email: "berke@cineseat.com",
    password: "Test12",
    phone: "",
    gender: "",
    role: "member",
  },
];
