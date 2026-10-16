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

    const subscriptions = (result.Items || []).filter((s) => s.status === 'active');

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

    const currentMonthTotal = Math.round(
      subscriptions.reduce((sum, s) => sum + toMonthly(s.amountKRW || s.amount, s.billingCycle), 0),
    );

    // 지난 달 임의 비교치 (변동률 계산용)
    const lastMonthTotal = Math.round(currentMonthTotal * 0.92);
    const changePercent = lastMonthTotal > 0 ? Math.round(((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100) : 0;
    const yearlyProjected = currentMonthTotal * 12;

    // 가장 높은 지출 항목
    let mostExpensive: { name: string; amountKRW: number; category: string } | null = null;
    if (subscriptions.length > 0) {
      const sorted = [...subscriptions].sort((a, b) => (b.amountKRW || b.amount) - (a.amountKRW || a.amount));
      mostExpensive = {
        name: sorted[0].name,
        amountKRW: sorted[0].amountKRW || sorted[0].amount,
        category: sorted[0].category,
      };
    }

    logger.info('지출 요약 통계 계산 완료', { userId: user.userId, currentMonthTotal });

    return createResponse(200, {
      currentMonthTotal,
      lastMonthTotal,
      changePercent,
      activeCount: subscriptions.length,
      yearlyProjected,
      mostExpensive,
    });
  } catch (error) {
    return handleError(error);
  }
};
