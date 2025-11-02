import rateLimit from 'express-rate-limit';
import { CustomError } from '../utils/errors.js';

// Rate limiter configuration
export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        status: 429,
        error: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            code: err.code
        });
    }

    // Handle specific error types
    switch (err.name) {
        case 'ValidationError':
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: Object.values(err.errors).map(e => e.message)
            });

        case 'JsonWebTokenError':
        case 'TokenExpiredError':
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });

        case 'PayloadTooLargeError':
            return res.status(413).json({
                success: false,
                message: 'Request payload too large'
            });

        case 'MongoError':
            if (err.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: 'Duplicate entry found'
                });
            }
            break;
    }

    // Default server error
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Request timeout middleware
export const timeoutMiddleware = (req, res, next) => {
    const timeout = 8000; // 8 seconds
    req.setTimeout(timeout, () => {
        const error = new CustomError('Request timeout', 504);
        next(error);
    });
    next();
};

// Body parser error handler
export const bodyParserErrorHandler = (err, req, res, next) => {
    if (err instanceof SyntaxError && err.type === 'entity.parse.failed') {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON'
        });
    }
    next(err);
};

// Not found handler
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Requested resource not found'
    });
};

// Security headers middleware
export const securityHeaders = (req, res, next) => {
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    });
    next();
};