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
    Handle WebSocket $connect route
    Store the connection ID in DynamoDB
    """
    try:
        connection_id = event['requestContext']['connectionId']
        logger.info(f"New WebSocket connection: {connection_id}")
        
        # Store connection ID in DynamoDB
        connections_table.put_item(
            Item={
                'connectionId': connection_id
            }
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Connected'})
        }
    except Exception as e:
        logger.error(f"Error in connect handler: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': str(e)})
        }
