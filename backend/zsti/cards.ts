import { Router } from "express";
import { createPacket, executeQuery, sendIncorrectDataValueResponse, sendResponse } from "../index";
import { isDateString, isID, isNumber } from "./zsti";
import { StatusCodes } from "../types";

const router = Router({
  caseSensitive : true,
  strict        : true,
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!isID(id))
    return sendIncorrectDataValueResponse(res);

  const result = await executeQuery(`SELECT * from kartyZ kZ where kZ.id_ucznia = :id`, { id });

  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
});

router.delete('/:id/delete', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!isID(id))
    return sendIncorrectDataValueResponse(res);
  const result = await executeQuery(`DELETE FROM kartyZ WHERE id = :id`, { id });

  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
});

router.post('/add', async (req, res) => {
  const { id_ucznia, key_card, data_wydania } = req.body;

  if (!isID(id_ucznia) || !isNumber(key_card) || !isDateString(data_wydania))
    return sendIncorrectDataValueResponse(res);

  const result = await executeQuery(`INSERT INTO kartyZ (id_ucznia, key_card, data_wydania)
  VALUES (:id_ucznia, :key_card, :data_wydania)`, { id_ucznia, key_card, data_wydania });

  const packet = createPacket(result, StatusCodes.Inserted);
  return sendResponse(res, packet);
});

router.get('/withDetails', async (_req, res) => {
  const result = await executeQuery(`SELECT k_z.*, o_z.typ_osoby_id, o_z.imie, o_z.nazwisko, o_z.klasa, o_z.uczeszcza, o_z.miasto
  FROM kartyZ k_z
           LEFT JOIN osobyZ o_z ON o_z.id = k_z.id_ucznia
  ORDER BY o_z.nazwisko, o_z.imie;`)

  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
});

export default router;