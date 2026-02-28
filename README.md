# 🛠️ CollabEd Server — Backend for Collaborative Learning

Welcome to the **CollabEd Server**, the RESTful backend for the CollabEd platform. It powers user management, session approvals, secure payments, Firebase authentication, and real-time data handling via MongoDB and Express.

---

## 🔐 Admin Credentials

- **Username:** `admin2@collabed.com`  
- **Password:** `Tr1234567890`

> These credentials are used for testing and admin-level access.

---

## 🌐 Live Website

👉 [Visit CollabEd Live Site](https://collab-ed-679be.web.app/)

---

## 🚀 Features

- 🔐 **Firebase Admin Auth:** Middleware-based JWT validation & email matching.
- 👤 **User Management:** Register, promote to roles (Admin, Tutor, Student).
- 🎓 **Session Management:** Tutors create sessions, admins approve/reject.
- 📤 **Upload Materials:** Tutors upload documents and media.
- 📅 **Booking System:** Students book study sessions securely.
- 💳 **Stripe Payment Integration:** Handles secure payments via Stripe API.
- 📝 **Notes API:** Create, update, and delete personal notes.
- ⭐ **Reviews & Ratings:** Students review sessions post-booking.
- 📊 **Admin Dashboard:** View all users, sessions, and materials,Payment History.
- 📁 **RESTful API Structure:** Clean and scalable endpoint design.

---

## ⚙️ Tech Stack & Dependencies

| Package | Purpose |
|--------|---------|
| `express` | Web server & API routing |
| `mongodb` | NoSQL database to store users, sessions, bookings |
| `firebase-admin` | Token verification & admin role control |
| `stripe` | Payment gateway integration |
| `cors` | Handle cross-origin requests |
| `dotenv` | Environment variable management |

---

