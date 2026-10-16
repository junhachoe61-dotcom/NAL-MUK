import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@shared/db';
import { createResponse, handleError } from '@shared/response';
import { extractUser } from '@shared/auth';

const CATEGORY_LABELS: Record<string, string> = {
  entertainment: '엔터테인먼트',
  music: '음악',
  productivity: '업무/생산성',
  cloud: '클라우드/스토리지',
  education: '교육',
  health: '건강/피트니스',
  news: '뉴스/미디어',
  gaming: '게임',
  finance: '금융',
  shopping: '쇼핑',
  other: '기타',
};

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

    const categoryMap: Record<string, { totalKRW: number; count: number }> = {};
    let totalAll = 0;

    subscriptions.forEach((sub) => {
      const cat = sub.category || 'other';
      const monthlyAmount = toMonthly(sub.amountKRW || sub.amount, sub.billingCycle);

      if (!categoryMap[cat]) {
        categoryMap[cat] = { totalKRW: 0, count: 0 };
      }
      categoryMap[cat].totalKRW += monthlyAmount;
      categoryMap[cat].count += 1;
      totalAll += monthlyAmount;
    });

    const categories = Object.entries(categoryMap)
      .map(([cat, data]) => ({
        category: cat,
        label: CATEGORY_LABELS[cat] || cat,
        totalKRW: Math.round(data.totalKRW),
        count: data.count,
        percentage: totalAll > 0 ? Math.round((data.totalKRW / totalAll) * 100) : 0,
      }))
      .sort((a, b) => b.totalKRW - a.totalKRW);

    return createResponse(200, {
      categories,
      total: Math.round(totalAll),
    });
  } catch (error) {
    return handleError(error);
  }
};
