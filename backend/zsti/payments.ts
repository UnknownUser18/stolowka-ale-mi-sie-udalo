import { Router } from "express";
import { isDateString, isID, isMonth, isNumber, isString } from "./zsti";
import { createPacket, executeQuery, sendIncorrectDataValueResponse, sendResponse } from "../index";
import { StatusCodes } from "../types";

const router = Router({
  strict        : true,
  caseSensitive : true
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!isID(id))
    return sendIncorrectDataValueResponse(res);

  const result = await executeQuery(`SELECT * from platnosciZ pZ where pZ.id_ucznia = :id`, { id });

  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
});

router.put('/:id/update', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { platnosc, data_platnosci, miesiac, rok, opis } = req.body;

  if (!isID(id) || !isNumber(platnosc) || !isDateString(data_platnosci) || !isMonth(miesiac) || !isID(rok) || (opis && isString(opis)))
    return sendIncorrectDataValueResponse(res);

  const result = await executeQuery(`
      UPDATE platnosciZ
      SET platnosc       = :platnosc,
          data_platnosci = :data_platnosci,
          miesiac        = :miesiac,
          rok            = :rok,
          opis           = :opis
      WHERE id = :id`, { id, platnosc, data_platnosci, miesiac, rok, opis });

  const packet = createPacket(result, StatusCodes.Updated);
  return sendResponse(res, packet);
});

router.delete('/:id/delete', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!isID(id))
    return sendIncorrectDataValueResponse(res);

  const result = await executeQuery(`DELETE FROM platnosciZ WHERE id = :id`, { id });

  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
});

router.post('/add', async (req, res) => {
  const { id_osoby, platnosc, data_platnosci, miesiac, rok, opis } = req.body;

  if (!isID(id_osoby) || !isNumber(platnosc) || !isDateString(data_platnosci) || !isMonth(miesiac) || !isID(rok) || (opis && isString(opis)))
    return sendIncorrectDataValueResponse(res);

  const result = await executeQuery(`INSERT INTO platnosciZ (id_ucznia, platnosc, data_platnosci, miesiac, rok, opis)
  VALUES (:id_ucznia, :platnosc, :data_platnosci, :miesiac, :rok, :opis)`, { id_ucznia : id_osoby, platnosc, data_platnosci, miesiac, rok, opis });

  const packet = createPacket(result, StatusCodes.Inserted);
  return sendResponse(res, packet);
});

export default router;