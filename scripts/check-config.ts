import mongoose from "mongoose";
import { connect } from "../src/db/db";
import { secret } from "../src/server/security";
import { Slot, Review } from "../src/server/models";
async function main() {
  secret();
  await connect();
  await mongoose.connection.db!.admin().ping();
  const hello = await mongoose.connection.db!.admin().command({ hello: 1 });
  if (!hello.setName && hello.msg !== "isdbgrid")
    throw new Error("Replica set or sharded cluster required.");
  const slots = await Slot.collection.indexes();
  const reviews = await Review.collection.indexes();
  if (
    !slots.some((i) => i.unique && i.key.owner === 1 && i.key.time === 1) ||
    !reviews.some((i) => i.unique && i.key.sessionId === 1)
  )
    throw new Error(
      "Required unique indexes are missing; run the synthetic seed first.",
    );
  console.log(
    "PASS: database ping, transaction-capable topology, required unique indexes and JWT configuration. No secret values were printed.",
  );
}
main()
  .catch(() => {
    console.error(
      "Configuration check failed. Check your new database credentials, network access, JWT secret and seed/index setup locally. No secret values were printed.",
    );
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
