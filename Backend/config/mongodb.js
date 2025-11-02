import mongoose from "mongoose";

let cachedConnection = null;

const connectDB = async () => {
    if (cachedConnection) {
        console.log("Using cached database connection");
        return cachedConnection;
    }

    try {
        // Increase timeout for Vercel serverless environment
        const opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            bufferCommands: false,
            maxPoolSize: 10
        };

        mongoose.connection.on('connected', () => {
            console.log("Database connected successfully");
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            if (process.env.NODE_ENV === 'production') {
                // In production, don't exit process on error
                console.error('Production environment - continuing despite error');
            }
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            cachedConnection = null;
        });

        const conn = await mongoose.connect(process.env.MONGO_URL, opts);
        cachedConnection = conn;

        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        if (process.env.NODE_ENV === 'production') {
            // In production, return error instead of exiting
            throw error;
        } else {
            process.exit(1);
        }
    }
};

export default connectDB;