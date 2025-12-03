# WebSocket Real-Time Chat - Quick Start Guide

This project now includes real-time chat functionality using AWS WebSocket API Gateway.

## What's New

- **Real-time messaging**: Messages are instantly broadcast to all connected clients
- **Connection management**: Active WebSocket connections tracked in DynamoDB
- **Message history**: All messages persisted with timestamps
- **Auto-reconnection**: Client automatically reconnects on disconnection
- **Visual feedback**: Connection status indicator in the UI

## Quick Deploy

### 1. Deploy Backend

```bash
cd backend/spa-sam-app
sam build
sam deploy --guided
```

**Important**: Note the `WebSocketURL` from the deployment outputs!

### 2. Configure Frontend

Edit `frontend/src/app/pages/messages/messages.component.ts` and update line 76:

```typescript
private websocketUrl = 'wss://YOUR-API-ID.execute-api.YOUR-REGION.amazonaws.com/Prod';
```

Replace with your actual WebSocket URL from step 1.

### 3. Deploy Frontend

```bash
cd frontend
npm install
npm run build
# Deploy the dist/ folder to your hosting service (S3, Amplify, etc.)
```

## Test It Out

1. Open the application in multiple browser tabs
2. Send a message in one tab
3. Watch it appear instantly in all other tabs! 🎉

## Architecture

```
Browser ←→ WebSocket API Gateway ←→ Lambda Functions ←→ DynamoDB
```

**WebSocket Routes:**
- `$connect` - New client connection
- `$disconnect` - Client disconnection  
- `$default` - Message broadcasting

**Lambda Functions:**
- `WebSocketConnectFunction` - Store connection ID
- `WebSocketDisconnectFunction` - Remove connection ID
- `WebSocketMessageFunction` - Save message & broadcast to all clients

**DynamoDB Tables:**
- `ItemsTable` - Message history (existing, now with timestamps)
- `ConnectionsTable` - Active WebSocket connections (new)

## Features

✅ Real-time bi-directional communication
✅ Message broadcasting to all connected clients
✅ Persistent message history
✅ Connection status indicator
✅ Automatic reconnection (up to 5 attempts)
✅ Manual connect/disconnect controls
✅ Timestamp display for messages
✅ CloudWatch logging for debugging

## Compatibility

The WebSocket implementation is fully compatible with the existing HTTP-based API:
- `/items` POST endpoint still works for sending messages
- `/items` GET endpoint still works for fetching message history
- No breaking changes to existing functionality

## Documentation

For detailed information, see:
- `backend/spa-sam-app/WEBSOCKET_SETUP.md` - Detailed setup guide
- `backend/spa-sam-app/template.yaml` - Complete SAM template
- CloudFormation Outputs - Get your API URLs

## Troubleshooting

**Connection fails:**
- Check WebSocket URL is correct in `messages.component.ts`
- Verify SAM deployment completed successfully
- Check browser console for errors

**Messages not broadcasting:**
- Check CloudWatch Logs for Lambda errors
- Verify ConnectionsTable has active connections
- Test with `wscat` (see WEBSOCKET_SETUP.md)

**Message history not loading:**
- Verify HTTP API URL is correct
- Check ItemsTable in DynamoDB console
- Look for CORS errors in browser console

## Cost

Estimated cost for light usage (~1,000 messages/day): **~$1-2/month**

This includes:
- API Gateway WebSocket connections and messages
- Lambda function executions
- DynamoDB read/write operations
- CloudWatch Logs storage

## Security Notes

⚠️ **Current implementation uses no authentication** - suitable for demos/testing only.

For production:
- Add AWS Cognito authentication
- Restrict CORS to your domain
- Implement rate limiting
- Add input validation

See `WEBSOCKET_SETUP.md` for security best practices.

---

**Need help?** Check the CloudWatch Logs for detailed error information.
