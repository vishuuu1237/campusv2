import 'dotenv/config';

let cachedApp = null;
let initError = null;

async function getApp() {
  if (cachedApp) return cachedApp;
  if (initError) throw initError;

  try {
    const { default: express } = await import('express');
    const { default: cors } = await import('cors');
    const { default: authRoutes } = await import('./routes/auth.js');
    const { default: productRoutes } = await import('./routes/products.js');
    const { default: cartRoutes } = await import('./routes/cart.js');
    const { default: orderRoutes } = await import('./routes/orders.js');
    const { default: paymentRoutes } = await import('./routes/payment.js');

    const app = express();
    app.use(cors({ origin: '*' }));
    app.use(express.json());

    // Normalize URL for Vercel serverless function invocations
    app.use((req, res, next) => {
      if (req.url.startsWith('/api/index')) {
        req.url = req.url.replace(/^\/api\/index/, '') || '/';
      }
      next();
    });

    // Health check endpoints
    app.get(['/api/health', '/health', '/api', '/'], (req, res) => {
      res.json({ status: 'ok', message: 'Recampus API is running' });
    });

    // Mount routes
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/cart', cartRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/payment', paymentRoutes);

    app.use('/auth', authRoutes);
    app.use('/products', productRoutes);
    app.use('/cart', cartRoutes);
    app.use('/orders', orderRoutes);
    app.use('/payment', paymentRoutes);

    app.use((err, req, res, next) => {
      console.error('Express Error:', err);
      if (res.headersSent) return next(err);
      res.status(500).json({ error: 'Express Error', message: err.message, stack: err.stack });
    });

    cachedApp = app;
    return cachedApp;
  } catch (err) {
    initError = err;
    throw err;
  }
}

export default async function handler(req, res) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err) {
    console.error('CRITICAL API ERROR:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'CRASH_DURING_INITIALIZATION',
        message: err.message,
        code: err.code,
        stack: err.stack
      });
    }
  }
}
