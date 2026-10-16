import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { ulid } from 'ulid';
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@shared/db';
import { createResponse, handleError } from '@shared/response';
import { validate } from '@shared/validation';
import { logger } from '@shared/logger';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const input = validate(event.body, registerSchema);
    logger.info('회원가입 요청', { email: input.email });

    // 이메일 중복 확인
    const checkUser = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER_EMAIL#${input.email}`,
          SK: 'LOOKUP',
        },
      }),
    );

    if (checkUser.Item) {
      return createResponse(409, {
        title: 'Conflict',
        status: 409,
        detail: '이미 등록된 이메일 주소입니다.',
      });
    }

    const userId = `usr_${ulid()}`;
    const hashedPassword = await bcrypt.hash(input.password, 10);
    const now = new Date().toISOString();

    // 사용자 정보 저장 & 이메일 Lookup 인덱스 저장
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${userId}`,
          SK: 'PROFILE',
          userId,
          email: input.email,
          name: input.name,
          password: hashedPassword,
          createdAt: now,
          updatedAt: now,
        },
      }),
    );

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER_EMAIL#${input.email}`,
          SK: 'LOOKUP',
          userId,
        },
      }),
    );

    logger.info('회원가입 완료', { userId, email: input.email });

    return createResponse(201, {
      message: '회원가입이 완료되었습니다.',
      userId,
      email: input.email,
      name: input.name,
    });
  } catch (error) {
    return handleError(error);
  }
};
