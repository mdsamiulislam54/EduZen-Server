import createCors from "cors";
import { envVars } from "./env";

export const cors = createCors({
  origin: function (origin, callback) {
    const allowedOrigins = [envVars.FRONTEND_URL, "http://localhost:3000"];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

