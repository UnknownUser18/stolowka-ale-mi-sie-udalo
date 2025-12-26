import { Router } from "express";
import { isBoolean, isDateString, isDniCode, isID } from "./zsti";
import { createPacket, executeQuery, getData, sendIncorrectDataValueResponse, sendResponse } from "../index";
import { ErrorPacket, StatusCodes } from "../types";

const router = Router({
  strict        : true,
  caseSensitive : true
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!isID(id)) return sendIncorrectDataValueResponse(res)

  const declaration = await executeQuery(`SELECT id, id_osoby, data_od, data_do, dni, obiad, sniadanie
  FROM deklaracjaZ
  WHERE id_osoby = :id`, { id });
  const packet = createPacket(declaration, StatusCodes.OK);

  if (packet instanceof ErrorPacket)
    return sendResponse(res, packet);

  packet.data = [getData(packet).map((declaration : any) => {
    declaration.sniadanie = declaration.sniadanie === 1;
    declaration.obiad = declaration.obiad === 1;
    return declaration;
  })]


  return sendResponse(res, packet);
});

router.get('/:id/in_date', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const date = String(req.query.date);
  if (!isID(id) || !date)
    return sendIncorrectDataValueResponse(res);

  const declaration = await executeQuery(`SELECT id, id_osoby, data_od, data_do
  FROM deklaracjaZ
  WHERE id_osoby = :id
    AND :date between data_od and data_do`, { id, date });
  const packet = createPacket(declaration, StatusCodes.OK);

  return sendResponse(res, packet);
});

router.put('/:id/update', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { data_od, data_do, dni, sniadanie, obiad } = req.body;


  if (!isID(id) || !isDateString(data_do) || !isDateString(data_od) || !isDniCode(dni) || !isBoolean(sniadanie) || !isBoolean(obiad))
    return sendIncorrectDataValueResponse(res);

  const result = await executeQuery(`
      UPDATE deklaracjaZ
      SET data_od   = :data_od,
          data_do   = :data_do,
          dni       = :dni,
          sniadanie = :sniadanie,
          obiad     = :obiad
      WHERE id = :id`, { id, data_od, data_do, dni, sniadanie, obiad });

  const packet = createPacket(result, StatusCodes.Updated);
  return sendResponse(res, packet);
});

router.post('/add', async (req, res) => {
  const { id_osoby, data_od, data_do, dni, sniadanie, obiad } = req.body;

  if (!isID(id_osoby) || !isDateString(data_do) || !isDateString(data_od) || !isDniCode(dni) || !isBoolean(sniadanie) || !isBoolean(obiad))
    return sendIncorrectDataValueResponse(res);

  const result = await executeQuery(`INSERT INTO deklaracjaZ (id_osoby, data_od, data_do, dni, sniadanie, obiad)
  VALUES (:id_osoby, :data_od, :data_do, :dni, :sniadanie, :obiad)`, { id_osoby, data_od, data_do, dni, sniadanie, obiad });

  const packet = createPacket(result, StatusCodes.Inserted);
  return sendResponse(res, packet);
})

router.delete('/:id/delete', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!isID(id))
    return sendIncorrectDataValueResponse(res);

  const result = await executeQuery(`DELETE FROM deklaracjaZ WHERE id = :id`, { id });

  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
});

export default router;