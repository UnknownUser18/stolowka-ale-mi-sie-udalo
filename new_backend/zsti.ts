import { Router } from 'express';

const router = Router({
  caseSensitive: true,
  strict: true,
});

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'ZSTI API is running',
    timestamp: new Date().toISOString(),
  });
})

export default router;