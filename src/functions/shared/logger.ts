export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: 'INFO', message, meta, timestamp: new Date().toISOString() }));
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ level: 'WARN', message, meta, timestamp: new Date().toISOString() }));
  },
  error: (message: string, error?: unknown, meta?: Record<string, unknown>) => {
    console.error(
      JSON.stringify({
        level: 'ERROR',
        message,
        error: error instanceof Error ? error.stack || error.message : error,
        meta,
        timestamp: new Date().toISOString(),
      }),
    );
  },
};
