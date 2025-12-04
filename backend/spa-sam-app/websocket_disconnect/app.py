import json
import boto3
import os
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')
connections_table = dynamodb.Table(os.environ['CONNECTIONS_TABLE_NAME'])

def lambda_handler(event, context):
    """
    Handle WebSocket $disconnect route
    Remove the connection ID from DynamoDB
    """
    try:
        connection_id = event['requestContext']['connectionId']
        logger.info(f"WebSocket disconnected: {connection_id}")
        
        # Remove connection ID from DynamoDB
        connections_table.delete_item(
            Key={
                'connectionId': connection_id
            }
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Disconnected'})
        }
    except Exception as e:
        logger.error(f"Error in disconnect handler: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': str(e)})
        }
