const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const connectionId = event.requestContext.connectionId;
    
    const params = {
        TableName: process.env.TABLE_NAME,
        Key: {
            connectionId: connectionId
        }
    };
    
    try {
        await dynamoDB.delete(params).promise();
        return {
            statusCode: 200,
            body: 'Disconnected'
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: 'Failed to disconnect: ' + JSON.stringify(err)
        };
    }
};
