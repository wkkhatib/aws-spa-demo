# WebSocket Real-Time Chat Setup Guide

This guide explains how to deploy and configure the WebSocket real-time chat functionality.

## Architecture Overview

The WebSocket implementation includes:

1. **AWS API Gateway WebSocket API** - Manages WebSocket connections
2. **Lambda Functions**:
   - `WebSocketConnectFunction` - Handles new connections ($connect route)
   - `WebSocketDisconnectFunction` - Handles disconnections ($disconnect route)
   - `WebSocketMessageFunction` - Handles messages and broadcasting ($default route)
3. **DynamoDB Tables**:
   - `ItemsTable` - Stores message history (existing table, now with timestamps)
   - `ConnectionsTable` - Stores active WebSocket connection IDs (new table)

## Deployment Steps

### 1. Deploy Backend (SAM Template)

```bash
cd backend/spa-sam-app

# Build the SAM application
sam build

# Deploy (first time - guided)
sam deploy --guided

# Or deploy with existing config
sam deploy
```

### 2. Get WebSocket URL

After deployment, get the WebSocket URL from the CloudFormation outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name <your-stack-name> \
  --query 'Stacks[0].Outputs[?OutputKey==`WebSocketURL`].OutputValue' \
  --output text
```

The URL will look like: `wss://xxxxxxxxxx.execute-api.us-east-2.amazonaws.com/Prod`

### 3. Update Frontend Configuration

Edit `frontend/src/app/pages/messages/messages.component.ts` and update the WebSocket URL:

```typescript
private websocketUrl = 'wss://your-websocket-api-id.execute-api.your-region.amazonaws.com/Prod';
```

Also update the HTTP API URL if it has changed:

```typescript
private httpApiUrl = 'https://your-api-id.execute-api.your-region.amazonaws.com/Prod/items';
```

### 4. Build and Deploy Frontend

```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Build the Angular application
npm run build

# Deploy to your hosting service (S3, Amplify, etc.)
```

## Testing the Implementation

### Test WebSocket Connection

You can test the WebSocket API using `wscat`:

```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c wss://your-websocket-api-id.execute-api.your-region.amazonaws.com/Prod

# Send a message
> {"message": "Hello from wscat!"}

# You should see the message echoed back
```

### Test from Frontend

1. Open the application in multiple browser windows/tabs
2. Send a message from one window
3. Verify that all windows receive the message in real-time

## Features

- **Real-time messaging**: Messages are instantly broadcast to all connected clients
- **Message persistence**: All messages are stored in DynamoDB for history
- **Connection management**: Active connections are tracked in a separate DynamoDB table
- **Auto-reconnection**: Frontend automatically attempts to reconnect on disconnection
- **Connection status indicator**: Visual feedback for connection state
- **Message history**: Load previous messages via HTTP API

## Security Considerations

### Current Configuration
- WebSocket API is open (no authentication)
- CORS is set to allow all origins (`*`)

### Recommended for Production
1. **Add Authentication**: Implement AWS Cognito or custom authorizers
2. **Restrict CORS**: Set specific allowed origins
3. **Rate Limiting**: Implement throttling on API Gateway
4. **Message Validation**: Add input validation and sanitization
5. **Connection Limits**: Set max connections per user

### Example: Add Cognito Authorization

Update the SAM template:

```yaml
WebSocketApi:
  Type: AWS::ApiGatewayV2::Api
  Properties:
    Name: ChatWebSocketApi
    ProtocolType: WEBSOCKET
    RouteSelectionExpression: "$request.body.action"

ConnectRoute:
  Type: AWS::ApiGatewayV2::Route
  Properties:
    ApiId: !Ref WebSocketApi
    RouteKey: $connect
    AuthorizationType: AWS_IAM  # or CUSTOM for custom authorizer
    Target: !Sub integrations/${ConnectIntegration}
```

## Troubleshooting

### Connection Issues

1. **Check CloudWatch Logs**: Each Lambda function logs to CloudWatch
2. **Verify IAM Permissions**: Ensure Lambda has correct permissions
3. **Check Network**: Ensure WebSocket port is not blocked

### Message Not Broadcasting

1. **Check ConnectionsTable**: Verify connections are being stored
2. **Check Lambda Logs**: Look for errors in WebSocketMessageFunction
3. **Verify API Gateway Permissions**: Lambda needs execute-api:ManageConnections

### Stale Connections

The message handler automatically cleans up stale connections when it encounters a `GoneException`.

## CloudWatch Logs

Monitor the following log groups:

- `/aws/lambda/WebSocketConnectFunction`
- `/aws/lambda/WebSocketDisconnectFunction`
- `/aws/lambda/WebSocketMessageFunction`

## Cost Considerations

- **API Gateway**: Charged per message and connection minute
- **Lambda**: Charged per invocation and execution time
- **DynamoDB**: Charged for read/write operations and storage
- **CloudWatch**: Charged for log storage

Estimate: For light usage (1000 messages/day), costs should be under $1/month.

## Future Enhancements

Potential improvements:
- Private messaging between users
- Message reactions and threading
- Typing indicators
- Read receipts
- File sharing
- Message editing and deletion
- User presence (online/offline status)
