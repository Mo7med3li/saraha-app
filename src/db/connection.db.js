import mongoose from "mongoose";
import dns from "dns";

const connectionMongoDB = async () => {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    // it is undefined?
    console.log("DB_URI", process.env.DB_URI);
    await mongoose.connect(process.env.DB_URI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.log("Error connecting to MongoDB ❌", error);
  }
};

export default connectionMongoDB;
