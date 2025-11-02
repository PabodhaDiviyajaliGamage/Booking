import express from "express";
import cors from "cors";
import "dotenv/config";
import helmet from "helmet";
import compression from "compression";
import connectDB from "./config/mongodb.js";
import path from "path";

import {
    limiter,
    errorHandler,
    timeoutMiddleware,
    bodyParserErrorHandler,
    notFoundHandler,
    securityHeaders
} from './middleware/errorHandling.js';

import trendrouter from "./router/trendingRouter.js";
import loginrouter from "./controller/logincontroller.js";

const app = express();
const PORT = process.env.PORT || 4000;

// -------------------- 1. SECURITY MIDDLEWARE --------------------
app.use(helmet());
app.use(securityHeaders);
app.use(compression());

// -------------------- 2. DATABASE CONNECTION --------------------
connectDB().catch(console.error);

// -------------------- 3. REQUEST PARSING --------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParserErrorHandler);

// -------------------- 4. CORS & SECURITY --------------------
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5237",
    "https://ceejeey.me",
    "https://api.emailjs.com",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy violation'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400 // CORS preflight cache for 24 hours
}));

// -------------------- 5. RATE LIMITING --------------------
app.use('/api/', limiter);

// -------------------- 6. REQUEST TIMEOUT --------------------
app.use(timeoutMiddleware);

// -------------------- 7. LOGGING --------------------
if (process.env.NODE_ENV !== 'test') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// -------------------- 8. ROUTES --------------------
app.use("/api/admin", loginrouter);
app.use("/api/trending", trendrouter);

// -------------------- 9. ROOT --------------------
app.get("/", (req, res) => {
    res.json({
        status: 'success',
        message: 'API working on Vercel 🚀',
        timestamp: new Date().toISOString()
    });
});

// -------------------- 10. ERROR HANDLING --------------------
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
