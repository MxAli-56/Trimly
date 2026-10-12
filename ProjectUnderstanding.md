-- Understanding File Structure --

backend/
├── config/         # db.js, env configs
├── enums/          # Constants / Enums
├── models/         # Mongoose Schemas (Collection Blueprints)
├── controllers/    # Route Logic
├── routes/         # Endpoints
├── middlewares/    # Auth, Validation Bouncers
├── validations/    # Joi Schema Rules
├── services/       # Heavy Business Logic (Tokens, Payments)
├── utils/          # Helpers (API Response format)
├── scripts/        # Seeder scripts
├── app.js
└