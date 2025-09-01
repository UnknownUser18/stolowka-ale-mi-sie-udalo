import { Router } from 'express';
import { createPacket, executeQuery, sendResponse } from './index';
import { ErrorPacket, StatusCodes } from "./types";

const router = Router({
  caseSensitive : true,
  strict : true,
});

const baseGetPersonsQuery = `
    SELECT osobyZ.id AS id,
           typ_osoby_id,
           imie,
           nazwisko,
           klasy.nazwa AS klasa,
           uczeszcza,
           miasto,
           opiekun_id
    FROM osobyZ
             LEFT JOIN klasy ON osobyZ.klasa = klasy.id
             LEFT JOIN opiekunZ ON osobyZ.opiekun_id = opiekunZ.id_opiekun`;

router.get('/person', async (req, res) => {
  let limit : number | undefined;

  const limitParam = req.query.limit;

  if (typeof limitParam === 'string') {
    const parsedLimit = parseInt(limitParam, 10);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
      const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
      return sendResponse(res, packet);
    }
    limit = parsedLimit;
  }
  let query = baseGetPersonsQuery;

  if (limit !== undefined)
    query += ' LIMIT :limit';


  const persons = await executeQuery(query, limit !== undefined ? { limit } : undefined);

  const packet = createPacket(persons, StatusCodes.OK);
  return sendResponse(res, packet);
})

router.get('/person/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id < 1) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const person = await executeQuery(`${ baseGetPersonsQuery } WHERE osobyZ.id = ?`, { id });
  const packet = createPacket(person, StatusCodes.OK);
  return sendResponse(res, packet);
})

export default router;