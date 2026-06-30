require("dotenv/config");
const { execSync } = require("child_process");
console.log("Using direct URL:", process.env.DIRECT_URL);
execSync(`npx prisma db push --accept-data-loss --url="${process.env.DIRECT_URL}"`, { stdio: "inherit" });
