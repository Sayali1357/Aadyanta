import { MongoClient, Db } from 'mongodb';

class MongoDBService {
    private client: MongoClient | null = null;
    private db: Db | null = null;
    private connecting: Promise<void> | null = null;

    async connect(): Promise<Db> {
        if (this.db) {
            return this.db;
        }

        if (this.connecting) {
            await this.connecting;
            return this.db!;
        }

        this.connecting = this.performConnect();
        await this.connecting;
        return this.db!;
    }

    private async performConnect(): Promise<void> {
        const uri = import.meta.env.VITE_MONGODB_URI;

        if (!uri) {
            throw new Error('MongoDB URI not configured. Please add VITE_MONGODB_URI to .env file');
        }

        try {
            this.client = new MongoClient(uri);
            await this.client.connect();
            this.db = this.client.db('career-launch-ai');
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('MongoDB connection error:', error);
            this.connecting = null;
            throw error;
        }
    }

    async getCollection<T = any>(name: string) {
        const db = await this.connect();
        return db.collection<T>(name);
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
            this.connecting = null;
            console.log('Disconnected from MongoDB');
        }
    }
}

export const mongoService = new MongoDBService();

// Collection names
export const COLLECTIONS = {
    USERS: 'users',
    ROADMAPS: 'roadmaps',
    USER_PROGRESS: 'user_progress',
    COMPLETED_TOPICS: 'completed_topics',
} as const;
