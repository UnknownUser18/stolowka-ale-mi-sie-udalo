const mysql = require('mysql');
const ws = require('ws');

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
      chunkSize: 10240
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
            database = mysql.createConnection(dbConfig);
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
        "getStudentDeclarationInternat": () => getStudentDeclarationInternat(ws),
        "getStudentDeclarationZsti": () => getStudentDeclarationZsti(ws),
        "changeStudentDeclarationInternat": () => changeStudentDeclarationInternat(params.studentId, params.schoolYearId, params.wersja, params.beginDate, params.endDate),
        "changeStudentDeclarationZsti": () => changeStudentDeclarationZsti(params.studentId, params.schoolYearId, params.days, params.beginDate, params.endDate),
        "changeStudentInternat": () => changeStudentInternat(params.studentId, params.name, params.surname, params.attends, params.group),
        "changeStudentZsti": () => changeStudentZsti(params.studentId, params.type, params.name, params.surname, params.class, params.attends),
        "getStudentListZsti": () => getStudentListZsti(ws),
        "getStudentListInternat": () => getStudentListInternat(ws),
        "DeleteDeclarationZSTI": () => DeleteDeclarationZSTI(params.studentId, params.schoolYearId, params.beginDate, params.endDate),
        "DeleteDeclarationInternat": () => DeleteDeclarationInternat(params.studentId, params.schoolYearId, params.beginDate, params.endDate),
        "getStudentZstiDays": () => getStudentZstiDays(ws, params.studentId),
        "getStudentDisabledZstiDays": () => getStudentDisabledZstiDays(ws, params.studentId),
        "getDisabledZstiDays": () => getDisabledZstiDays(ws),
        "getDisabledInternatDays": () => getDisabledInternatDays(ws),
        "getStudentInternatDays": () => getStudentInternatDays(ws, params.studentId),
        "AddZstiDays": () => AddZstiDays(params.studentId, params.date, params.schoolYearId),
        "AddInternatDays": () => AddInternatDays(params.studentId, params.date, params.mealId, params.schoolYearId),
        "DeleteZstiDays": () => DeleteZstiDays(params.studentId, params.date),
        "DeleteInternatDays": () => DeleteInternatDays(params.studentId, params.date, params.mealId),
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
        "getScanInternat": () => getScanInternat(ws),
        "getGroups": () => getGroups(ws),
        "getScanningInfoZsti": () => getScanningInfoZsti(ws),
        "sendMailDaysZsti": () => sendMailDaysZsti(params.name, params.surname, params.email, params.addedDays, params.removedDays),
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

function getScanningInfoZsti(ws)
{
    executeQuery(`select osoby_zsti.id, typ_osoby_id, imie, nazwisko, klasa, uczeszcza, miasto, key_card, data_wydania, ostatnie_uzycie, karty_zsti.id as id_karty from osoby_zsti LEFT JOIN karty_zsti ON karty_zsti.id_ucznia = osoby_zsti.id;`, result => sendResponse(ws, "ScanningInfoZsti", result))
}

function getGroups(ws)
{
    executeQuery(`select * from slownik_grupy;`, result => sendResponse(ws, "ListOfGroups", result));
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
    executeQuery(`select karty_zsti.id, karty_zsti.id_ucznia, karty_zsti.key_card, karty_zsti.data_wydania, karty_zsti.ostatnie_uzycie, osoby_zsti.imie, osoby_zsti.nazwisko, osoby_zsti.uczeszcza from karty_zsti join osoby_zsti on karty_zsti.id_ucznia = osoby_zsti.id WHERE karty_zsti.key_card = ${keyCard};`, result => sendResponse(ws, 'StudentCardZsti', result));
}

function getStudentFromCardInternat(ws, keyCard) {
    executeQuery(`select karty_internat.id, karty_internat.id_ucznia, karty_internat.key_card, karty_internat.data_wydania, karty_internat.ostatnie_uzycie, osoby_internat.imie, osoby_internat.nazwisko, osoby_internat.uczeszcza, osoby_internat.grupa from karty_internat join osoby_internat on karty_internat.id_ucznia = osoby_internat.id WHERE karty_internat.key_card = ${keyCard};`, result => sendResponse(ws, 'StudentCardInternat', result));
}

function DeleteDeclarationZSTI(studentId, schoolYearId, beginDate, endDate) {
    executeQuery(`DELETE FROM deklaracja_zywieniowa_zsti WHERE id_osoby = ${studentId} && rok_szkolny_id = ${schoolYearId} && data_od = '${beginDate}' && data_do = '${endDate}';`, result => console.log(result));
}
function DeleteDeclarationInternat(studentId, schoolYearId, beginDate, endDate) {
    executeQuery(`DELETE FROM deklaracja_zywieniowa_internat WHERE osoby_internat_id = ${studentId} && rok_szkolny_id = ${schoolYearId} && data_od = '${beginDate}' && data_do = '${endDate}';`, result => console.log(result));
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
    executeQuery(`INSERT INTO platnosci_zsti (id_ucznia, platnosc, data_platnosci, miesiac, opis, rok) values(${id}, ${cost}, '${date}', ${month}, '${description}', 2025)`, result => console.log(result));
}

function DeletePaymentZsti(id) {
    executeQuery(`DELETE FROM platnosci_zsti WHERE id = ${id};`, result => console.log(result));
}

function addZstiStudent(ws, name, surname, classa, attends, type) {
    let query = `INSERT INTO osoby_zsti (imie, nazwisko, klasa, uczeszcza, typ_osoby_id) VALUES('${name}', '${surname}', '${classa}', ${attends}, ${type})`
    executeQuery(query, result => sendResponse(ws, 'LastStudentInsertId', result));
}

function addInternatStudent(ws, name, surname, attends, grupa) {
    executeQuery(`INSERT INTO osoby_internat (imie, nazwisko, uczeszcza,grupa) VALUES('${name}', '${surname}', ${attends} , '${grupa}')`, result => sendResponse(ws, 'LastStudentInsertId', result));
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
    console.error(type, name, surname, klasa, attends)
    let query = `UPDATE osoby_zsti SET typ_osoby_id = ${type}, imie = '${name}', nazwisko = '${surname}', klasa = '${klasa}', uczeszcza = ${attends} WHERE id = ${studentId};`
    executeQuery(query, result => console.log(result));
}

function changeStudentInternat(studentId, name, surname, attends, group) {
    let query = `UPDATE osoby_internat SET imie = '${name}', nazwisko = '${surname}', uczeszcza = ${attends}`
    if(group !== undefined) query += `, grupa = ${group}`
    query += ` WHERE id = ${studentId};`
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
    let query = `UPDATE deklaracja_zywieniowa_zsti SET rok_szkolny_id = ${schoolYearId}, data_od = '${beginDate}', data_do = '${endDate}', dni = 0b${days} WHERE id_osoby = ${StudentId}`
    executeQuery(query, result => console.log(result));
}

function getStudentListZsti(ws) {
    executeQuery(`SELECT * FROM osoby_zsti ORDER BY nazwisko, imie`, result => sendResponse(ws, 'StudentListZsti', result));
}

function getStudentListInternat(ws) {
    executeQuery(`SELECT * FROM osoby_internat LEFT JOIN slownik_grupy ON osoby_internat.grupa = slownik_grupy.idGrupy ORDER BY nazwisko, imie`, result => sendResponse(ws, 'StudentListInternat', result));
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
    executeQuery(`SELECT * FROM nieobecnosci_zsti WHERE osoby_zsti_id = ${StudentId};`, result => sendResponse(ws, 'StudentDisabledZstiDays', result));
}
function getDisabledZstiDays(ws) {
    executeQuery(`SELECT * FROM nieobecnosci_zsti;`, result => sendResponse(ws, 'DisabledZstiDays', result));
}
function getDisabledInternatDays(ws) {
    executeQuery(`SELECT * FROM nieobecnosci_internat;`, result => sendResponse(ws, 'DisabledInternatDays', result));
}

function CardScan(cardId, timestamp) {
    executeQuery(`INSERT INTO skan (id_karty, time) VALUES(${cardId}, '${timestamp}')`, result => console.log(result));
}

function QueryExecute(ws, query, pass, responseBool, variable) {
    if(serverPassword !== pass) return -1
    executeQuery(query, result => sendResponse(ws, variable, result));
}

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'szymixxxxxx@gmail.com',
        pass: 'lmib pvne monl kleg'
    }
});

const dniTygodnia = {
    0: 'Niedziela',
    1: 'Poniedziałek',
    2: 'Wtorek',
    3: 'Środa',
    4: 'Czwartek',
    5: 'Piątek',
    6: 'Sobota'
}

const miesiace = {
    0: 'Styczeń',
    1: 'Luty',
    2: 'Marzec',
    3: 'Kwiecień',
    4: 'Maj',
    5: 'Czerwiec',
    6: 'Lipiec',
    7: 'Sierpień',
    8: 'Wrzesień',
    9: 'Październik',
    10: 'Listopad',
    11: 'Grudzień'
}

// sendMailDaysZsti('Szymon', 'Żelazny', 'xxxxxxszymi@gmail.com', [new Date(), new Date(2024, 11, 21)], [new Date(2024, 10, 11)])
function sendMail(receiver, subject, text)
{
    const tempMailOptions = {
        from: 'szymixxxxxx@gmail.com',
        to: receiver,
        subject: subject,
        html: text
    }
    transporter.sendMail(tempMailOptions);
}

function sendMailDaysZsti(firstName, lastName, email, addedDays, removedDays) {
    const formatDate = dateStr => {
        const date = new Date(dateStr);
        return `${date.getDate()} ${miesiace[date.getMonth()]} ${date.getFullYear()} (${dniTygodnia[date.getDay()]})`;
    };

    const generateSection = (title, days) => days.length ? `
        <h3>${title}:</h3>
        <ul>${days.map(day => `<li>${formatDate(day)}</li>`).join('')}</ul>
    ` : '';

    const sections = [
        generateSection('Dodane nieobecności', addedDays),
        generateSection('Usunięte nieobecności', removedDays)
    ].filter(Boolean).join('');

    const mailHtml = `
        <body style="color: black !important;">
            Szanowny/a ${firstName} ${lastName[0]}.,<br>
            Informujemy, że w systemie stołówki zostały odnotowane zmiany dotyczące Twojej obecności na obiedzie.<br>
            <h2>Szczegóły zmian: <br></h2>
            ${sections}
            Jeśli te zmiany były zamierzone, nie musisz podejmować żadnych dalszych działań.<br>
            W przypadku jakichkolwiek nieścisłości lub potrzeby korekty, prosimy o kontakt z administracją stołówki<br>
            Dziękujemy za korzystanie z naszego systemu i życzymy miłego dnia!<br>
            Z wyrazami szacunku, <br> <h4><b>Zespół Stołówki</b></h4>
        </body>
    `;
    sendMail(email, 'Potwierdzenie zgłoszenia nieobecności na obiedzie', mailHtml);
}