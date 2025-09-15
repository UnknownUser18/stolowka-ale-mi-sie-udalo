import { Router } from 'express';
import {Debug, ErrorPacket, Packet, StatusCodes} from "./types";
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
  const closedDays = await executeQuery('SELECT * FROM dniN order by dniN.dzien');
  const packet = createPacket(closedDays, StatusCodes.OK);
  return sendResponse(res, packet);
});

router.delete('/closed-days/delete/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (!id) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const result = await executeQuery(`DELETE FROM dniN WHERE dniN.id = :id`, { id,  });

  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
})

router.post('/closed-days/add', async (req, res) => {
  const { date } = req.body;

  Debug('Adding closed days:', date)

  if (!date) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const result = await executeQuery(`INSERT INTO dniN (dzien) VALUES(:date)`, { date });

  const packet = createPacket(result, StatusCodes.Inserted);
  return sendResponse(res, packet);
})

export default router;