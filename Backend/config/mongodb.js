import mongoose from "mongoose";

let cachedConnection = null;
let isConnecting = false;
let connectionAttempts = 0;
const MAX_RETRIES = 3;

const connectDB = async () => {
    try {
        if (isConnecting) {
            console.log("Connection already in progress");
            await new Promise(resolve => setTimeout(resolve, 1000));
            return connectDB();
        }

        if (cachedConnection) {
            if (mongoose.connection.readyState === 1) {
                console.log("Using cached database connection");
                return cachedConnection;
            }
            cachedConnection = null;
        }

        isConnecting = true;
        connectionAttempts++;

        const opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 10000,
            bufferCommands: false,
            maxPoolSize: 10,
            retryWrites: true,
            retryReads: true,
            w: "majority"
        };

        // Validate MongoDB URL
        if (!process.env.MONGO_URL) {
            throw new Error('MongoDB URL is not defined');
        }

        mongoose.connection.on('connected', () => {
            console.log("Database connected successfully");
            connectionAttempts = 0;
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            if (err.name === 'MongoNetworkError') {
                cachedConnection = null;
                if (connectionAttempts < MAX_RETRIES) {
                    console.log(`Retrying connection... Attempt ${connectionAttempts}`);
                    return connectDB();
                }
            }
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            cachedConnection = null;
        });

        const conn = await mongoose.connect(process.env.MONGO_URL, opts);
        cachedConnection = conn;

        // Add keep-alive mechanism
        setInterval(() => {
            if (mongoose.connection.readyState === 1) {
                mongoose.connection.db.admin().ping();
            }
        }, 30000);

        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        
        if (error.name === 'MongoServerSelectionError') {
            throw new Error('Unable to connect to MongoDB. Please check your connection string and network.');
        }
        
        if (connectionAttempts < MAX_RETRIES) {
            console.log(`Retrying connection... Attempt ${connectionAttempts}`);
            isConnecting = false;
            await new Promise(resolve => setTimeout(resolve, 1000 * connectionAttempts));
            return connectDB();
        }

        throw error;
    } finally {
        isConnecting = false;
    }
};

export default connectDB;