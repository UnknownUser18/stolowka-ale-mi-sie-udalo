import { Router } from 'express';
import { preparePacket } from './index';
import { statusCodes } from "./types";

const router = Router({
  caseSensitive : true,
  strict : true,
});

router.get('/health', (req, res) => {
  res.status(statusCodes.OK).send(preparePacket(statusCodes.OK, 'Service is healthy'));
})

export default router;