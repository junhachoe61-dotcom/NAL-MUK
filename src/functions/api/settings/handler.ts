import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { z } from 'zod';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@shared/db';
import { createResponse, handleError } from '@shared/response';
import { validate } from '@shared/validation';
import { extractUser } from '@shared/auth';
import { logger } from '@shared/logger';

const updateSettingsSchema = z.object({
  defaultCurrency: z.string().optional(),
  notifyEnabled: z.boolean().optional(),
  notifyEmail: z.string().email().optional(),
  timezone: z.string().optional(),
});

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const user = extractUser(event);
    const method = event.requestContext.http.method.toUpperCase();

    if (method === 'GET') {
      const result = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${user.userId}`,
            SK: 'SETTINGS',
          },
        }),
      );

      const settings = result.Item || {
        userId: user.userId,
        defaultCurrency: 'KRW',
        notifyEnabled: true,
        notifyEmail: user.email,
        timezone: 'Asia/Seoul',
      };

      return createResponse(200, settings);
    }

    if (method === 'PATCH') {
      const body = validate(event.body, updateSettingsSchema);

      const existing = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${user.userId}`,
            SK: 'SETTINGS',
          },
        }),
      );

      const updated = {
        PK: `USER#${user.userId}`,
        SK: 'SETTINGS',
        userId: user.userId,
        defaultCurrency: 'KRW',
        notifyEnabled: true,
        notifyEmail: user.email,
        timezone: 'Asia/Seoul',
        ...(existing.Item || {}),
        ...body,
        updatedAt: new Date().toISOString(),
      };

      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: updated,
        }),
      );

      logger.info('설정 업데이트 완료', { userId: user.userId });
      return createResponse(200, updated);
    }

    return createResponse(405, { title: 'Method Not Allowed', status: 405 });
  } catch (error) {
    return handleError(error);
  }
};
