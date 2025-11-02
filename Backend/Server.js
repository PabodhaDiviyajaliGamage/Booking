import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import path from "path";

import trendrouter from "./router/trendingRouter.js";
import loginrouter from "./controller/logincontroller.js";

const app = express();
const PORT = process.env.PORT || 4000;

// -------------------- 1. DATABASE CONNECTION --------------------
connectDB().catch(console.error);

// -------------------- 2. GLOBAL MIDDLEWARE --------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5237",
  "https://ceejeey.me",
  "https://api.emailjs.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS not allowed for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug logger
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.path);
  next();
});

// -------------------- 3. ROUTES --------------------
app.use("/api/admin", loginrouter);
app.use("/api/trending", trendrouter);

// -------------------- 4. ROOT --------------------
app.get("/", (req, res) => res.send("API working on Vercel 🚀"));

// -------------------- 5. TIMEOUT HANDLING --------------------
app.use((req, res, next) => {
    // Set timeout to 8 seconds (Vercel's limit is 10s)
    req.setTimeout(8000, () => {
        res.status(504).json({
            success: false,
            message: 'Request timeout'
        });
    });
    next();
});

// -------------------- 6. ERROR HANDLING --------------------
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Handle specific errors
    if (err.name === 'PayloadTooLargeError') {
        return res.status(413).json({
            success: false,
            message: 'Payload too large'
        });
    }
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    // Default error response
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        code: err.code,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// -------------------- 7. NOT FOUND HANDLER --------------------
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// -------------------- 8. EXPORT --------------------
export default app;
