# ✂️ Trimly

**Trimly** is a multi-role, real-time salon and barbershop management and appointment engine built for mobile platforms. It connects customers, barbers, and salon owners into a unified ecosystem, eliminating booking friction and managing real-time queue integrity.

## 🏗️ Tech Stack & Architecture

**Backend:**
- Node.js & Express.js
- MongoDB Atlas (Mongoose ODM)
- Architecture Pattern: **Layered Monolith** (Routes -> Controllers -> Services -> Repositories -> Models)
- Auth: JWT (Stateless Access + Stateful Refresh)
- Async Processing: BullMQ (Redis) for AI Hairstyle, n8n for Webhooks

**Frontend:**
- React Native (Mobile App - Customer/Barber/Owner)
- React.js (Admin Web Panel)

**Third-Party Integrations:**
- Firebase Authentication (Phone OTP)
- OpenStreetMap / MapLibre (Salon Discovery)
- Cloudinary (Image Uploads)
- DeepInfra (AI Vision & Sentiment)
- JazzCash / Easypaisa (Sandbox Payments)

## 📁 Folder Structure
```text
trimly/
├── backend/          # Node.js Express API
│   ├── config/       # DB, env, roles, SMS
│   ├── controller/   # Route logic
│   ├── middleware/   # Auth, RBAC, Validation
│   ├── model/        # Mongoose schemas
│   ├── repository/   # Database queries
│   ├── route/        # API endpoints
│   ├── services/     # Business logic
│   ├── validation/   # Joi schemas
│   ├── utils/        # Helpers (phone formatter, etc.)
│   └── scripts/      # Database seeders
├── frontend/         # React Native app
└── admin-web/        # React.js Admin panel (Coming Soon)

🚀 How to Run (Local Development)

Prerequisites

Node.js (v18+)
MongoDB Atlas Account (or local MongoDB)
Firebase Project (for Phone OTP testing)

Backend Setup

Clone the repository:
git clone https://github.com/your-org/Trimly.git
cd Trimly/backend

Install dependencies:
npm install

Environment Variables:
Create a .env file in the backend/ folder. Required variables:
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_ACCESS_SECRET=your_jwt_secret
JWT_ACCESS_EXPIRY=Write the time of Expiry
REFRESH_TOKEN_EXPIRY_DAYS=Write the numbers of Days
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

Seed the Database: (Test Data)
node scripts/seedTestData.js
This creates test users for all roles (Admin, Owner, Barber, Customer).

Start the server:
npm run dev

The API will run on http://localhost:5000. Check the health endpoint at /api/v1/health.

🎨 Figma Prototype
https://www.figma.com/design/wH3R31ladWCAnqU3LsSp8C/Trimly-UIs?node-id=0-1&p=f&t=nZ7NFywZCkeM2AI8-0
