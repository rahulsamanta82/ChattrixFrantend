// import { create } from "zustand";
// import { axiosInstance } from "../lib/axios.js";
// import toast from "react-hot-toast";
// import { io } from "socket.io-client";

// const BASE_URL =
//   import.meta.env.MODE === "development"
//     ? "http://localhost:5000"
//     : "/";

// export const useAuthStore = create((set, get) => ({
//   authUser: null,
//   isSigningUp: false,
//   isLoggingIn: false,
//   isUpdatingProfile: false,
//   isCheckingAuth: true,
//   onlineUsers: [],
//   socket: null,

//   // ================= CHECK AUTH =================
//   checkAuth: async () => {
//     try {
//       const res = await axiosInstance.get("/auth/check");
//       set({ authUser: res.data || null });

//       get().connectSocket();
//     } catch (error) {
//       set({ authUser: null });
//       console.log("CheckAuth Error:", error.response?.data || error.message);
//     } finally {
//       set({ isCheckingAuth: false });
//     }
//   },

//   // ================= SIGNUP =================
//   signup: async (data) => {
//     set({ isSigningUp: true });
//     try {
//       // ✅ FIX: correct payload mapping
//       const payload = {
//         fullName: data.fullName,
//         email: data.email,
//         password: data.password,
//       };

//       const res = await axiosInstance.post("/auth/signup", payload);

//       set({ authUser: res.data || null });
//       toast.success("Account created successfully");

//       get().connectSocket();
//     } catch (error) {
//       console.log("Signup Error:", error.response?.data || error.message);
//       toast.error(error.response?.data?.message || "Signup failed");
//     } finally {
//       set({ isSigningUp: false });
//     }
//   },

//   // ================= LOGIN =================
//   login: async (data) => {
//     set({ isLoggingIn: true });
//     try {
//       const res = await axiosInstance.post("/auth/login", data);

//       set({ authUser: res.data });
//       toast.success("Logged in successfully");

//       get().connectSocket();
//     } catch (error) {
//       console.log("Login Error:", error.response?.data || error.message);
//       toast.error(error.response?.data?.message || "Login failed");
//     } finally {
//       set({ isLoggingIn: false });
//     }
//   },

//   // ================= LOGOUT =================
//   logout: async () => {
//     try {
//       await axiosInstance.post("/auth/logout");

//       set({ authUser: null });
//       toast.success("Logged out successfully");

//       get().disconnectSocket();
//     } catch (error) {
//       console.log("Logout Error:", error.response?.data || error.message);
//       toast.error(error.response?.data?.message || "Logout failed");
//     }
//   },

//   // ================= UPDATE PROFILE =================
//   updateProfile: async (data) => {
//     set({ isUpdatingProfile: true });
//     try {
//       const res = await axiosInstance.put("/auth/update-profile", data);

//       set({ authUser: res.data || get().authUser });
//       toast.success("Profile updated successfully");
//     } catch (error) {
//       console.log("Update Profile Error:", error.response?.data || error.message);
//       toast.error(error.response?.data?.message || "Profile update failed");
//     } finally {
//       set({ isUpdatingProfile: false });
//     }
//   },

//   // ================= SOCKET CONNECT =================
//   connectSocket: () => {
//     const { authUser } = get();

//     if (!authUser || get().socket?.connected) return;

//     const socket = io(BASE_URL, {
//       query: {
//         userId: authUser._id,
//       },
//     });

//     socket.connect();

//     set({ socket });

//     socket.on("getOnlineUsers", (userIds) => {
//       set({ onlineUsers: userIds });
//     });
//   },

//   // ================= SOCKET DISCONNECT =================
//   disconnectSocket: () => {
//     if (get().socket?.connected) {
//       get().socket.disconnect();
//     }
//   },
// }));


















import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// ✅ FIXED BASE URL (works in dev + production)
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://chattrixbackend.onrender.com";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // ================= CHECK AUTH =================
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data || null });

      get().connectSocket();
    } catch (error) {
      // ✅ Silent fail (401 is normal if not logged in)
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // ================= SIGNUP =================
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      };

      const res = await axiosInstance.post("/auth/signup", payload);

      set({ authUser: res.data || null });
      toast.success("Account created successfully");

      // ✅ ensure auth state + socket
      await get().checkAuth();
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  // ================= LOGIN =================
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);

      set({ authUser: res.data });
      toast.success("Logged in successfully");

      // ✅ ensure auth state + socket
      await get().checkAuth();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // ================= LOGOUT =================
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");

      set({ authUser: null });
      toast.success("Logged out successfully");

      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  // ================= UPDATE PROFILE =================
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);

      set({ authUser: res.data || get().authUser });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // ================= SOCKET CONNECT =================
  connectSocket: () => {
    const { authUser } = get();

    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
      withCredentials: true,
      transports: ["websocket"],
    });

    socket.connect();

    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  // ================= SOCKET DISCONNECT =================
  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket.disconnect();
    }
  },
}));