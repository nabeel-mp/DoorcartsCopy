const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');

const { generalApiLimiter } = require('./middleware/rateLimiters');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const walletRoutes = require('./routes/walletRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Sets a battery of standard security-related HTTP response headers
// (X-Content-Type-Options, X-Frame-Options, HSTS, etc). Cheap to add,
// meaningfully reduces the attack surface.
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5174',
    credentials: true
  })
);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// App-wide safety net against scraping/abuse. The OTP routes additionally
// get their own tighter limiters (see routes/authRoutes.js) since they're
// the routes most worth protecting (SMS cost, account enumeration).
app.use('/api', generalApiLimiter);

// express.json()'s `verify` callback captures the raw request body onto
// req.rawBody BEFORE it's parsed into JSON. This is required so the
// Razorpay webhook route can recompute the HMAC signature over the exact
// bytes Razorpay sent - JSON.stringify(req.body) would not reliably match.
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    }
  })
);
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Doorcarts API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/wallet', walletRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;