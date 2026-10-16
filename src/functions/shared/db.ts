import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const isOffline = process.env.IS_OFFLINE === 'true';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  ...(isOffline && {
    endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:4566',
    credentials: {
      accessKeyId: 'MockKey',
      secretAccessKey: 'MockSecret',
    },
  }),
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const TABLE_NAME = process.env.DYNAMODB_TABLE || 'p1-dev-subscriptions';
