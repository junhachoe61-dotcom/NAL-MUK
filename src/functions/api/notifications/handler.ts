import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@shared/db';
import { createResponse, handleError } from '@shared/response';
import { extractUser } from '@shared/auth';

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const user = extractUser(event);
    const method = event.requestContext.http.method.toUpperCase();

    if (method === 'GET') {
      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
          ExpressionAttributeValues: {
            ':pk': `USER#${user.userId}`,
            ':skPrefix': 'NOTIF#',
          },
          ScanIndexForward: false, // 최신순
        }),
      );

      const notifications = result.Items || [];
      const unreadCount = notifications.filter((n) => !n.read).length;

      return createResponse(200, {
        data: notifications,
        unreadCount,
      });
    }

    if (method === 'PATCH') {
      const notifId = event.pathParameters?.id;
      if (!notifId) {
        return createResponse(400, { title: 'Bad Request', detail: '알림 ID가 필요합니다.' });
      }

      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${user.userId}`,
            SK: `NOTIF#${notifId}`,
          },
          UpdateExpression: 'SET #read = :read',
          ExpressionAttributeNames: {
            '#read': 'read',
          },
          ExpressionAttributeValues: {
            ':read': true,
          },
        }),
      );

      return createResponse(200, { message: '알림이 읽음 처리되었습니다.', notifId });
    }

    return createResponse(405, { title: 'Method Not Allowed' });
  } catch (error) {
    return handleError(error);
  }
};
