import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@shared/db';
import { createResponse, handleError } from '@shared/response';
import { extractUser } from '@shared/auth';
import { logger } from '@shared/logger';

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const user = extractUser(event);
    const queryParams = event.queryStringParameters || {};
    const category = queryParams.category;
    const status = queryParams.status || 'active';

    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': `USER#${user.userId}`,
          ':skPrefix': 'SUB#',
        },
      }),
    );

    let subscriptions = (result.Items || []) as any[];

    // 상태 필터링
    if (status !== 'all') {
      subscriptions = subscriptions.filter((s) => s.status === status);
    }

    // 카테고리 필터링
    if (category) {
      subscriptions = subscriptions.filter((s) => s.category === category);
    }

    // 월 환산 금액 계산 함수
    const toMonthly = (amountKRW: number, cycle: string) => {
      switch (cycle) {
        case 'weekly': return amountKRW * 4.345;
        case 'monthly': return amountKRW;
        case 'quarterly': return amountKRW / 3;
        case 'biannual': return amountKRW / 6;
        case 'yearly': return amountKRW / 12;
        default: return amountKRW;
      }
    };

    const monthlyTotal = subscriptions.reduce((sum, s) => sum + toMonthly(s.amountKRW || s.amount, s.billingCycle), 0);
    const yearlyTotal = monthlyTotal * 12;

    logger.info('구독 목록 조회 완료', { userId: user.userId, count: subscriptions.length });

    return createResponse(200, {
      data: subscriptions,
      total: subscriptions.length,
      monthlyTotal: Math.round(monthlyTotal),
      yearlyTotal: Math.round(yearlyTotal),
    });
  } catch (error) {
    return handleError(error);
  }
};
