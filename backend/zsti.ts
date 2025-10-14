import { Router } from 'express';
import { createPacket, executeQuery, sendResponse } from './index';
import { Debug, ErrorPacket, Info, StatusCodes } from "./types";

const router = Router({
  caseSensitive : true,
  strict : true,
});

function isID(id : any) : boolean {
  return !(!Number.isInteger(id) || id < 1);
}

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
    if (!isID(parsedLimit)) {
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
  if (isID(id)) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const person = await executeQuery(`${ baseGetPersonsQuery } WHERE osobyZ.id = ?`, { id });
  const packet = createPacket(person, StatusCodes.OK);
  return sendResponse(res, packet);
});

router.put('/person/:id/update', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { imie, nazwisko, klasa, uczeszcza, miasto, opiekun_id } = req.body;
  const opiekunIdValue = opiekun_id && typeof opiekun_id === 'object' && 'id_opiekun' in opiekun_id ? Number(opiekun_id.id_opiekun) : opiekun_id;

  if (!isID(id) || typeof imie !== 'string' || typeof nazwisko !== 'string' ||
    (klasa !== null && (typeof klasa !== 'string' || klasa.length > 5)) ||
    (typeof uczeszcza !== 'boolean') ||
    (typeof miasto !== 'boolean') ||
    (opiekunIdValue !== null && !isID(opiekunIdValue))) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const result = await executeQuery(`
      UPDATE osobyZ
      SET imie       = :imie,
          nazwisko   = :nazwisko,
          klasa      = (SELECT id FROM klasy WHERE nazwa = :klasa),
          uczeszcza  = :uczeszcza,
          miasto     = :miasto,
          opiekun_id = :opiekun_id
      WHERE id = :id`, { id, imie, nazwisko, klasa, uczeszcza, miasto, opiekun_id: opiekunIdValue });

  const packet = createPacket(result, StatusCodes.Updated);
  return sendResponse(res, packet);
});

router.get('/declaration/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!isID(id)) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const declaration = await executeQuery(`
      SELECT id,
             id_osoby,
             data_od,
             data_do,
             dni
      FROM deklaracjaZ
      WHERE id_osoby = :id`, { id });
  const packet = createPacket(declaration, StatusCodes.OK);

  return sendResponse(res, packet);
});

router.get('/declaration/:id/in_date', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const date = String(req.query.date)
  if (!isID(id) || !date) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const declaration = await executeQuery(`
      SELECT id,
             id_osoby,
             data_od,
             data_do,
             dni
      FROM deklaracjaZ
      WHERE id_osoby = :id
        AND :date between data_od and data_do`, { id, date });
  const packet = createPacket(declaration, StatusCodes.OK);

  return sendResponse(res, packet);
});

router.put('/declaration/:id/update', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { data_od, data_do, dni } = req.body;

  if (!isID(id) || (data_od !== null && typeof data_od !== 'string') ||
    (data_do !== null && typeof data_do !== 'string') ||
    (typeof dni !== 'string' || dni.length !== 5 || !/^[01]{5}$/.test(dni))) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const result = await executeQuery(`
      UPDATE deklaracjaZ
      SET data_od = :data_od,
          data_do = :data_do,
          dni     = :dni
      WHERE id = :id`, { id, data_od, data_do, dni });

  const packet = createPacket(result, StatusCodes.Updated);
  return sendResponse(res, packet);
});

router.post('/declaration/add', async (req, res) => {
  const { id_osoby, data_od, data_do, dni } = req.body;

  if (!isID(id_osoby) ||
    (data_od !== null && typeof data_od !== 'string') ||
    (data_do !== null && typeof data_do !== 'string') ||
    (typeof dni !== 'string' || dni.length !== 5 || !/^[01]{5}$/.test(dni))) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const result = await executeQuery(`INSERT INTO deklaracjaZ (id_osoby, data_od, data_do, dni) VALUES (:id_osoby, :data_od, :data_do, :dni)`, { id_osoby, data_od, data_do, dni });

  const packet = createPacket(result, StatusCodes.Inserted);
  return sendResponse(res, packet);
})

router.delete('/declaration/:id/delete', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!isID(id)) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const result = await executeQuery(`DELETE FROM deklaracjaZ WHERE id = :id`, { id });

  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
});

router.get('/absence/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!isID(id)) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const absenceDays = await executeQuery(`
      SELECT id,
             zsti_id,
             dzien_wypisania
      FROM nieobecnosciZ
      WHERE zsti_id = :id`, { id });
  const packet = createPacket(absenceDays, StatusCodes.OK);
  return sendResponse(res, packet);
});

router.post('/absence/:id/add', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { dzien_wypisania } = req.body;

  if (!isID(id) || typeof dzien_wypisania !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dzien_wypisania)) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const result = await executeQuery(`INSERT INTO nieobecnosciZ (zsti_id, dzien_wypisania) VALUES (:id, :dzien_wypisania)`, { id, dzien_wypisania });

  const packet = createPacket(result, StatusCodes.Inserted);
  return sendResponse(res, packet);
});

router.delete('/absence/:id/delete', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { dzien_wypisania } = req.body;

  if (!isID(id) || typeof dzien_wypisania !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dzien_wypisania)) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const result = await executeQuery(`DELETE FROM nieobecnosciZ WHERE zsti_id = :id AND dzien_wypisania = :dzien_wypisania`, { id, dzien_wypisania });

  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
});

router.get('/guardian/:id_person', async (req, res) => {
  const id_person = parseInt(req.params.id_person, 10);

  if (!isID(id_person)) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const guardian = await executeQuery(`
      SELECT id_opiekun, imie_opiekuna, nazwisko_opiekuna, telefon, email, nr_kierunkowy
      FROM opiekunZ oz
               LEFT JOIN osobyZ o ON o.opiekun_id = oz.id_opiekun
      WHERE o.id = :id_person`, { id_person });
  const packet = createPacket(guardian, StatusCodes.OK);
  return sendResponse(res, packet);
});

router.put('/guardian/:id_person/update', async (req, res) => {
  const id_person = parseInt(req.params.id_person, 10);
  const { imie_opiekuna, nazwisko_opiekuna, nr_kierunkowy, telefon, email } = req.body;

  if (!isID(id_person) || typeof imie_opiekuna !== 'string' || typeof nazwisko_opiekuna !== 'string' ||
    !isID(nr_kierunkowy) || !isID(telefon) ||
    (typeof email !== 'string' || email.length > 100)) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const result = await executeQuery(`
      UPDATE opiekunZ
      SET imie_opiekuna     = :imie_opiekuna,
          nazwisko_opiekuna = :nazwisko_opiekuna,
          nr_kierunkowy     = :nr_kierunkowy,
          telefon           = :telefon,
          email             = :email
      WHERE id_opiekun = (SELECT opiekun_id FROM osobyZ WHERE id = :id_person)`, { id_person, imie_opiekuna, nazwisko_opiekuna, nr_kierunkowy, telefon, email });


  const successPacket = createPacket(result, StatusCodes.Updated);

  if (successPacket instanceof ErrorPacket) {
    return sendResponse(res, successPacket);
  }

  // Return the id of the guardian after update (needed for foreign key in osobyZ)
  const guardian = await executeQuery(`
      SELECT id_opiekun
      FROM opiekunZ
      WHERE imie_opiekuna = :imie_opiekuna
        AND nazwisko_opiekuna = :nazwisko_opiekuna
        AND email = :email
        AND nr_kierunkowy = :nr_kierunkowy
        AND telefon = :telefon`, { imie_opiekuna, nazwisko_opiekuna, email, nr_kierunkowy, telefon });

  const packet = createPacket(guardian, StatusCodes.Updated);

  return sendResponse(res, packet);
});

router.post('/guardian/get-id', async (req, res) => {
  const { imie_opiekuna, nazwisko_opiekuna, email, nr_kierunkowy, telefon } = req.body;

  if (typeof imie_opiekuna !== 'string' || typeof nazwisko_opiekuna !== 'string' ||
    !isID(nr_kierunkowy) || !isID(telefon) ||
    (typeof email !== 'string' || email.length > 100)) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const guardian = await executeQuery(`
      SELECT id_opiekun
      FROM opiekunZ
      WHERE imie_opiekuna = :imie_opiekuna
        AND nazwisko_opiekuna = :nazwisko_opiekuna
        AND email = :email
        AND nr_kierunkowy = :nr_kierunkowy
        AND telefon = :telefon`, { imie_opiekuna, nazwisko_opiekuna, email, nr_kierunkowy, telefon });

  const packet = createPacket(guardian, StatusCodes.OK);
  return sendResponse(res, packet);
});

router.get('/payment/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!isID(id)) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const result = await executeQuery(`SELECT * from platnosciZ pZ where pZ.id_ucznia = :id`, { id });

  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
})

router.get('/scan/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!isID(id)) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const result = await executeQuery(`SELECT * from skanyZ sZ where sZ.id_karty = :id`, { id });

  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
})

router.post('/scan/add/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { date } = req.body;

  Info(`Scanning of card id: ${ id }, at date: ${ date }`);

  if (!isID(id) || !date || isNaN(Date.parse(String(date)))) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"]);
    return sendResponse(res, packet);
  }

  try {
    const result = await executeQuery(
      `INSERT INTO skanyZ (id_karty, czas) VALUES (:id, :date)`,
      { id, date }
    );

    const packet = createPacket(result, StatusCodes.Inserted);
    return sendResponse(res, packet);
  } catch (error) {
    console.error('Database error:', error);
    const packet = new ErrorPacket(StatusCodes["Internal Server Error"]);
    return sendResponse(res, packet);
  }
})

router.get('/card/withDetails', async (_req, res) => {
  const result = await executeQuery(`SELECT k_z.*, o_z.typ_osoby_id, o_z.imie, o_z.nazwisko, o_z.klasa, o_z.uczeszcza, o_z.miasto
  FROM kartyZ k_z
           LEFT JOIN osobyZ o_z ON o_z.id = k_z.id_ucznia
  ORDER BY o_z.nazwisko, o_z.imie;`)

  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
})

router.get('/pricing', async (_req, res) => {
  const result = await executeQuery(`SELECT * from cennikZ order by data_od;`)

  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
})

router.post('/pricing/add', async (req, res) => {
  const { date_start, date_end, price } = req.body;

  if (!date_start || !price) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"]);
    return sendResponse(res, packet);
  }

  const result = await executeQuery(`INSERT INTO cennikZ (data_od, data_do, cena) VALUES (:data_od, :data_do, :cena)`, { data_od : date_start, data_do : date_end, cena : price });

  const packet = createPacket(result, StatusCodes.Inserted);
  return sendResponse(res, packet);
})

router.delete('/pricing/delete/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (!isID(id)) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const result = await executeQuery(`DELETE FROM cennikZ WHERE id = :id`, { id });

  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
})

router.put('/pricing/update/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { date_start, date_end, price } = req.body;
  Debug('pricing update dataq: ', { id, date_start, date_end, price });
  if (!isID(id) || !date_start || !date_end || !price) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const result = await executeQuery(`UPDATE cennikZ SET data_od = :data_od, data_do = :data_do, cena = :cena WHERE id = :id`, { id, data_od : date_start, data_do : date_end, cena : price });

  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
})

router.get('/pricing/not-in-dates/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { date_start, date_end } = req.query;
  if (!isID(id) || !date_start || !date_end) {
    const packet = new ErrorPacket(StatusCodes["Incorrect data value"])
    return sendResponse(res, packet);
  }

  const result = await executeQuery(`SELECT COUNT(*) as cnt
  FROM cennikZ c
  WHERE id != :id
    AND ((:data_od BETWEEN c.data_od AND c.data_do) OR (:data_do BETWEEN c.data_od AND c.data_do) OR ((:data_od < c.data_od) AND (c.data_do < :data_do)))`, { id, data_od : date_start, data_do : date_end });


  const packet = createPacket(result, StatusCodes.OK);
  return sendResponse(res, packet);
})

export default router;