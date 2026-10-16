import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@shared/db';
import { createResponse, handleError } from '@shared/response';
import { extractUser } from '@shared/auth';

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const user = extractUser(event);
    const subId = event.pathParameters?.id;

    if (!subId) {
      return createResponse(400, {
        title: 'Bad Request',
        status: 400,
        detail: '구독 ID가 필요합니다.',
      });
    }

    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${user.userId}`,
          SK: `SUB#${subId}`,
        },
      }),
    );

    if (!result.Item) {
      return createResponse(404, {
        title: 'Not Found',
        status: 404,
        detail: '해당 구독 항목을 찾을 수 없습니다.',
      });
    }

    return createResponse(200, result.Item);
  } catch (error) {
    return handleError(error);
  }
};
