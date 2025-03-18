import json
import boto3
import uuid
import os
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

def lambda_handler(event, context):
    try:
        logger.info("Received event: %s", event)  
        
        body = json.loads(event['body'])
        if 'message' not in body:
            logger.warning("No message provided in request body")  
            return {
                "statusCode": 400,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json"
                },
                "body": json.dumps({"message": "No message provided!"})
            }
        
        item = {
            'id': str(uuid.uuid4()),
            'message': body['message']
        }
        logger.info("Saving item to DynamoDB: %s", item)  
        table.put_item(Item=item)

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            "body": json.dumps({"message": "Message saved!"})
        }
    except Exception as e:
        logger.error("Error processing request: %s", str(e), exc_info=True)  
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            "body": json.dumps({"message": str(e)})
        }
