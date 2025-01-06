import mysql from "mysql";
import ws from "ws";

const wss = new ws.WebSocketServer({
  port: 8080,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      level: 3,
      memLevel: 7
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024 // Size (in bytes) below which messages
    // should not be compressed if context takeover is disabled.
  }
});
console.log("Waiting for connection...");
wss.on('connection', function connection(ws) {
    ws.send("Succesfully connected to the server")

    ws.on('error', console.error);

    ws.on('message', function message(data) {
        if(typeof data != 'object') return;
        let object = JSON.parse(data)
        if(object.action !== "request") return;
        handleRequest(ws, object.params);
    });
});

const serverPassword = process.argv.slice(2,6)[0]
const dbPassword = process.env.dbPassword
const dbHost = process.env.dbHost
const dbPort = process.env.dbPort
const dbConfig = {
    host: dbHost,
    port: dbPort,
    user: "root",
    password: dbPassword,
    database: "stolowka"
}
let database = mysql.createConnection(dbConfig);
handleDisconnect();

function handleDisconnect() {
    database.on('error', function (err) {
        console.error('Db error: ', err);
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

function handleRequest(ws,params) {
    const actions = {
        "CardScan": () => CardScan(params.id_ucznia, params.timestamp),
        "AnyQuery": () => QueryExecute(ws, params.query, params.password, params.responseBool, params.variable),
        "StudentList": () => StudentList(ws, params.condition),
        "CalendarStudent": () => CalendarStudent(ws, params.id_ucznia, params.relationBool, params.isAll),
        "StudentMeal": () => StudentMeal(ws, params.id_ucznia),
        "CalendarAdd": () => CalendarAdd(ws, params.id_ucznia, params.data, params.mealId),
        "CalendarDelete": () => CalendarDelete(ws, params.studentId, params.data, params.mealId),
        "UpdateStudent": () => UpdateStudent(ws, params.studentId, params.name, params.surname, params.mealId),
        "DeleteStudent": () => DeleteStudent(ws, params.studentId),
        "getStudentDeclarationInternat": () => getStudentDeclarationInternat(ws),
        "getStudentDeclarationZsti": () => getStudentDeclarationZsti(ws),
        "changeStudentDeclarationInternat": () => changeStudentDeclarationInternat(params.studentId, params.schoolYearId, params.wersja, params.beginDate, params.endDate),
        "changeStudentDeclarationZsti": () => changeStudentDeclarationZsti(params.studentId, params.schoolYearId, params.days, params.beginDate, params.endDate),
        "changeStudentInternat": () => changeStudentInternat(params.studentId, params.name, params.surname, params.attends),
        "changeStudentZsti": () => changeStudentZsti(params.studentId, params.type, params.name, params.surname, params.class, params.attends),
        "getStudentListZsti": () => getStudentListZsti(ws),
        "getStudentListInternat": () => getStudentListInternat(ws),
        "getStudentZstiDays": () => getStudentZstiDays(ws, params.studentId),
        "getStudentDisabledZstiDays": () => getStudentDisabledZstiDays(ws, params.studentId),
        "getStudentInternatDays": () => getStudentInternatDays(ws, params.studentId),
        "getStudentDisabledInternatDays": () => getStudentDisabledInternatDays(ws, params.studentId),
        "AddZstiDays": () => AddZstiDays(params.studentId, params.date, params.schoolYearId),
        "AddDisabledZstiDays": () => AddDisabledZstiDays(params.studentId, params.date, params.schoolYearId),
        "AddInternatDays": () => AddInternatDays(params.studentId, params.date, params.mealId, params.schoolYearId),
        "AddDisabledInternatDays": () => AddDisabledInternatDays(params.studentId, params.date, params.schoolYearId, params.mealId),
        "DeleteZstiDays": () => DeleteZstiDays(params.studentId, params.date),
        "DeleteDisabledZstiDays": () => DeleteDisabledZstiDays(params.studentId, params.date),
        "DeleteInternatDays": () => DeleteInternatDays(params.studentId, params.date, params.mealId),
        "DeleteDisabledInternatDays": () => DeleteDisabledInternatDays(params.studentId, params.date, params.mealId),
        "getDniNieczynne": () => getDniNieczynne(ws),
        "DeleteDniNieczynne": () => DeleteDniNieczynne(params.date),
        "AddDniNieczynne": () => AddDniNieczynne(params.date),
        "getSchoolYears": () => getSchoolYears(ws),
        "addSchoolYear": () => addSchoolYear(params.year),
        "DeleteStudentZsti": () => DeleteStudentZsti(params.studentId),
        "addZstiDeclaration": () => addZstiDeclaration(params.studentId, params.schoolYearId, params.beginDate, params.endDate, params.days),
        "addInternatDeclaration": () => addInternatDeclaration(params.studentId, params.schoolYearId, params.beginDate, params.endDate, params.wersja),
        "addZstiStudent": () => addZstiStudent(ws, params.name, params.surname, params.class, params.attends, params.type),
        "addInternatStudent": () => addInternatStudent(ws, params.name, params.surname, params.attends),
        "getPaymentZsti": () => getPaymentZsti(ws),
        "addPaymentZsti": () => addPaymentZsti(params.studentId, params.cost, params.date, params.month, params.description),
        "DeletePaymentZsti": () => DeletePaymentZsti(params.id),
        "getPaymentInternat": () => getPaymentInternat(ws),
        "addPaymentInternat": () => addPaymentInternat(params.studentId, params.cost, params.date, params.month, params.description),
        "DeletePaymentInternat": () => DeletePaymentInternat(params.id),
        "getKartyZsti": () => getKartyZsti(ws),
        "DeleteKartyZsti": () => DeleteKartyZsti(params.id),
        "addKartyZsti": () => addKartyZsti(params.studentId, params.keyCard, params.beginDate, params.lastUse),
        "getKartyInternat": () => getKartyInternat(ws),
        "DeleteKartyInternat": () => DeleteKartyInternat(params.id),
        "addKartyInternat": () => addKartyInternat(params.studentId, params.keyCard, params.beginDate, params.lastUse),
        "getStudentFromCardZsti": () => getStudentFromCardZsti(ws, params.keyCard),
        "getStudentFromCardInternat": () => getStudentFromCardInternat(ws, params.keyCard),
        "addScanZsti": () => addScanZsti(params.cardId, params.datetime),
        "getScanZsti": () => getScanZsti(ws),
        "addScanInternat": () => addScanInternat(params.cardId, params.datetime, params.meal),
        "getScanInternat": () => getScanInternat(ws)
    }
    if(actions[params.method]) {
        actions[params.method]();
    }
}
function executeQuery(query, callback) {
    return database.query(query, (err, result) => {
        if(err) throw err;
        callback(result);
    });
}
function sendResponse(ws, variable, value) {
    ws.send(JSON.stringify(
        {
            action: "response",
            params: {
                variable: variable,
                value: value
            }
        }
    ))
}
function getScanInternat(ws) {
    executeQuery(`SELECT * FROM skany_internat;`, result => sendResponse(ws, 'ScanInternat', result));
}

function addScanInternat(cardId, datetime, meal) {
    executeQuery(`INSERT INTO skany_internat (id_karty, czas, posilek) values(${cardId}, '${datetime}', ${meal})`, result => console.log(result));
}


function getScanZsti(ws) {
    executeQuery(`SELECT * FROM skany_zsti;`, result => sendResponse(ws, 'ScanZsti', result));
}

function addScanZsti(cardId, datetime) {
    executeQuery(`INSERT INTO skany_zsti (id_karty, czas) values(${cardId}, '${datetime}')`, result => console.log(result));
}

function getStudentFromCardZsti(ws, keyCard) {
    executeQuery(`SELECT * FROM karty_zsti WHERE key_card = ${keyCard}`, result => sendResponse(ws, 'StudentCardZsti', result));
}

function getStudentFromCardInternat(ws, keyCard) {
    executeQuery(`SELECT * FROM karty_internat WHERE key_card = ${keyCard}`, result => sendResponse(ws, 'StudentCardInternat', result));
}


function addKartyInternat(studentId, keyCard, beginDate, lastUse) {
    let query;
    if(lastUse) {
        query = `INSERT INTO karty_internat (id_ucznia, key_card, data_wydania, ostatnie_uzycie) VALUES(${studentId}, ${keyCard}, '${beginDate}', '${lastUse}')`;
    }
    else {
        query = `INSERT INTO karty_internat (id_ucznia, key_card, data_wydania) VALUES(${studentId}, ${keyCard}, '${beginDate}')`;
    }
    executeQuery(query, result => console.log(result));
}


function DeleteKartyInternat(id) {
    executeQuery(`DELETE FROM karty_internat WHERE id = ${id};`, result => console.log(result));
}

function getKartyInternat(ws) {
    executeQuery(`SELECT * FROM karty_internat;`, result => sendResponse(ws, 'CardsInternat', result));
}

function addKartyZsti(studentId, keyCard, beginDate, lastUse) {
    let query;
    if(lastUse) {
        query = `INSERT INTO karty_zsti (id_ucznia, key_card, data_wydania, ostatnie_uzycie) VALUES(${studentId}, ${keyCard}, '${beginDate}', '${lastUse}')`;
    }
    else {
        query = `INSERT INTO karty_zsti (id_ucznia, key_card, data_wydania) VALUES(${studentId}, ${keyCard}, '${beginDate}')`;
    }
    executeQuery(query, result => console.log(result));
}


function DeleteKartyZsti(id) {
    executeQuery(`DELETE FROM karty_zsti WHERE id = ${id};`, result => console.log(result));
}

function getKartyZsti(ws) {
    executeQuery(`SELECT * FROM karty_zsti;`, result => sendResponse(ws, 'CardsZsti', result));
}

function getPaymentInternat(ws) {
    executeQuery(`SELECT * FROM platnosci_internat;`, result => sendResponse(ws, 'PaymentInternat', result));
}

function addPaymentInternat(id, cost, date, month, description) {
    executeQuery(`INSERT INTO platnosci_internat (id_ucznia, platnosc, data_platnosci, miesiac, opis) values(${id}, ${cost}, '${date}', ${month}, '${description}')`, result => console.log(result));
}

function DeletePaymentInternat(id) {
    executeQuery(`DELETE FROM platnosci_internat WHERE id = ${id};`, result => console.log(result));
}

function getPaymentZsti(ws) {
    executeQuery(`SELECT * FROM platnosci_zsti;`, result => sendResponse(ws, 'PaymentZsti', result));
}

function addPaymentZsti(id, cost, date, month, description) {
    executeQuery(`INSERT INTO platnosci_zsti (id_ucznia, platnosc, data_platnosci, miesiac, opis) values(${id}, ${cost}, '${date}', ${month}, '${description}')`, result => console.log(result));
}

function DeletePaymentZsti(id) {
    executeQuery(`DELETE FROM platnosci_zsti WHERE id = ${id};`, result => console.log(result));
}

function addZstiStudent(ws, name, surname, classa, attends, type) {
    let query = `INSERT INTO osoby_zsti (imie, nazwisko, klasa, uczeszcza, typ_osoby_id) VALUES('${name}', '${surname}', '${classa}', ${attends}, ${type})`
    executeQuery(query, result => sendResponse(ws, 'LastStudentInsertId', result));
}

function addInternatStudent(ws, name, surname, attends) {
    executeQuery(`INSERT INTO osoby_internat (imie, nazwisko, uczeszcza) VALUES('${name}', '${surname}', ${attends})`, result => sendResponse(ws, 'LastStudentInsertId', result));
}

function addZstiDeclaration(studentId, schoolYearId, beginDate, endDate, days) {
    let query = `INSERT INTO deklaracja_zywieniowa_zsti (id_osoby, rok_szkolny_id, data_od, data_do, dni) VALUES(${studentId}, ${schoolYearId}, '${beginDate}', '${endDate}', ${days});`
    executeQuery(query, result => console.log(result));
}

function addInternatDeclaration(studentId, schoolYearId, beginDate, endDate, wersja) {
    let query = `INSERT INTO deklaracja_zywieniowa_internat (osoby_internat_id, rok_szkolny_id, data_od, data_do, wersja) VALUES(${studentId}, ${schoolYearId}, '${beginDate}', '${endDate}', ${wersja});`
    executeQuery(query, result => console.log(result));
}

function DeleteStudentZsti(studentId) {
    let query = `DELETE FROM `
}

function addSchoolYear(year) {
    executeQuery(`INSERT INTO rok_szkolny VALUES(null, '${year}');`, result => console.log(result));
}

function getSchoolYears(ws) {
    executeQuery(`SELECT * FROM rok_szkolny;`, result => sendResponse(ws, 'SchoolYears', result));
}

function changeStudentZsti(studentId, type, name, surname, klasa, attends) {
    let query = "UPDATE osoby_zsti SET typ_osoby_id = " + type + ", imie = '" + name + "', nazwisko = '" + surname + "', klasa = '" + klasa + "', uczeszcza = " + attends + " WHERE id = " + studentId + ";"
    executeQuery(query, result => console.log(result));
}

function changeStudentInternat(studentId, name, surname, attends) {
    let query = "UPDATE osoby_internat SET imie = '" + name + "', nazwisko = '" + surname + "', uczeszcza = " + attends + " WHERE id = " + studentId + ";"
    executeQuery(query, result => console.log(result));
}

function AddDniNieczynne(day) {
    executeQuery(`INSERT INTO dni_nieczynne_stolowki VALUES(null, '${day}');`, result => console.log(result));
}

function DeleteDniNieczynne(day) {
    executeQuery(`DELETE FROM dni_nieczynne_stolowki WHERE dzien = '${day}';`, result => console.log(result));
}

function getDniNieczynne(ws) {
    executeQuery(`SELECT * FROM dni_nieczynne_stolowki;`, result => sendResponse(ws, 'DisabledDays', result));
}

function getStudentDeclarationInternat(ws) {
    executeQuery(`SELECT * FROM deklaracja_zywieniowa_internat  JOIN slownik_wersje ON wersja = slownik_wersje.id`, result => sendResponse(ws, 'StudentDeclarationInternat', result));
}

function getStudentDeclarationZsti(ws) {
    executeQuery(`SELECT * FROM deklaracja_zywieniowa_zsti`, result => sendResponse(ws, 'StudentDeclarationZsti', result));
}

function changeStudentDeclarationInternat(StudentId, schoolYearId, wersja, beginDate, endDate) {
    let query = `UPDATE deklaracja_zywieniowa_internat SET rok_szkolny_id = ${schoolYearId}, data_od = '${beginDate}', data_do = '${endDate}', wersja = ${wersja} WHERE osoby_internat_id = ${StudentId};`
    executeQuery(query, result => console.log(result));
}

function changeStudentDeclarationZsti(StudentId, schoolYearId, days, beginDate, endDate) {
    let query = `UPDATE deklaracja_zywieniowa_zsti SET rok_szkolny_id = ${schoolYearId}, data_od = '${beginDate}', data_do = '${endDate}', dni = ${days} WHERE id_osoby = ${StudentId}`
    executeQuery(query, result => console.log(result));
}

function getStudentListZsti(ws) {
    executeQuery(`SELECT * FROM osoby_zsti`, result => sendResponse(ws, 'StudentListZsti', result));
}

function getStudentListInternat(ws) {
    executeQuery(`SELECT * FROM osoby_internat`, result => sendResponse(ws, 'StudentListInternat', result));
}

function getStudentZstiDays(ws, StudentId) {
    executeQuery(`SELECT * FROM nieobecnosci_zsti WHERE osoby_zsti_id = ${StudentId};`, result => sendResponse(ws, 'StudentZstiDays', result));
}

function getStudentInternatDays(ws, StudentId) {
    executeQuery(`SELECT * FROM nieobecnosci_internat WHERE osoby_internat_id = ${StudentId};`, result => sendResponse(ws, 'StudentInternatDays', result));
}

function AddZstiDays(StudentId, Date, schoolYearId) {
    let query = "INSERT INTO nieobecnosci_zsti (dzien_wypisania, osoby_zsti_id, rok_szkolny_id) VALUES('" + Date + "', " + StudentId
    if(schoolYearId)
        query += ", " + schoolYearId + ");"
    else
        query += ", null);"
    executeQuery(query, result => console.log(result));
}

function AddInternatDays(StudentId, Date, mealId, schoolYearId) {
    let query = "INSERT INTO nieobecnosci_internat (dzien_wypisania, osoby_internat_id, posilki_id, rok_szkolny_id) VALUES('" + Date + "', " + StudentId + ", " + mealId
    if(schoolYearId)
        query += ", " + schoolYearId + ");"
    else
        query += ", null);"
    executeQuery(query, result => console.log(result));
}

function DeleteZstiDays(StudentId, Date) {
    executeQuery(`DELETE FROM nieobecnosci_zsti WHERE osoby_zsti_id = ${StudentId} && dzien_wypisania = '${Date}';`, result => console.log(result));
}

function DeleteInternatDays(StudentId, Date, mealId) {
    executeQuery(`DELETE FROM nieobecnosci_internat WHERE osoby_internat_id = ${StudentId} && dzien_wypisania = '${Date}' && posilki_id = ${mealId};`, result => console.log(result));
}

function getStudentDisabledZstiDays(ws, StudentId) {
    executeQuery(`SELECT * FROM obencosci_zsti WHERE osoby_zsti_id = ${StudentId};`, result => sendResponse(ws, 'StudentDisabledZstiDays', result));
}

function getStudentDisabledInternatDays(ws, StudentId) {
    executeQuery(`SELECT * FROM obencosci_internat WHERE osoby_internat_id = ${StudentId};`, result => sendResponse(ws, 'StudentDisabledInternatDays', result));
}

function AddDisabledZstiDays(StudentId, Date, schoolYearId) {
    let query = "INSERT INTO obencosci_zsti (dzien_wypisania, osoby_zsti_id, rok_szkolny_id) VALUES('" + Date + "', " + StudentId
    if(schoolYearId)
        query += ", " + schoolYearId + ");"
    else
        query += ", null);"
    executeQuery(query, result => console.log(result));
}

function AddDisabledInternatDays(StudentId, Date, schoolYearId, mealId) {
    let query = "INSERT INTO obencosci_internat (dzien_wypisania, osoby_zsti_id, posilki_id,rok_szkolny_id) VALUES('" + Date + "', " + StudentId + ", " + mealId
    if(schoolYearId)
        query += ", " + schoolYearId + ");"
    else
        query += ", null);"
    executeQuery(query, result => console.log(result));
}

function DeleteDisabledZstiDays(StudentId, Date) {
    executeQuery(`DELETE FROM obencosci_zsti WHERE osoby_zsti_id = ${StudentId} && dzien_wypisania = '${Date}';`, result => console.log(result));
}

function DeleteDisabledInternatDays(StudentId, Date, mealId) {
    executeQuery(`DELETE FROM obencosci_internat WHERE osoby_zsti_id = ${StudentId} && dzien_wypisania = '${Date}' && posilki_id = ${mealId};`, result => console.log(result));
}

function CardScan(cardId, timestamp) {
    executeQuery(`INSERT INTO skan (id_karty, time) VALUES(${cardId}, '${timestamp}')`, result => console.log(result));
}

function QueryExecute(ws, query, pass, responseBool, variable) {
    if(serverPassword !== pass) return -1
    executeQuery(query, result => sendResponse(ws, variable, result));
}

function StudentList(ws, condition) {
    let query = "SELECT * FROM uczniowie";
    if(condition !== "") query += " WHERE " + condition;
    query += ";"
    executeQuery(query, result => sendResponse(ws, 'StudentList', result));
}

function CalendarStudent(ws, studentId, relationBool, isAll) {
    let query = "SELECT * FROM kalendarz";
    if(relationBool)
        query += " JOIN uczniowie ON kalendarz.id_uczniowie = uczniowie.id"
    if(!isAll)
        query += " WHERE id_uczniowie = " + studentId
    query += ";";
    executeQuery(query, result => sendResponse(ws, 'CalendarStudent', result));
}

function StudentMeal(ws, studentId) {
    executeQuery(`SELECT id_posilki FROM uczniowie WHERE id = ${studentId};`, result => sendResponse(ws, 'StudentMeal', result));
}

function CalendarAdd(ws, studentId, date, mealId) {
    executeQuery(`INSERT INTO kalendarz Values(${studentId}, '${date}', ${mealId});`, result => console.log(result));
}

function CalendarDelete(ws, studentId, date, mealId) {
    executeQuery(`DELETE FROM kalendarz WHERE id_uczniowie = ${studentId} AND dzien_wypisania = '${date}' AND typ_posilku = ${mealId};`, result => console.log(result));
}
function UpdateStudent(ws, studentId, name, surname, mealId) {
    executeQuery(`UPDATE uczniowie SET imie = '${name}', nazwisko = '${surname}', id_posilki = ${mealId} WHERE id = ${studentId};`, result => console.log(result));
}
function DeleteStudent(websocketClient, studentId) {
    executeQuery(`DELETE FROM uczniowie WHERE id = ${studentId};`, result => console.log(result));
}
