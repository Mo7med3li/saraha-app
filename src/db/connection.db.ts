import mongoose from "mongoose";
import dns from "dns";

const connectionMongoDB = async () => {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    await mongoose.connect(process.env.DB_URI as string);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.log("Error connecting to MongoDB ❌", error);
  }
};

export default connectionMongoDB;
