import { Router } from "express";
import { createPacket, executeQuery, isDateString, isID, isNumber, sendIncorrectDataValueResponse, sendResponse } from "../index";
import { StatusCodes } from "../types";

const router = Router({
  strict        : true,
  caseSensitive : true
});

router.get('/', async (_req, res) => {
  const result = await executeQuery(`SELECT * from cennikZ order by data_od;`)

  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
});

router.post('/add', async (req, res) => {
  const { date_start, date_end, price } = req.body;

  if (!isDateString(date_start) || !isDateString(date_end) || !isNumber(price))
    return sendIncorrectDataValueResponse(res);

  const result = await executeQuery(`INSERT INTO cennikZ (data_od, data_do, cena) VALUES (:data_od, :data_do, :cena)`, { data_od : date_start, data_do : date_end, cena : price });

  const packet = createPacket(result, StatusCodes.Inserted);
  return sendResponse(res, packet);
});

router.delete('/delete/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (!isID(id))
    return sendIncorrectDataValueResponse(res);

  const result = await executeQuery(`DELETE FROM cennikZ WHERE id = :id`, { id });

  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
});

router.put('/update/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { date_start, date_end, price } = req.body;

  if (!isID(id) || !isDateString(date_start) || !isDateString(date_end) || !isNumber(price))
    return sendIncorrectDataValueResponse(res);

  const result = await executeQuery(`UPDATE cennikZ SET data_od = :data_od, data_do = :data_do, cena = :cena WHERE id = :id`, { id, data_od : date_start, data_do : date_end, cena : price });

  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
});

router.get('/pricing/not-in-dates/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { date_start, date_end } = req.query;

  if (!isID(id) || !isDateString(date_start) || !isDateString(date_end))
    return sendIncorrectDataValueResponse(res);

  const result = await executeQuery(`SELECT COUNT(*) as cnt
  FROM cennikZ c
  WHERE id != :id
    AND ((:data_od BETWEEN c.data_od AND c.data_do) OR (:data_do BETWEEN c.data_od AND c.data_do) OR ((:data_od < c.data_od) AND (c.data_do < :data_do)))`, { id, data_od : date_start, data_do : date_end });

  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
});

export default router;