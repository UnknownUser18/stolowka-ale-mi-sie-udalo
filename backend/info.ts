import { Router } from 'express';
import { Packet, StatusCodes } from "./types";
import { sendResponse, db, executeQuery, createPacket } from "./index";

const router = Router({
  caseSensitive : true,
  strict : true,
});

router.get('/health', (_req, res) => {
  db.then((conn) => {
    const packet = conn ? new Packet(StatusCodes.OK, 'Server is healthy') : new Packet(StatusCodes["Internal Server Error"], 'No database connection');
    sendResponse(res, packet);
  })
});

router.get('/closed-days', async (_req, res) => {
  const closedDays = await executeQuery('SELECT * FROM dniN');
  const packet = createPacket(closedDays, StatusCodes.OK);
  return sendResponse(res, packet);
});

export default router;