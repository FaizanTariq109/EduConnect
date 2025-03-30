import mongoose from 'mongoose';

export async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    const connection = mongoose.connection;
    connection.on("connected", () => { console.log("Connected to MongoDB") });
    connection.on("error", console.error.bind(console, "connection error:"));
  } catch (error) {
    console.log(error)
  }
}
