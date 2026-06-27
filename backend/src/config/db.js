import mongoose from "mongoose";
import dns from "dns";

// Force Google and Cloudflare DNS to resolve MongoDB Atlas SRV query records properly
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
   
    
    console.log(`📡  MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`🔴  MongoDB Connection Error: ${error.message}`);
     
    process.exit(1);
  }
};

export default connectDB;


