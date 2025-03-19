const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const connectionId = event.requestContext.connectionId;
    
    const params = {
        TableName: process.env.TABLE_NAME,
        Item: {
            connectionId: connectionId,
            timestamp: Date.now()
        }
    };
    
    try {
        await dynamoDB.put(params).promise();
        return {
            statusCode: 200,
            body: 'Connected'
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: 'Failed to connect: ' + JSON.stringify(err)
        };
    }
};
