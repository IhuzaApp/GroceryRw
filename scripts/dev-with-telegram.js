const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 Starting development environment with Telegram bot...");

// Start Next.js development server
const nextDev = spawn("yarn", ["dev"], {
  stdio: "inherit",
  shell: true,
  cwd: process.cwd(),
});

// Start Telegram bot (for local development only)
const telegramBot = spawn("node", ["bot.js"], {
  stdio: "inherit",
  shell: true,
  cwd: process.cwd(),
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down development environment...");
  nextDev.kill("SIGINT");
  telegramBot.kill("SIGINT");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down development environment...");
  nextDev.kill("SIGTERM");
  telegramBot.kill("SIGTERM");
  process.exit(0);
});

// Handle child process errors
nextDev.on("error", (error) => {
  console.error("❌ Next.js error:", error);
});

telegramBot.on("error", (error) => {
  console.error("❌ Telegram bot error:", error);
});

console.log("✅ Development environment started!");
console.log("📱 Next.js: http://localhost:3000");
console.log("🤖 Telegram bot: Running in polling mode");
console.log("📝 Press Ctrl+C to stop both processes");
