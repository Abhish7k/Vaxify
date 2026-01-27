export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "STAFF" | "ADMIN";
  phone?: string;
  createdAt: string;
};

export const data: AdminUser[] = [
  {
    id: "u1",
    name: "Abhishek B",
    email: "abhishek@gmail.com",
    role: "ADMIN",
    phone: "9999999999",
    createdAt: "2025-12-01",
  },
  {
    id: "u2",
    name: "Rohit Sharma",
    email: "rohit@gmail.com",
    role: "USER",
    phone: "8888888888",
    createdAt: "2025-12-10",
  },
  {
    id: "u3",
    name: "Sneha Patil",
    email: "sneha@gmail.com",
    role: "STAFF",
    createdAt: "2025-12-12",
  },
];
