import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { requestIdMiddleware } from './api/middleware/requestId.js';
import { createRateLimiter } from './api/middleware/rateLimiter.js';
import { errorHandler } from './api/middleware/errorHandler.js';
import { healthRouter } from './api/routes/health.routes.js';
import { documentRouter } from './api/routes/document.routes.js';
import { spreadsheetRouter } from './api/routes/spreadsheet.routes.js';
import { createLogger } from './utils/logger.js';

const logger = createLogger('Server');
const app = express();

// Security Headers (Section 36)
const helmetMiddleware = (typeof helmet === 'function' ? helmet : (helmet as any).default) as (options?: any) => any;
app.use(
  helmetMiddleware({
    contentSecurityPolicy: false, // Allow API client usage
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS Configuration (Section 35)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        config.allowedOrigins.includes(origin) ||
        !config.isProduction ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Client-Version'],
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Middleware
app.use(requestIdMiddleware);
app.use(createRateLimiter(60000, 120));

// Route Mounts (Support /api/v1/*, /api/* and root paths)
app.use('/', healthRouter);
app.use('/health', healthRouter);
app.use('/api/health', healthRouter);
app.use('/api/v1/health', healthRouter);

app.use('/documents', documentRouter);
app.use('/api/documents', documentRouter);
app.use('/api/v1/documents', documentRouter);

app.use('/chat', documentRouter); // for /chat/query
app.use('/api/chat', documentRouter);
app.use('/api/v1/chat', documentRouter);

app.use('/spreadsheets', spreadsheetRouter);
app.use('/api/spreadsheets', spreadsheetRouter);
app.use('/api/v1/spreadsheets', spreadsheetRouter);

// Global Error Handler (Section 30)
app.use(errorHandler);

// Server startup (only bind port if not running in Vercel Serverless)
const PORT = config.PORT;
export let server: any = null;
if (!process.env.VERCEL) {
  server = app.listen(PORT, () => {
    logger.info(`Production Document Intelligence Backend listening on port ${PORT}`);
    logger.info(`Environment: ${config.NODE_ENV} | Extraction Model: ${config.GEMINI_EXTRACTION_MODEL}`);
    logger.info(`Gemini API Key status: ${config.GEMINI_API_KEY ? 'CONFIGURED (SECURE SERVER-SIDE ONLY)' : 'NOT_CONFIGURED (USING DETERMINISTIC ENGINE)'}`);
  });
}

export default app;
