import mongoose from 'mongoose';

export const connectDB = async ()=> {
  try {
    const conn = await mongoose.connect(`${process.env.MONGODB_URI}`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`MongoDB connected ! : DB Host : ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};