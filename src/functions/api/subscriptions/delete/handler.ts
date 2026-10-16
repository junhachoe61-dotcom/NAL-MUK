import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@shared/db';
import { createResponse, handleError } from '@shared/response';
import { extractUser } from '@shared/auth';
import { logger } from '@shared/logger';

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

    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${user.userId}`,
          SK: `SUB#${subId}`,
        },
      }),
    );

    logger.info('구독 삭제 완료', { userId: user.userId, subId });

    return createResponse(200, {
      message: '구독이 성공적으로 삭제되었습니다.',
      subId,
    });
  } catch (error) {
    return handleError(error);
  }
};
