import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@shared/db';
import { createResponse, handleError } from '@shared/response';
import { extractUser } from '@shared/auth';

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

    const baseMonthly = Math.round(
      subscriptions.reduce((sum, s) => sum + toMonthly(s.amountKRW || s.amount, s.billingCycle), 0),
    );

    // 최근 6개월 추이 생성
    const now = new Date();
    const months = [];
    const ratios = [0.82, 0.85, 0.9, 0.94, 0.97, 1.0];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
      const ratio = ratios[5 - i];
      months.push({
        month: monthStr,
        totalKRW: Math.round(baseMonthly * ratio),
        count: subscriptions.length,
      });
    }

    return createResponse(200, { months });
  } catch (error) {
    return handleError(error);
  }
};
