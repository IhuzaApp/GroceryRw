#!/usr/bin/env node

/**
 * Redis Connection Debugger
 * Run: node scripts/debug-redis.js
 */

require("dotenv").config();
const Redis = require("ioredis");

console.log("🔍 Redis Connection Debugger\n");
console.log("=".repeat(60));

// Get REDIS_URL from environment
const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  console.error("❌ REDIS_URL not found in environment variables");
  console.log("\n📝 Please set REDIS_URL in your .env file:");
  console.log("   Format examples:");
  console.log("   - redis://localhost:6379");
  console.log("   - redis://:password@host:port");
  console.log("   - rediss://:password@host:port (for SSL/TLS)");
  process.exit(1);
}

console.log("✅ REDIS_URL found");
console.log(`📍 URL: ${REDIS_URL.replace(/:[^:@]+@/, ":****@")}`); // Hide password

// Parse the URL to understand the configuration
const url = new URL(REDIS_URL);
const protocol = url.protocol.replace(":", "");
const hasPassword = !!url.password;
const hostname = url.hostname;
const port = url.port || 6379;

console.log("\n📊 Connection Details:");
console.log(`   Protocol: ${protocol}`);
console.log(`   Hostname: ${hostname}`);
console.log(`   Port: ${port}`);
console.log(`   Has Password: ${hasPassword ? "✅ Yes" : "❌ No"}`);
console.log(`   Requires TLS: ${protocol === "rediss" ? "✅ Yes" : "❌ No"}`);

console.log("\n" + "=".repeat(60));

// Test configurations
const configs = [
  {
    name: "Basic Connection (No TLS)",
    config: {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      lazyConnect: true,
      enableOfflineQueue: false,
    },
  },
  {
    name: "With TLS (rejectUnauthorized: false)",
    config: {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      lazyConnect: true,
      enableOfflineQueue: false,
      tls: {
        rejectUnauthorized: false,
      },
    },
  },
  {
    name: "With TLS (rejectUnauthorized: true)",
    config: {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      lazyConnect: true,
      enableOfflineQueue: false,
      tls: {
        rejectUnauthorized: true,
      },
    },
  },
  {
    name: "Plain Connection (Force no TLS)",
    config: {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      lazyConnect: true,
      enableOfflineQueue: false,
      tls: undefined,
    },
    url: REDIS_URL.replace("rediss://", "redis://"), // Force redis:// protocol
  },
];

async function testConnection(name, url, config) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log("─".repeat(60));

  let client;
  try {
    client = new Redis(url, config);

    // Try to connect
    await client.connect();
    console.log("✅ Connection successful!");

    // Try a PING command
    const start = Date.now();
    const result = await client.ping();
    const latency = Date.now() - start;
    console.log(`✅ PING successful: ${result} (${latency}ms)`);

    // Try to set and get a value
    await client.set("test:key", "test:value", "EX", 10);
    const value = await client.get("test:key");
    console.log(`✅ SET/GET successful: ${value}`);

    // Get server info
    const info = await client.info("server");
    const version = info.match(/redis_version:([^\r\n]+)/)?.[1];
    console.log(`✅ Redis Version: ${version}`);

    console.log("\n🎉 THIS CONFIGURATION WORKS! Use this in your app.");

    await client.quit();
    return true;
  } catch (error) {
    console.log("❌ Connection failed:", error.message);

    // Provide specific error hints
    if (error.message.includes("wrong version number")) {
      console.log("💡 Hint: TLS mismatch. Try different TLS configuration.");
    } else if (error.message.includes("ECONNREFUSED")) {
      console.log("💡 Hint: Server not reachable. Check host/port.");
    } else if (error.message.includes("authentication")) {
      console.log("💡 Hint: Wrong password or auth required.");
    } else if (error.message.includes("timeout")) {
      console.log("💡 Hint: Connection timeout. Check network/firewall.");
    }

    if (client) {
      try {
        await client.quit();
      } catch (e) {
        // Ignore quit errors
      }
    }
    return false;
  }
}

async function runTests() {
  console.log("\n🚀 Starting connection tests...\n");

  for (const test of configs) {
    const url = test.url || REDIS_URL;
    const success = await testConnection(test.name, url, test.config);

    if (success) {
      console.log("\n" + "=".repeat(60));
      console.log("✅ WORKING CONFIGURATION FOUND!");
      console.log("=".repeat(60));
      console.log("\n📋 Update your src/lib/redisClient.ts with:");
      console.log(
        "\nredis = new Redis(REDIS_URL, " +
          JSON.stringify(test.config, null, 2) +
          ");"
      );
      break;
    }

    // Wait a bit between tests to avoid connection issues
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Debug complete!");
  console.log("=".repeat(60));
  process.exit(0);
}

// Run the tests
runTests().catch((error) => {
  console.error("\n❌ Unexpected error:", error);
  process.exit(1);
});
