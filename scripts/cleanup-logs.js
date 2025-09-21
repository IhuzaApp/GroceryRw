#!/usr/bin/env node

/**
 * System Logs Cleanup Script
 * 
 * This script deletes system logs older than 24 hours to prevent database bloat.
 * Can be run manually or scheduled as a cron job.
 * 
 * Usage:
 * - Manual: node scripts/cleanup-logs.js
 * - Cron: 0 2 * * * /path/to/node /path/to/scripts/cleanup-logs.js
 * 
 * Environment Variables:
 * - CLEANUP_API_TOKEN: Optional authentication token
 * - API_BASE_URL: Base URL for API calls (defaults to localhost)
 */

const https = require('https');
const http = require('http');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const CLEANUP_ENDPOINT = '/api/cleanup/system-logs-cleanup';
const CLEANUP_TOKEN = process.env.CLEANUP_API_TOKEN;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(CLEANUP_TOKEN && { 'Authorization': `Bearer ${CLEANUP_TOKEN}` })
      },
      ...options
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function cleanupSystemLogs() {
  try {
    log('🧹 Starting system logs cleanup...', 'cyan');
    
    const url = `${API_BASE_URL}${CLEANUP_ENDPOINT}`;
    log(`📡 Calling cleanup API: ${url}`, 'blue');
    
    const response = await makeRequest(url);
    
    if (response.status === 200 && response.data.success) {
      log(`✅ Cleanup successful!`, 'green');
      log(`📊 Deleted ${response.data.deletedCount} logs`, 'green');
      log(`💬 ${response.data.message}`, 'green');
      
      // Log statistics
      if (response.data.deletedCount > 0) {
        log(`🎯 Cleanup completed at ${response.data.timestamp}`, 'magenta');
      } else {
        log(`ℹ️  No old logs found to clean up`, 'yellow');
      }
      
      return true;
    } else {
      log(`❌ Cleanup failed!`, 'red');
      log(`📊 Status: ${response.status}`, 'red');
      log(`💬 Error: ${response.data.error || 'Unknown error'}`, 'red');
      return false;
    }
  } catch (error) {
    log(`💥 Cleanup error: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('🚀 System Logs Cleanup Script Started', 'bright');
  log(`🌐 API Base URL: ${API_BASE_URL}`, 'blue');
  log(`🔐 Authentication: ${CLEANUP_TOKEN ? 'Enabled' : 'Disabled'}`, 'blue');
  
  const success = await cleanupSystemLogs();
  
  if (success) {
    log('🎉 Script completed successfully!', 'green');
    process.exit(0);
  } else {
    log('💀 Script failed!', 'red');
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`💥 Uncaught Exception: ${error.message}`, 'red');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`💥 Unhandled Rejection at: ${promise}, reason: ${reason}`, 'red');
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { cleanupSystemLogs, makeRequest };
