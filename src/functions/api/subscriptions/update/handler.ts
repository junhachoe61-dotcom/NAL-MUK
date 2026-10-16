import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { z } from 'zod';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@shared/db';
import { createResponse, handleError } from '@shared/response';
import { validate } from '@shared/validation';
import { extractUser } from '@shared/auth';
import { logger } from '@shared/logger';

const updateSubscriptionSchema = z.object({
  name: z.string().optional(),
  logoUrl: z.string().optional(),
  category: z.string().optional(),
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  billingCycle: z.enum(['weekly', 'monthly', 'quarterly', 'biannual', 'yearly']).optional(),
  billingDay: z.number().min(1).max(31).optional(),
  nextBillingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  trialEndDate: z.string().nullable().optional(),
  status: z.enum(['active', 'paused', 'cancelled']).optional(),
  memo: z.string().optional(),
  notifyDaysBefore: z.number().min(0).optional(),
});

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

    const body = validate(event.body, updateSubscriptionSchema);

    // 기존 데이터 조회
    const existing = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${user.userId}`,
          SK: `SUB#${subId}`,
        },
      }),
    );

    if (!existing.Item) {
      return createResponse(404, {
        title: 'Not Found',
        status: 404,
        detail: '해당 구독 항목을 찾을 수 없습니다.',
      });
    }

    const updatedItem = {
      ...existing.Item,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    if (body.amount !== undefined) {
      const currency = body.currency || existing.Item.currency;
      updatedItem.amountKRW = currency === 'USD' ? body.amount * 1400 : body.amount;
      const paddedAmount = String(Math.round(body.amount)).padStart(10, '0');
      updatedItem.GSI2SK = `AMOUNT#${paddedAmount}`;
    }

    if (body.nextBillingDate) {
      updatedItem.GSI1SK = `NEXT_BILLING#${body.nextBillingDate}`;
    }

    if (body.category) {
      updatedItem.GSI2PK = `USER#${user.userId}#CAT#${body.category}`;
    }

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: updatedItem,
      }),
    );

    logger.info('구독 수정 완료', { userId: user.userId, subId });

    return createResponse(200, updatedItem);
  } catch (error) {
    return handleError(error);
  }
};
