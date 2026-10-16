import type { ScheduledHandler } from 'aws-lambda';
import { ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ulid } from 'ulid';
import { docClient, TABLE_NAME } from '@shared/db';
import { logger } from '@shared/logger';

export const handler: ScheduledHandler = async (event) => {
  logger.info('결제 알림 배치 스케줄러 시작', { time: event.time });

  try {
    // 모든 활성 구독 스캔
    const scanResult = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(SK, :skPrefix) AND #status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':skPrefix': 'SUB#',
          ':status': 'active',
        },
      }),
    );

    const subscriptions = scanResult.Items || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let sentCount = 0;

    for (const sub of subscriptions) {
      if (!sub.nextBillingDate) continue;

      const billingDate = new Date(sub.nextBillingDate);
      billingDate.setHours(0, 0, 0, 0);

      const diffTime = billingDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const notifyDaysBefore = sub.notifyDaysBefore !== undefined ? sub.notifyDaysBefore : 3;

      // 설정된 사전 알림 일수와 일치하는 경우 알림 생성
      if (diffDays === notifyDaysBefore && notifyDaysBefore > 0) {
        const notifId = `notif_${ulid()}`;
        const now = new Date().toISOString();

        await docClient.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              PK: `USER#${sub.userId}`,
              SK: `NOTIF#${notifId}`,
              notifId,
              userId: sub.userId,
              subId: sub.subId,
              subName: sub.name,
              amount: sub.amount,
              currency: sub.currency,
              nextBillingDate: sub.nextBillingDate,
              daysLeft: diffDays,
              title: `[결제 예정] ${sub.name} 결제 ${diffDays}일 전입니다.`,
              message: `${sub.nextBillingDate}에 ${sub.amount.toLocaleString()}${sub.currency}가 결제될 예정입니다. 결제 수단을 확인해주세요.`,
              read: false,
              createdAt: now,
            },
          }),
        );

        sentCount++;
        logger.info('알림 생성 완료', { userId: sub.userId, subName: sub.name, daysLeft: diffDays });
      }
    }

    logger.info('결제 알림 배치 완료', { totalChecked: subscriptions.length, sentCount });
  } catch (error) {
    logger.error('결제 알림 배치 실행 중 오류 발생', error);
    throw error;
  }
};
