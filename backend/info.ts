import { Router } from 'express';
import { Packet, StatusCodes } from "./types";
import { sendResponse, db } from "./index";

const router = Router({
  caseSensitive : true,
  strict : true,
});

router.get('/health', (_req, res) => {
  db.then((conn) => {
    const packet = conn ? new Packet(StatusCodes.OK, 'Server is healthy') : new Packet(StatusCodes["Internal Server Error"], 'No database connection');
    sendResponse(res, packet);
  })
})

export default router;