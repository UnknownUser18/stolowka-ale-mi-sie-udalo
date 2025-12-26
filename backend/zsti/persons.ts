import { Router } from "express";
import { isBoolean, isID, isString } from "./zsti";
import { ErrorPacket, StatusCodes } from "../types";
import { createPacket, executeQuery, getData, sendIncorrectDataValueResponse, sendResponse } from "../index";

const router = Router({
  strict        : true,
  caseSensitive : true,
});

function getOpiekunId(opiekun : any) : number | null {
  if (!opiekun)
    return null;

  if (isID(opiekun))
    return opiekun;

  if (typeof opiekun === 'object' && 'id_opiekun' in opiekun && isID(opiekun.id_opiekun))
    return opiekun.id_opiekun;

  return null;
}

function mapPersons(persons : any[]) : any[] {
  return persons.map((person) => {
    person.uczeszcza = person.uczeszcza === 1;
    person.miasto = person.miasto === 1;
    return person;
  });
}

const baseGetPersonsQuery = `SELECT osobyZ.id AS id, typ_osoby_id, imie, nazwisko, klasy.nazwa AS klasa, uczeszcza, miasto, opiekun_id
FROM osobyZ
         LEFT JOIN klasy ON osobyZ.klasa = klasy.id
         LEFT JOIN opiekunZ ON osobyZ.opiekun_id = opiekunZ.id_opiekun`;

router.get('/', async (req, res) => {
  let ids : number[] | null = null;
  if (req.query.ids) {
    if (isString(req.query.ids)) {
      ids = (req.query.ids as string).split(',').map((id) => parseInt(id, 10));
      for (const id of ids) {
        if (!isID(id))
          return sendIncorrectDataValueResponse(res);
      }
    } else {
      return sendIncorrectDataValueResponse(res);
    }
  }

  let persons;
  if (ids && ids.length > 0) {
    const placeholders = ids.map(() => '?').join(', ');
    persons = await executeQuery(`${ baseGetPersonsQuery } WHERE osobyZ.id IN (${ placeholders })`, ids);
  } else
    persons = await executeQuery(baseGetPersonsQuery);

  const packet = createPacket(persons, StatusCodes.OK);

  if (packet instanceof ErrorPacket)
    return sendResponse(res, packet);

  packet.data = [mapPersons(getData(packet))];

  return sendResponse(res, packet);
})

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isID(id))
    return sendIncorrectDataValueResponse(res);

  const person = await executeQuery(`${ baseGetPersonsQuery } WHERE osobyZ.id = ?`, { id });
  const packet = createPacket(person, StatusCodes.OK);

  if (packet instanceof ErrorPacket)
    return sendResponse(res, packet);

  packet.data = [mapPersons(getData(packet))];

  return sendResponse(res, packet);
});

router.put('/:id/update', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { imie, nazwisko, klasa, uczeszcza, miasto, opiekun_id } = req.body;

  const opiekunIdValue = getOpiekunId(opiekun_id);

  if (!isID(id) || !isString(imie) || !isString(nazwisko) ||
    (klasa !== null && !isString(klasa, 5)) || !isBoolean(uczeszcza) || !isBoolean(miasto)) {
    return sendIncorrectDataValueResponse(res);
  }

  const result = await executeQuery(`
      UPDATE osobyZ
      SET imie       = :imie,
          nazwisko   = :nazwisko,
          klasa      = (SELECT id FROM klasy WHERE nazwa = :klasa),
          uczeszcza  = :uczeszcza,
          miasto     = :miasto,
          opiekun_id = :opiekun_id
      WHERE id = :id`, { id, imie, nazwisko, klasa, uczeszcza, miasto, opiekun_id : opiekunIdValue });

  const packet = createPacket(result, StatusCodes.Updated);
  return sendResponse(res, packet);
});

export default router;