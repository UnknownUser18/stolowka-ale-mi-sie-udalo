import { Router } from "express";
import { createPacket, executeQuery, isID, isString, sendIncorrectDataValueResponse, sendResponse } from "../index";
import { ErrorPacket, StatusCodes } from "../types";

const router = Router({
  strict        : true,
  caseSensitive : true
});

router.get('/:id_person', async (req, res) => {
  const id_person = parseInt(req.params.id_person, 10);

  if (!isID(id_person))
    return sendIncorrectDataValueResponse(res);

  const guardian = await executeQuery(`
      SELECT id_opiekun, imie_opiekuna, nazwisko_opiekuna, telefon, email, nr_kierunkowy
      FROM opiekunZ oz
               LEFT JOIN osobyZ o ON o.opiekun_id = oz.id_opiekun
      WHERE o.id = :id_person`, { id_person });

  const packet = createPacket(guardian, StatusCodes.OK);

  return sendResponse(res, packet);
});

router.put('/:id_person/update', async (req, res) => {
  const id_person = parseInt(req.params.id_person, 10);
  const { imie_opiekuna, nazwisko_opiekuna, nr_kierunkowy, telefon, email } = req.body;

  if (!isID(id_person) || (imie_opiekuna && !isString(imie_opiekuna)) || (nazwisko_opiekuna && !isString(nazwisko_opiekuna)) || // For adult guardians, names can be null so user doesn't have to provide them twice.
    !isID(nr_kierunkowy) || !isID(telefon) || !isString(email, 100))
    return sendIncorrectDataValueResponse(res);

  const result = await executeQuery(`
      UPDATE opiekunZ
      SET imie_opiekuna     = :imie_opiekuna,
          nazwisko_opiekuna = :nazwisko_opiekuna,
          nr_kierunkowy     = :nr_kierunkowy,
          telefon           = :telefon,
          email             = :email
      WHERE id_opiekun = (SELECT opiekun_id FROM osobyZ WHERE id = :id_person)`, { id_person, imie_opiekuna, nazwisko_opiekuna, nr_kierunkowy, telefon, email });


  const updatePacket = createPacket(result, StatusCodes.Updated);

  if (updatePacket instanceof ErrorPacket)
    return sendResponse(res, updatePacket);

  // Return the id of the guardian after update (needed for foreign key in osobyZ)

  if (imie_opiekuna === null && nazwisko_opiekuna === null) {
    // Adult guardian
    const guardian = await executeQuery(`
        SELECT id_opiekun
        FROM opiekunZ
        WHERE nr_kierunkowy = :nr_kierunkowy
          AND telefon = :telefon
          AND email = :email`, { nr_kierunkowy, telefon, email });

    const packet = createPacket(guardian, StatusCodes.Updated);

    return sendResponse(res, packet);
  }

  // Minor guardian
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

router.post('/get-id', async (req, res) => {
  const { imie_opiekuna, nazwisko_opiekuna, email, nr_kierunkowy, telefon } = req.body;

  if (!isString(imie_opiekuna) || !isString(nazwisko_opiekuna) ||
    !isID(nr_kierunkowy) || !isID(telefon) || !isString(email, 100))
    return sendIncorrectDataValueResponse(res);

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

export default router;