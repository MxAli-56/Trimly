-- Understanding File Structure --

backend/
├── config/         # db.js, env configs
├── model/         # Mongoose Schemas (Collection Blueprints)
├── controller/    # Route Logic
├── route/         # Endpoints
├── middleware/    # Auth, Validation Bouncers
├── validation/    # Joi Schema Rules
├── services/       # Heavy Business Logic (Tokens, Payments)
├── utils/          # Helpers (API Response format)
├── scripts/        # Seeder scripts
├── app.js
└