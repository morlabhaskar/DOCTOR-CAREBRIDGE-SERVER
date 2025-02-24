import mongoose from "mongoose";

const connectDB = async () => {

    mongoose.connection.on('connected',()=> console.log("Database is Connected"))

    await mongoose.connect(`${process.env.MONGO_URL}`)

    // try {
    //     await mongoose.connect(process.env.MONGO_URI, {
    //       useNewUrlParser: true,
    //       useUnifiedTopology: true,
    //       serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    //     });
    
    //     console.log("MongoDB Connected...");
    //   } catch (error) {
    //     console.error("MongoDB Connection Error:", error);
    //   }
}
export default connectDB
