import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@shared/db';
import { createResponse, handleError } from '@shared/response';
import { validate } from '@shared/validation';
import { logger } from '@shared/logger';

const refreshSchema = z.object({
  refreshToken: z.string(),
});

const JWT_SECRET = process.env.JWT_SECRET || 'subtrack-secret-key-12345';

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const input = validate(event.body, refreshSchema);

    let decoded: any;
    try {
      decoded = jwt.verify(input.refreshToken, JWT_SECRET);
    } catch (err) {
      return createResponse(401, {
        title: 'Unauthorized',
        status: 401,
        detail: '유효하지 않거나 만료된 리프레시 토큰입니다.',
      });
    }

    const userId = decoded.userId;

    const userProfile = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: 'PROFILE',
        },
      }),
    );

    if (!userProfile.Item) {
      return createResponse(404, {
        title: 'Not Found',
        status: 404,
        detail: '사용자를 찾을 수 없습니다.',
      });
    }

    const newAccessToken = jwt.sign(
      { userId, email: userProfile.Item.email, name: userProfile.Item.name },
      JWT_SECRET,
      { expiresIn: '1h' },
    );

    const newRefreshToken = jwt.sign(
      { userId },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    logger.info('토큰 재발급 완료', { userId });

    return createResponse(200, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 3600,
      tokenType: 'Bearer',
    });
  } catch (error) {
    return handleError(error);
  }
};
