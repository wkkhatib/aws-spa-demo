import json
import boto3
import uuid
import os
import logging
from datetime import datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')
items_table = dynamodb.Table(os.environ['ITEMS_TABLE_NAME'])
connections_table = dynamodb.Table(os.environ['CONNECTIONS_TABLE_NAME'])

# API Gateway Management API client for sending messages to WebSocket connections
def get_apigw_management_client(event):
    endpoint_url = f"https://{event['requestContext']['domainName']}/{event['requestContext']['stage']}"
    return boto3.client('apigatewaymanagementapi', endpoint_url=endpoint_url)

def lambda_handler(event, context):
    """
    Handle WebSocket $default route
    1. Parse incoming message
    2. Save message to ItemsTable
    3. Broadcast message to all connected clients
    """
    try:
        connection_id = event['requestContext']['connectionId']
        logger.info(f"Received message from connection: {connection_id}")
        
        # Parse the message body
        body = json.loads(event.get('body', '{}'))
        message_text = body.get('message', '')
        
        if not message_text:
            logger.warning("Empty message received")
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'Message cannot be empty'})
            }
        
        # Create message item with unique ID and timestamp
        message_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        message_item = {
            'id': message_id,
            'message': message_text,
            'timestamp': timestamp,
            'connectionId': connection_id
        }
        
        # Save message to ItemsTable for persistence
        logger.info(f"Saving message to ItemsTable: {message_item}")
        items_table.put_item(Item=message_item)
        
        # Get all active connections
        response = connections_table.scan()
        connections = response.get('Items', [])
        
        logger.info(f"Broadcasting to {len(connections)} connections")
        
        # Initialize API Gateway Management API client
        apigw_client = get_apigw_management_client(event)
        
        # Prepare broadcast message
        broadcast_data = json.dumps({
            'id': message_id,
            'message': message_text,
            'timestamp': timestamp,
            'type': 'new_message'
        })
        
        # Broadcast to all connections
        failed_connections = []
        for connection in connections:
            conn_id = connection['connectionId']
            try:
                apigw_client.post_to_connection(
                    ConnectionId=conn_id,
                    Data=broadcast_data.encode('utf-8')
                )
                logger.info(f"Successfully sent message to connection: {conn_id}")
            except apigw_client.exceptions.GoneException:
                logger.warning(f"Connection {conn_id} is stale, marking for removal")
                failed_connections.append(conn_id)
            except Exception as e:
                logger.error(f"Failed to send to connection {conn_id}: {str(e)}")
                failed_connections.append(conn_id)
        
        # Clean up stale connections
        for conn_id in failed_connections:
            try:
                connections_table.delete_item(Key={'connectionId': conn_id})
                logger.info(f"Removed stale connection: {conn_id}")
            except Exception as e:
                logger.error(f"Failed to remove stale connection {conn_id}: {str(e)}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Message sent successfully',
                'messageId': message_id
            })
        }
        
    except Exception as e:
        logger.error(f"Error in message handler: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': str(e)})
        }
