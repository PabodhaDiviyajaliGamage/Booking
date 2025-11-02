import app from './Server.js';

// Vercel serverless function handler
export default async function handler(req, res) {
    try {
        // Connect to database if needed
        await import('./config/mongodb.js').then(module => module.default());
        
        // Handle the request
        return new Promise((resolve, reject) => {
            app(req, res, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            code: error.code || 'INTERNAL_SERVER_ERROR'
        });
    }
}

// Development server
if (process.env.NODE_ENV === 'development') {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`Development server running on port ${PORT}`);
    });
}

// Global error handlers
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION!');
    console.error('Error:', err);
    // Don't exit process in production
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
});

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION!');
    console.error('Error:', err);
    // Don't exit process in production
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
});