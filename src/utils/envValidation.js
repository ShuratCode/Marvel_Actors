import { z } from 'zod';
import { logger } from './logger.js';

const envSchema = z.object({
  PORT: z.string().transform(Number).default('3000'),
  TMDB_API_KEY: z.string().min(1, "TMDB_API_KEY is required"),
  CACHE_TTL: z.string().transform(Number).default('3600'),
  CONCURRENT_REQUESTS_LIMIT: z.string().transform(Number).default('5'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    logger.error('❌ Invalid environment variables:');
    result.error.issues.forEach((issue) => {
      logger.error(`   ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
  }

  return result.data;
}

