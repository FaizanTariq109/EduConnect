import mongoose from "mongoose";
import { connect } from "../src/db/db";
import { secret } from "../src/server/security";
import { seedDemo } from "./demo-data";
async function main() {
  if (!process.argv.includes("--confirm-synthetic"))
    throw new Error(
      "Use --confirm-synthetic only with your new synthetic demo database.",
    );
  secret();
  await connect();
  await seedDemo();
  console.log(
    "Synthetic demo accounts and required indexes are ready. Existing accounts and decisions were preserved.",
  );
}
main()
  .catch(() => {
    console.error(
      "Seeding failed. Check configuration, synthetic database access and index compatibility. No credentials are logged.",
    );
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
