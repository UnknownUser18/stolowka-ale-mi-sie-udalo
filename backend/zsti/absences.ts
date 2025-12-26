import { Router } from "express";
import { isID, isString } from "./zsti";
import { createPacket, executeQuery, sendIncorrectDataValueResponse, sendResponse } from "../index";
import { StatusCodes } from "../types";

const router = Router({
  strict        : true,
  caseSensitive : true
});

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!isID(id))
    return sendIncorrectDataValueResponse(res);

  const absenceDays = await executeQuery(`
      SELECT id,
             zsti_id,
             dzien_wypisania
      FROM nieobecnosciZ
      WHERE zsti_id = :id`, { id });
  const packet = createPacket(absenceDays, StatusCodes.OK);
  return sendResponse(res, packet);
});

router.post('/:id/add', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { dzien_wypisania } = req.body;

  if (!isID(id) || !isString(dzien_wypisania) || !dateRegex.test(dzien_wypisania))
    return sendIncorrectDataValueResponse(res);

  const result = await executeQuery(`INSERT INTO nieobecnosciZ (zsti_id, dzien_wypisania) VALUES (:id, :dzien_wypisania)`, { id, dzien_wypisania });

  const packet = createPacket(result, StatusCodes.Inserted);
  return sendResponse(res, packet);
});

router.delete('/:id/delete', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { dzien_wypisania } = req.body;

  if (!isID(id) || !isString(dzien_wypisania) || !dateRegex.test(dzien_wypisania))
    return sendIncorrectDataValueResponse(res);

  const result = await executeQuery(`DELETE FROM nieobecnosciZ WHERE zsti_id = :id AND dzien_wypisania = :dzien_wypisania`, { id, dzien_wypisania });

  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
});

export default router;