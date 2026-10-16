import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { z } from 'zod';
import { ulid } from 'ulid';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@shared/db';
import { createResponse, handleError } from '@shared/response';
import { validate } from '@shared/validation';
import { extractUser } from '@shared/auth';
import { logger } from '@shared/logger';

const createSubscriptionSchema = z.object({
  name: z.string().min(1, '서비스명은 필수입니다.'),
  logoUrl: z.string().optional(),
  category: z.string().min(1, '카테고리는 필수입니다.'),
  amount: z.number().positive('금액은 양수여야 합니다.'),
  currency: z.string().default('KRW'),
  billingCycle: z.enum(['weekly', 'monthly', 'quarterly', 'biannual', 'yearly']).default('monthly'),
  billingDay: z.number().min(1).max(31).optional(),
  nextBillingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식이어야 합니다.'),
  trialEndDate: z.string().nullable().optional(),
  memo: z.string().optional(),
  notifyDaysBefore: z.number().min(0).default(3),
});

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const user = extractUser(event);
    const body = validate(event.body, createSubscriptionSchema);
    const subId = `sub_${ulid()}`;
    const now = new Date().toISOString();

    const billingDay = body.billingDay || parseInt(body.nextBillingDate.split('-')[2], 10);
    // 금액 정렬을 위해 10자리 0 패딩
    const paddedAmount = String(Math.round(body.amount)).padStart(10, '0');

    const item = {
      PK: `USER#${user.userId}`,
      SK: `SUB#${subId}`,
      GSI1PK: `SUB#${subId}`,
      GSI1SK: `NEXT_BILLING#${body.nextBillingDate}`,
      GSI2PK: `USER#${user.userId}#CAT#${body.category}`,
      GSI2SK: `AMOUNT#${paddedAmount}`,

      subId,
      userId: user.userId,
      name: body.name,
      logoUrl: body.logoUrl || '',
      category: body.category,
      amount: body.amount,
      currency: body.currency,
      amountKRW: body.currency === 'USD' ? body.amount * 1400 : body.amount,
      billingCycle: body.billingCycle,
      billingDay,
      nextBillingDate: body.nextBillingDate,
      trialEndDate: body.trialEndDate || null,
      status: 'active',
      memo: body.memo || '',
      notifyDaysBefore: body.notifyDaysBefore,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      }),
    );

    logger.info('구독 등록 완료', { userId: user.userId, subId, name: body.name });

    return createResponse(201, item);
  } catch (error) {
    return handleError(error);
  }
};
