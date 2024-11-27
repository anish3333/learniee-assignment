import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import messageRoutes from './routes/message.routes.js';
import { setupSocket } from './socket.js';

const app = express();
const httpServer = createServer(app);

// Connect to MongoDB
connectDB();

// Enable CORS with credentials and allowed headers


const CORS_ORIGIN = process.env.CLIENT_URL || process.env.LOCAL_URL || 'http://localhost:5173'
// Middleware
app.use(cors({
  origin: CORS_ORIGIN, 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Array notation is more explicit
  credentials: true,
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Access-Control-Allow-Credentials'
  ]
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Socket.io setup
setupSocket(httpServer);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Hello, World!')
});

export default app;
