import { Router } from 'express';
import { createPacket, executeQuery, sendResponse } from './index';
import { ErrorPacket, StatusCodes } from "./types";

const router = Router({
  caseSensitive : true,
  strict : true,
});

router.get('/person', async (_req, res) => {
  const persons = await executeQuery('SELECT * FROM osobyZ');

  const packet = createPacket(persons, StatusCodes.OK);
  return sendResponse(res, packet);
})

router.get('/person/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id < 1) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const person = await executeQuery('SELECT * FROM osobyZ WHERE id = :id', { id });
  const packet = createPacket(person, StatusCodes.OK);
  return sendResponse(res, packet);
})

export default router;