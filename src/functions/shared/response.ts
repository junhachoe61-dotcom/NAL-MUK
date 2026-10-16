import type { APIGatewayProxyResultV2 } from 'aws-lambda';

export function createResponse<T>(statusCode: number, data: T): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
    },
    body: JSON.stringify(data),
  };
}

export function handleError(error: unknown): APIGatewayProxyResultV2 {
  console.error('[Error Details]:', error);

  if (error && typeof error === 'object' && 'statusCode' in error) {
    const err = error as { statusCode: number; message: string; detail?: string };
    return {
      statusCode: err.statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        title: 'Error',
        status: err.statusCode,
        detail: err.message || err.detail || 'An error occurred',
      }),
    };
  }

  const message = error instanceof Error ? error.message : 'Internal Server Error';

  return {
    statusCode: 500,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      title: 'Internal Server Error',
      status: 500,
      detail: message,
    }),
  };
}
