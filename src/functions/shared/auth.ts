import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'subtrack-secret-key-12345';

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
}

export function extractUser(event: APIGatewayProxyEventV2): AuthUser {
  const authHeader = event.headers.authorization || event.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw {
      statusCode: 401,
      message: '인증 헤더가 누락되었거나 올바르지 않습니다 (Bearer 토큰 필요).',
    };
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    throw {
      statusCode: 401,
      message: '유효하지 않거나 만료된 토큰입니다.',
    };
  }
}
