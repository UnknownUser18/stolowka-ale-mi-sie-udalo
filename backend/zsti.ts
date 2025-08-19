import { Router } from 'express';
import { executeQuery, isQuerySuccesful, sendResponse } from './index';
import { ErrorPacket, getStatusCodeByCode, Packet, StatusCodes } from "./types";
import { QueryError } from "mysql2/promise";

const router = Router({
  caseSensitive : true,
  strict : true,
});

router.get('/person', async (_req, res) => {
  const persons = await executeQuery('SELECT * FROM osobyZ');
  const packet = isQuerySuccesful(persons)
    ? new Packet(StatusCodes.OK, persons)
    : new ErrorPacket(getStatusCodeByCode(parseInt((persons as QueryError).code)));
  return sendResponse(res, packet);
})

export default router;