const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const connectionId = event.requestContext.connectionId;
    const apiGateway = new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: process.env.API_GATEWAY_ENDPOINT
    });
    
    try {
        // Get all connections
        const connections = await dynamoDB.scan({
            TableName: process.env.TABLE_NAME
        }).promise();
        
        const message = JSON.parse(event.body);
        
        // Broadcast message to all connections
        const postCalls = connections.Items.map(async ({ connectionId }) => {
            try {
                await apiGateway.postToConnection({
                    ConnectionId: connectionId,
                    Data: JSON.stringify({
                        message: message.message,
                        sender: event.requestContext.connectionId
                    })
                }).promise();
            } catch (e) {
                if (e.statusCode === 410) {
                    // Remove stale connections
                    await dynamoDB.delete({
                        TableName: process.env.TABLE_NAME,
                        Key: { connectionId }
                    }).promise();
                }
            }
        });
        
        await Promise.all(postCalls);
        
        return {
            statusCode: 200,
            body: 'Message sent'
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: 'Failed to send message: ' + JSON.stringify(err)
        };
    }
};
