import { z, ZodSchema } from 'zod';

export function validate<T>(body: string | undefined | null, schema: ZodSchema<T>): T {
  if (!body) {
    throw {
      statusCode: 400,
      message: 'Request body is required',
    };
  }

  let parsed: unknown;
  try {
    parsed = typeof body === 'string' ? JSON.parse(body) : body;
  } catch (e) {
    throw {
      statusCode: 400,
      message: 'Invalid JSON format in request body',
    };
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    const errorDetails = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw {
      statusCode: 400,
      message: `Validation Error: ${errorDetails}`,
    };
  }

  return result.data;
}
