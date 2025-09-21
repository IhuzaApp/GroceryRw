# System Logs Cleanup

This document describes the automatic cleanup system for system logs to prevent database bloat.

## Overview

The system automatically deletes system logs older than 24 hours to maintain optimal database performance and reduce storage costs.

## Components

### 1. API Endpoint
- **File**: `pages/api/cleanup/system-logs-cleanup.ts`
- **Method**: POST
- **Purpose**: Deletes logs older than 24 hours
- **Authentication**: Optional (via `CLEANUP_API_TOKEN`)

### 2. Cleanup Script
- **File**: `scripts/cleanup-logs.js`
- **Purpose**: Standalone script for manual cleanup
- **Usage**: Can be run manually or scheduled as cron job

### 3. Vercel Cron Job
- **Schedule**: Daily at 2:00 AM UTC (`0 2 * * *`)
- **Purpose**: Automatic cleanup in production
- **Configuration**: Defined in `vercel.json`

## Usage

### Manual Cleanup

#### Local Development
```bash
# Run cleanup script locally
npm run cleanup:logs

# Run with custom API URL
API_BASE_URL=http://localhost:3000 npm run cleanup:logs
```

#### Production
```bash
# Run cleanup script against production
npm run cleanup:logs:prod

# Run with custom API URL
API_BASE_URL=https://your-domain.vercel.app npm run cleanup:logs
```

### API Endpoint

#### Direct API Call
```bash
# Local
curl -X POST http://localhost:3000/api/cleanup/system-logs-cleanup

# Production (with authentication)
curl -X POST https://your-domain.vercel.app/api/cleanup/system-logs-cleanup \
  -H "Authorization: Bearer YOUR_CLEANUP_TOKEN"
```

#### Response Format
```json
{
  "success": true,
  "deletedCount": 1250,
  "message": "Successfully deleted 1250 logs older than 24 hours",
  "timestamp": "2024-01-15T02:00:00.000Z"
}
```

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `CLEANUP_API_TOKEN` | Authentication token for API | No | None |
| `API_BASE_URL` | Base URL for API calls | No | `http://localhost:3000` |

### Vercel Configuration

The cron job is configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cleanup/system-logs-cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

## Monitoring

### Log Output

The cleanup script provides detailed logging:

```
[2024-01-15T02:00:00.000Z] 🧹 Starting system logs cleanup...
[2024-01-15T02:00:00.100Z] 📡 Calling cleanup API: http://localhost:3000/api/cleanup/system-logs-cleanup
[2024-01-15T02:00:00.500Z] ✅ Cleanup successful!
[2024-01-15T02:00:00.500Z] 📊 Deleted 1250 logs
[2024-01-15T02:00:00.500Z] 💬 Successfully deleted 1250 logs older than 24 hours
[2024-01-15T02:00:00.500Z] 🎯 Cleanup completed at 2024-01-15T02:00:00.500Z
```

### Error Handling

The system handles various error scenarios:

- **Database Connection Issues**: Logs error and exits gracefully
- **Authentication Failures**: Returns 401 status
- **No Old Logs**: Returns success with 0 deleted count
- **API Timeouts**: 30-second timeout with retry logic

## Database Impact

### Before Cleanup
- **Logs Table**: Contains all logs (potentially millions)
- **Query Performance**: Slower due to large dataset
- **Storage Usage**: High due to accumulated logs

### After Cleanup
- **Logs Table**: Only contains logs from last 24 hours
- **Query Performance**: Improved due to smaller dataset
- **Storage Usage**: Reduced significantly

## Security Considerations

### Authentication
- Optional token-based authentication
- Set `CLEANUP_API_TOKEN` environment variable
- API validates token before processing

### Rate Limiting
- Consider implementing rate limiting for production
- Monitor API usage to prevent abuse

### Logging
- All cleanup operations are logged
- Failed operations include error details
- Timestamps for audit trail

## Troubleshooting

### Common Issues

#### 1. Authentication Error
```
Error: Unauthorized
```
**Solution**: Set `CLEANUP_API_TOKEN` environment variable

#### 2. Database Connection Error
```
Error: Hasura client is not initialized
```
**Solution**: Check database connection and environment variables

#### 3. API Timeout
```
Error: Request timeout
```
**Solution**: Check network connectivity and API availability

### Debug Mode

Enable debug logging by setting environment variable:
```bash
DEBUG=true npm run cleanup:logs
```

## Maintenance

### Regular Tasks
- Monitor cleanup job execution
- Review deleted log counts
- Adjust cleanup frequency if needed
- Update authentication tokens

### Performance Monitoring
- Track database size reduction
- Monitor query performance improvements
- Check API response times

## Future Enhancements

### Potential Improvements
- **Retention Policies**: Configurable retention periods
- **Selective Cleanup**: Clean specific log types
- **Metrics**: Detailed cleanup statistics
- **Notifications**: Alert on cleanup failures
- **Backup**: Archive logs before deletion

### Configuration Options
- **Retention Period**: Make 24-hour limit configurable
- **Batch Size**: Process logs in smaller batches
- **Schedule**: Multiple cleanup schedules
- **Filters**: Clean specific log types or components
