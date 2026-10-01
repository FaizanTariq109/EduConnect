import { MongoMemoryReplSet } from "mongodb-memory-server";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import mongoose from "mongoose";
import { connect } from "../src/db/db";
import { seedDemo } from "./demo-data";
async function main() {
  const db = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  process.env.MONGO_URI = db.getUri("educonnect_synthetic");
  process.env.JWT_SECRET = randomBytes(48).toString("hex");
  await connect();
  await seedDemo();
  await mongoose.disconnect();
  const child = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      process.argv.includes("--production") ? "start" : "dev",
      "-p",
      "3008",
    ],
    { env: process.env, stdio: "inherit" },
  );
  const stop = async () => {
    child.kill();
    await db.stop();
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  child.once("exit", async () => {
    await db.stop();
    process.exitCode = child.exitCode ?? 0;
  });
  console.log(
    "Isolated synthetic replica set ready. App: http://localhost:3008. Data is removed when this helper stops.",
  );
}
main().catch(() => {
  console.error("Isolated demo startup failed.");
  process.exitCode = 1;
});
