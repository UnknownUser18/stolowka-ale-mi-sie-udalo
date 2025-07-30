import { Router } from 'express';
import { executeQuery, queryWithResponse } from './index';
import { statusCodes } from "./types";

const router = Router({
  caseSensitive : true,
  strict : true,
});

router.get('/health', async (_req, res) => {
  await queryWithResponse(() => executeQuery('SELECT 1'), res, statusCodes.OK);
});

router.get('/users', async (_req, res) => {
  await queryWithResponse(() => executeQuery('SELECT * FROM osoby_zsti'), res, statusCodes.OK);
})

export default router;