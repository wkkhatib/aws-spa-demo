# WebSocket Implementation - Deployment Checklist

## Pre-Deployment Verification ✓

- [x] SAM template validated
- [x] All Python Lambda functions have valid syntax
- [x] TypeScript files compile without errors
- [x] WebSocket service created
- [x] Messages component updated
- [x] Documentation created

## Backend Deployment Steps

### 1. Prerequisites
- [ ] AWS CLI installed and configured
- [ ] SAM CLI installed (version 1.0+)
- [ ] AWS credentials configured (`aws configure`)
- [ ] Proper IAM permissions for CloudFormation, Lambda, API Gateway, DynamoDB

### 2. Build and Deploy Backend
```bash
cd backend/spa-sam-app
sam build
sam deploy --guided
```

**During `sam deploy --guided`, you'll be prompted for:**
- Stack Name (e.g., `aws-spa-demo-stack`)
- AWS Region (e.g., `us-east-2`)
- Confirm changes before deploy: Y
- Allow SAM CLI IAM role creation: Y
- Disable rollback: N (optional)
- PutItemFunction may not have authorization defined: Y
- GetItemsFunction may not have authorization defined: Y
- Save arguments to configuration file: Y
- Configuration file: samconfig.toml

### 3. Capture Outputs
After deployment completes, note these values:

```bash
# Get HTTP API URL
aws cloudformation describe-stacks \
  --stack-name <your-stack-name> \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text

# Get WebSocket URL
aws cloudformation describe-stacks \
  --stack-name <your-stack-name> \
  --query 'Stacks[0].Outputs[?OutputKey==`WebSocketURL`].OutputValue' \
  --output text
```

- [ ] HTTP API URL captured: `____________________________`
- [ ] WebSocket URL captured: `____________________________`

### 4. Verify Backend Resources
Check AWS Console:
- [ ] Lambda functions created (5 total)
  - [ ] PutItemFunction
  - [ ] GetItemsFunction
  - [ ] WebSocketConnectFunction
  - [ ] WebSocketDisconnectFunction
  - [ ] WebSocketMessageFunction
- [ ] DynamoDB tables created (2 total)
  - [ ] ItemsTable
  - [ ] ConnectionsTable
- [ ] API Gateways created (2 total)
  - [ ] SpaApi (REST API)
  - [ ] ChatWebSocketApi (WebSocket API)

## Frontend Configuration Steps

### 5. Update Frontend URLs
Edit: `frontend/src/app/pages/messages/messages.component.ts`

Update line 76 with your WebSocket URL:
```typescript
private websocketUrl = 'wss://YOUR-WEBSOCKET-API-ID.execute-api.YOUR-REGION.amazonaws.com/Prod';
```
- [ ] WebSocket URL updated

Update line 77 with your HTTP API URL (if changed):
```typescript
private httpApiUrl = 'https://YOUR-API-ID.execute-api.YOUR-REGION.amazonaws.com/Prod/items';
```
- [ ] HTTP API URL updated

### 6. Build Frontend
```bash
cd frontend
npm install
npm run build
```
- [ ] Frontend build successful
- [ ] No TypeScript compilation errors
- [ ] `dist/` folder created

### 7. Deploy Frontend
Choose your hosting method:

**Option A: AWS S3 + CloudFront**
```bash
aws s3 sync dist/aws-spa-demo s3://your-bucket-name/
aws cloudfront create-invalidation --distribution-id YOUR-DIST-ID --paths "/*"
```

**Option B: AWS Amplify**
```bash
amplify publish
```

**Option C: Other hosting service**
- Upload contents of `dist/aws-spa-demo/` to your hosting service

- [ ] Frontend deployed

## Testing Steps

### 8. Backend Testing with wscat
```bash
npm install -g wscat
wscat -c wss://YOUR-WEBSOCKET-API-ID.execute-api.YOUR-REGION.amazonaws.com/Prod
```

Once connected, send a test message:
```
> {"message": "Test from wscat"}
```

- [ ] Successfully connected to WebSocket
- [ ] Test message sent without errors
- [ ] Received confirmation/echo

### 9. Frontend Testing

**Single User Test:**
- [ ] Open application in browser
- [ ] Connection status shows "Connected"
- [ ] Can send messages
- [ ] Messages appear in the list
- [ ] "Load Message History" button works

**Multi-User Test:**
- [ ] Open application in 2+ browser tabs/windows
- [ ] All tabs show "Connected" status
- [ ] Send message from Tab 1
- [ ] Message appears instantly in all other tabs
- [ ] Send message from Tab 2
- [ ] Message appears in Tab 1 and others

**Reconnection Test:**
- [ ] Disconnect from one tab (using disconnect button)
- [ ] Status shows "Disconnected"
- [ ] Click "Reconnect" button
- [ ] Status shows "Connected"
- [ ] Can send/receive messages again

### 10. Check CloudWatch Logs
Verify logs exist for each Lambda:
- [ ] `/aws/lambda/WebSocketConnectFunction` has logs
- [ ] `/aws/lambda/WebSocketDisconnectFunction` has logs
- [ ] `/aws/lambda/WebSocketMessageFunction` has logs
- [ ] No errors in logs

### 11. Check DynamoDB Tables
- [ ] ConnectionsTable has active connections when users connected
- [ ] ItemsTable has messages with timestamps
- [ ] ConnectionsTable entries removed when users disconnect

## Post-Deployment

### 12. Security Review (Production)
- [ ] Enable authentication (Cognito/Custom authorizer)
- [ ] Update CORS to specific origins
- [ ] Enable API Gateway throttling
- [ ] Review IAM policies
- [ ] Enable WAF rules (optional)
- [ ] Set up CloudWatch alarms

### 13. Monitoring Setup
- [ ] CloudWatch Dashboard created
- [ ] Alarms configured for:
  - [ ] Lambda errors
  - [ ] API Gateway 5xx errors
  - [ ] DynamoDB throttling
  - [ ] High Lambda duration

### 14. Documentation
- [ ] Update team documentation with URLs
- [ ] Share WebSocket URL with frontend team
- [ ] Document any environment-specific configuration
- [ ] Update CI/CD pipelines if applicable

## Rollback Plan

If issues occur:
```bash
aws cloudformation delete-stack --stack-name <your-stack-name>
```

To redeploy previous version:
```bash
cd backend/spa-sam-app
git checkout <previous-commit>
sam build
sam deploy
```

## Cost Monitoring

- [ ] Set up AWS Budgets alert
- [ ] Monitor costs in Cost Explorer
- [ ] Review DynamoDB capacity settings
- [ ] Check Lambda concurrent executions

Expected cost for light usage: ~$1-2/month

## Troubleshooting

**WebSocket connection fails:**
1. Check CloudWatch Logs for WebSocketConnectFunction
2. Verify WebSocket URL is correct
3. Check browser console for errors
4. Test with wscat

**Messages not broadcasting:**
1. Check CloudWatch Logs for WebSocketMessageFunction
2. Verify ConnectionsTable has entries
3. Check IAM policy for execute-api:ManageConnections
4. Test sending from wscat

**Frontend build fails:**
1. Delete node_modules and package-lock.json
2. Run `npm install` again
3. Check Node.js version compatibility
4. Review TypeScript errors

## Completion

- [ ] All checklist items completed
- [ ] Application tested end-to-end
- [ ] Documentation updated
- [ ] Team notified
- [ ] Monitoring in place

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Stack Name:** _______________
**Region:** _______________
**Notes:** _______________________________________________
