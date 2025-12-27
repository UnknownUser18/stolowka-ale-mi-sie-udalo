import { Router } from "express";
import { createPacket, executeQuery, isDateString, isID, sendIncorrectDataValueResponse, sendResponse } from "../index";
import { ErrorPacket, Errors, StatusCodes } from "../types";

const router = Router({
  strict        : true,
  caseSensitive : true
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!isID(id))
    return sendIncorrectDataValueResponse(res);

  const result = await executeQuery(`SELECT * from skanyZ sZ where sZ.id_karty = :id`, { id });

  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
});

router.post('/add/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { date } = req.body;

  if (!isID(id) || !date || !isDateString(date))
    return sendIncorrectDataValueResponse(res);

  try {
    const result = await executeQuery(`INSERT INTO skanyZ (id_karty, czas) VALUES (:id, :date)`, { id, date });

    const packet = createPacket(result, StatusCodes.Inserted);
    return sendResponse(res, packet);
  } catch (error) {
    Errors('Error adding scan: ', error);
    const packet = new ErrorPacket(StatusCodes["Internal Server Error"]);
    return sendResponse(res, packet);
  }
});

export default router;