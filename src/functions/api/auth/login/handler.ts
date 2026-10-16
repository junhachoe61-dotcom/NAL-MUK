import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@shared/db';
import { createResponse, handleError } from '@shared/response';
import { validate } from '@shared/validation';
import { logger } from '@shared/logger';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const JWT_SECRET = process.env.JWT_SECRET || 'subtrack-secret-key-12345';

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const input = validate(event.body, loginSchema);
    logger.info('로그인 시도', { email: input.email });

    // 이메일로 사용자 ID 조회
    const emailLookup = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER_EMAIL#${input.email}`,
          SK: 'LOOKUP',
        },
      }),
    );

    if (!emailLookup.Item) {
      return createResponse(401, {
        title: 'Unauthorized',
        status: 401,
        detail: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    const userId = emailLookup.Item.userId;

    // 사용자 프로필 조회
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
      return createResponse(401, {
        title: 'Unauthorized',
        status: 401,
        detail: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    const isValidPassword = await bcrypt.compare(input.password, userProfile.Item.password);
    if (!isValidPassword) {
      return createResponse(401, {
        title: 'Unauthorized',
        status: 401,
        detail: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    // JWT 토큰 발급
    const accessToken = jwt.sign(
      { userId, email: input.email, name: userProfile.Item.name },
      JWT_SECRET,
      { expiresIn: '1h' },
    );

    const refreshToken = jwt.sign(
      { userId },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    logger.info('로그인 성공', { userId });

    return createResponse(200, {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      tokenType: 'Bearer',
      user: {
        userId,
        email: input.email,
        name: userProfile.Item.name,
      },
    });
  } catch (error) {
    return handleError(error);
  }
};
