const mysql = require("mysql");
const ws = require("ws");

const wss = new ws.WebSocketServer({
    port: 8080,
    perMessageDeflate: {
        zlibDeflateOptions: {
            // See zlib defaults.
            chunkSize: 1024,
            memLevel: 7,
            level: 3
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
        if(typeof data != 'object')
            return -1;
        let object = JSON.parse(data)
        console.log(data)
        if(object.action !== "request")
            return -1;
        let parameters = object.params;
        switch (parameters.method) {
            case "CardScan":
                CardScan(parameters.id_ucznia, parameters.timestamp);
                break;
            case "AnyQuery":
                QueryExecute(parameters.query, parameters.password, parameters.query, parameters.password, parameters.responseBool, parameters.variable);
                break;
            case "StudentList":
                StudentList(ws ,parameters.condition);
                break;
            case "CalendarStudent":
                CalendarStudent(ws,  parameters.id_ucznia, parameters.relationBool, parameters.isAll);
                break;
            case "StudentMeal":
                StudentMeal(ws, parameters.id_ucznia);
                break;
            case "CalendarAdd":
                CalendarAdd(ws, parameters.id_ucznia, parameters.data, parameters.mealId)
                break;
            case "CalendarDelete":
                CalendarDelete(ws, parameters.studentId, parameters.data, parameters.mealId)
                break;
            case "UpdateStudent":
                UpdateStudent(ws, parameters.studentId, parameters.name, parameters.surname, parameters.mealId);
                break;
            case "DeleteStudent":
                DeleteStudent(ws, parameters.studentId)
                break;
            case "getStudentDeclarationInternat":
                getStudentDeclarationInternat(ws)
                break;
            case "getStudentDeclarationZsti":
                getStudentDeclarationZsti(ws)
                break;
            case "changeStudentDeclarationInternat":
                changeStudentDeclarationInternat(parameters.studentId, parameters.schoolYearId, parameters.wersja, parameters.beginDate, parameters.endDate);
                break;
            case "changeStudentDeclarationZsti":
                changeStudentDeclarationZsti(parameters.studentId, parameters.schoolYearId, parameters.days, parameters.beginDate, parameters.endDate);
                break;
            case "changeStudentInternat":
                changeStudentInternat(parameters.studentId, parameters.name, parameters.surname, parameters.attends);
                break;
            case "changeStudentZsti":
                changeStudentZsti(parameters.studentId, parameters.type, parameters.name, parameters.surname, parameters.class, parameters.attends);
                break;
            case "getStudentListZsti":
                getStudentListZsti(ws)
                break;
            case "getStudentListInternat":
                getStudentListInternat(ws)
                break;
            case "getStudentZstiDays":
                getStudentZstiDays(ws, parameters.studentId)
                break;
            case "getStudentDisabledZstiDays":
                getStudentDisabledZstiDays(ws, parameters.studentId)
                break;
            case "getStudentInternatDays":
                getStudentInternatDays(ws, parameters.studentId)
                break;
            case "getStudentDisabledInternatDays":
                getStudentDisabledInternatDays(ws, parameters.studentId)
                break;
            case "AddZstiDays":
                AddZstiDays(parameters.studentId, parameters.date, parameters.schoolYearId)
                break;
            case "AddDisabledZstiDays":
                AddDisabledZstiDays(parameters.studentId, parameters.date, parameters.schoolYearId)
                break;
            case "AddInternatDays":
                AddInternatDays(parameters.studentId, parameters.date, parameters.mealId, parameters.schoolYearId);
                break;
            case "AddDisabledInternatDays":
                AddDisabledInternatDays(parameters.studentId, parameters.date, parameters.mealId, parameters.schoolYearId);
                break;
            case "DeleteZstiDays":
                DeleteZstiDays(parameters.studentId, parameters.date);
                break;
            case "DeleteDisabledZstiDays":
                DeleteDisabledZstiDays(parameters.studentId, parameters.date);
                break;
            case "DeleteInternatDays":
                DeleteInternatDays(parameters.studentId, parameters.date, parameters.mealId);
                break;
            case "DeleteDisabledInternatDays":
                DeleteDisabledInternatDays(parameters.studentId, parameters.date, parameters.mealId);
                break;
            case "getDniNieczynne":
                getDniNieczynne(ws);
                break;
            case "DeleteDniNieczynne":
                DeleteDniNieczynne(parameters.date)
                break;
            case "AddDniNieczynne":
                AddDniNieczynne(parameters.date)
                break;
            case 'getSchoolYears':
                getSchoolYears(ws)
                break;
            case 'addSchoolYear':
                addSchoolYear(parameters.year)
                break;
            case 'DeleteStudentZsti':
                DeleteStudentZsti(parameters.studentId)
                break;
            case 'addZstiDeclaration':
                addZstiDeclaration(parameters.studentId, parameters.schoolYearId, parameters.beginDate, parameters.endDate, parameters.days);
                break;
            case 'addInternatDeclaration':
                addInternatDeclaration(parameters.studentId, parameters.schoolYearId, parameters.beginDate, parameters.endDate, parameters.wersja)
                break;
            case 'addZstiStudent':
                addZstiStudent(ws, parameters.name, parameters.surname, parameters.class, parameters.attends, parameters.type);
                break;
            case 'addInternatStudent':
                addInternatStudent(ws, parameters.name, parameters.surname, parameters.attends)
                break;
            case 'getPaymentZsti':
                getPaymentZsti(ws);
                break;
            case 'addPaymentZsti':
                addPaymentZsti(parameters.studentId, parameters.cost, parameters.date, parameters.month, parameters.description);
                break;
            case 'DeletePaymentZsti':
                DeletePaymentZsti(parameters.id);
                break;
            case 'getPaymentInternat':
                getPaymentInternat(ws);
                break;
            case 'addPaymentInternat':
                addPaymentInternat(parameters.studentId, parameters.cost, parameters.date, parameters.month, parameters.description);
                break;
            case 'DeletePaymentInternat':
                DeletePaymentInternat(parameters.id);
                break;
            case 'getKartyZsti':
                getKartyZsti(ws);
                break;
            case 'DeleteKartyZsti':
                DeleteKartyZsti(parameters.id);
                break;
            case 'addKartyZsti':
                addKartyZsti(parameters.studentId, parameters.keyCard, parameters.beginDate, parameters.lastUse);
                break;
            case 'getKartyInternat':
                getKartyInternat(ws);
                break;
            case 'DeleteKartyInternat':
                DeleteKartyInternat(parameters.id);
                break;
            case 'addKartyInternat':
                addKartyInternat(parameters.studentId, parameters.keyCard, parameters.beginDate, parameters.lastUse);
                break;
            case 'getStudentFromCardZsti':
                getStudentFromCardZsti(ws, parameters.keyCard);
                break;
            case 'getStudentFromCardInternat':
                getStudentFromCardInternat(ws, parameters.keyCard);
                break;
            case 'addScanZsti':
                addScanZsti(parameters.cardId, parameters.datetime);
                break;
            case 'getScanZsti':
                getScanZsti(ws);
                break;
        }
    });
});

//todo: ENV variables
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
function handleDisconnect()
{
    database = mysql.createConnection(dbConfig);

    database.on('error', function (err) {
        console.error('Db error: ', err);
        if(err.code === "PROTOCOL_CONNECTION_LOST")
        {
            handleDisconnect();
        }
        else{
            throw err;
        }
    });
}

database.on('error', function (err) {
    console.error('Db error: ', err);
    if(err.code === "PROTOCOL_CONNECTION_LOST")
    {
        handleDisconnect();
    }
    else{
        handleDisconnect()
        throw err;
    }
});


function getScanZsti(websocketClient)
{
    let query = `SELECT * FROM skany_zsti;`;
    return database.query(query, (err, result) => {
        if(err)throw err;
        console.log(result);
        websocketClient.send(JSON.stringify(
            {
                action: "response",
                params: {
                    variable: 'ScanZsti',
                    value: result
                }
            }
        ))
    })
}

function addScanZsti(cardId, datetime)
{
    let query = `INSERT INTO skany_zsti (id_karty, czas) values(${cardId}, '${datetime}')`;
    return database.query(query, (err, result) => {
        if (err) throw err;
        console.log(result)
    })
}

function getStudentFromCardZsti(websocketClient, keyCard)
{
    let query = `SELECT * FROM karty_zsti WHERE key_card = ${keyCard}`
    return database.query(query, (err, result) => {
        if(err)throw err;
        console.log(result);
        websocketClient.send(JSON.stringify(
            {
                action: "response",
                params: {
                    variable: 'StudentCardZsti',
                    value: result
                }
            }
        ))
    })
}

function getStudentFromCardInternat(websocketClient, keyCard)
{
    let query = `SELECT * FROM karty_internat WHERE key_card = ${keyCard}`
    return database.query(query, (err, result) => {
        if(err)throw err;
        console.log(result);
        websocketClient.send(JSON.stringify(
            {
                action: "response",
                params: {
                    variable: 'StudentCardInternat',
                    value: result
                }
            }
        ))
    })
}


function addKartyInternat(studentId, keyCard, beginDate, lastUse)
{
    let query = `INSERT INTO karty_internat (id_ucznia, key_card, data_wydania) VALUES(${studentId}, ${keyCard}, '${beginDate}')`;
    if(lastUse)
        query = `INSERT INTO karty_internat (id_ucznia, key_card, data_wydania, ostatnie_uzycie) VALUES(${studentId}, ${keyCard}, '${beginDate}', '${lastUse}')`;
    return database.query(query, (err, result) => {
        if(err) throw err;
        console.log(result);
    })
}


function DeleteKartyInternat(id)
{
    let query = `DELETE FROM karty_internat WHERE id = ${id};`;
    return database.query(query, (err, result) => {
        if(err) throw err;
        console.log(result);
    })
}

function getKartyInternat(websocketClient)
{
    let query = `SELECT * FROM karty_internat;`;
    return database.query(query, (err, result) => {
        if(err) throw err;
        console.log(err);
        websocketClient.send(JSON.stringify(
            {
                action: "response",
                params: {
                    variable: 'CardsInternat',
                    value: result
                }
            }
        ))
    })
}

function addKartyZsti(studentId, keyCard, beginDate, lastUse)
{
    let query = `INSERT INTO karty_zsti (id_ucznia, key_card, data_wydania) VALUES(${studentId}, ${keyCard}, '${beginDate}')`;
    if(lastUse)
        query = `INSERT INTO karty_zsti (id_ucznia, key_card, data_wydania, ostatnie_uzycie) VALUES(${studentId}, ${keyCard}, '${beginDate}', '${lastUse}')`;
    return database.query(query, (err, result) => {
        if(err) throw err;
        console.log(result);
    })
}


function DeleteKartyZsti(id)
{
    let query = `DELETE FROM karty_zsti WHERE id = ${id};`;
    return database.query(query, (err, result) => {
        if(err) throw err;
        console.log(result);
    })
}

function getKartyZsti(websocketClient)
{
    let query = `SELECT * FROM karty_zsti;`;
    return database.query(query, (err, result) => {
        if(err) throw err;
        console.log(err);
        websocketClient.send(JSON.stringify(
            {
                action: "response",
                params: {
                    variable: 'CardsZsti',
                    value: result
                }
            }
        ))
    })
}

function getPaymentInternat(websocketClient)
{
    let query = `SELECT * FROM platnosci_internat;`;
    return database.query(query, (err, result) => {
        if(err) throw err;
        console.log(result);
        websocketClient.send(JSON.stringify(
            {
                action: "response",
                params: {
                    variable: 'PaymentInternat',
                    value: result
                }
            }
        ));
    })
}

function addPaymentInternat(id, cost, date, month, description)
{
    let query = `INSERT INTO platnosci_internat (id_ucznia, platnosc, data_platnosci, miesiac, opis) values(${id}, ${cost}, '${date}', ${month}, '${description}')`;
    return database.query(query, (err, result) => {
        if(err) throw err;
        console.log(result)
    })
}

function DeletePaymentInternat(id)
{
    let query = `DELETE FROM platnosci_internat WHERE id = ${id};`;
    return database.query(query, (err, result) => {
        if(err) throw err;
        console.log(result)
    })
}

function getPaymentZsti(websocketClient)
{
    let query = `SELECT * FROM platnosci_zsti;`;
    return database.query(query, (err, result) => {
        if(err) throw err;
        console.log(result);
        websocketClient.send(JSON.stringify(
            {
                action: "response",
                params: {
                    variable: 'PaymentZsti',
                    value: result
                }
            }
        ));
    })
}

function addPaymentZsti(id, cost, date, month, description)
{
    let query = `INSERT INTO platnosci_zsti (id_ucznia, platnosc, data_platnosci, miesiac, opis) values(${id}, ${cost}, '${date}', ${month}, '${description}')`;
    return database.query(query, (err, result) => {
        if(err) throw err;
        console.log(result)
    })
}

function DeletePaymentZsti(id)
{
    let query = `DELETE FROM platnosci_zsti WHERE id = ${id};`;
    return database.query(query, (err, result) => {
        if(err) throw err;
        console.log(result)
    })
}

function addZstiStudent(websocketClient, name, surname, classa, attends, type)
{
    let query = `INSERT INTO osoby_zsti (imie, nazwisko, klasa, uczeszcza, typ_osoby_id) VALUES('${name}', '${surname}', '${classa}', ${attends}, ${type})`
    console.log(query)
    return database.query(query, (err, result) => {
        if(err) throw err;
        console.log(result.insertId)
        websocketClient.send(
            JSON.stringify(
                {
                    action: "response",
                    params: {
                        variable: "LastStudentInsertId",
                        value: result
                    }
                }))
    })
}

function addInternatStudent(websocketClient, name, surname, attends)
{
    let query = `INSERT INTO osoby_internat (imie, nazwisko, uczeszcza) VALUES('${name}', '${surname}', ${attends})`
    console.log(query)
    return database.query(query, (err, result) => {
        if(err) throw err;
        console.log(result)
        websocketClient.send(
            JSON.stringify(
                {
                    action: "response",
                    params: {
                        variable: "LastStudentInsertId",
                        value: result
                    }
                }))
    })
}

function addZstiDeclaration(studentId, schoolYearId, beginDate, endDate, days)
{
    let query = `INSERT INTO deklaracja_zywieniowa_zsti (id_osoby, rok_szkolny_id, data_od, data_do, dni) VALUES(${studentId}, ${schoolYearId}, '${beginDate}', '${endDate}', ${days});`
    return database.query(query, (err, result)=>{
        if(err) throw err;
        console.log(result)
    })
}

function addInternatDeclaration(studentId, schoolYearId, beginDate, endDate, wersja)
{
    let query = `INSERT INTO deklaracja_zywieniowa_internat (osoby_internat_id, rok_szkolny_id, data_od, data_do, wersja) VALUES(${studentId}, ${schoolYearId}, '${beginDate}', '${endDate}', ${wersja});`
    return database.query(query, (err, result)=>{
        if(err) throw err;
        console.log(result)
    })
}

function DeleteStudentZsti(studentId)
{
    let query = `DELETE FROM `
}

function addSchoolYear(year)
{
    let query = `INSERT INTO rok_szkolny VALUES(null, '${year}');`
    return database.query(query, (err,result)=>{
        if(err) throw err;
        console.log(result);
    })
}

function getSchoolYears(websocketClient)
{
    let query = "SELECT * FROM rok_szkolny;"
    return database.query(query, (err, result) => {
        if(err) throw err;
        websocketClient.send(
            JSON.stringify(
                {
                    action: "response",
                    params: {
                        variable: "SchoolYears",
                        value: result
                    }
                }))
    })
}

function changeStudentZsti(studentId, type, name, surname, klasa, attends)
{
    let query = "UPDATE osoby_zsti SET typ_osoby_id = " + type + ", imie = '" + name + "', nazwisko = '" + surname + "', klasa = '" + klasa + "', uczeszcza = " + attends + " WHERE id = " + studentId + ";"
    return database.query(query, (err, result) => {
        if (err) throw err;
        console.log(result);
    })
}

function changeStudentInternat(studentId, name, surname, attends)
{
    let query = "UPDATE osoby_internat SET imie = '" + name + "', nazwisko = '" + surname + "', uczeszcza = " + attends + " WHERE id = " + studentId + ";"
    return database.query(query, (err, result) => {
        if (err) throw err;
        console.log(result);
    })
}

function AddDniNieczynne(day)
{
    let query = "INSERT INTO dni_nieczynne_stolowki VALUES(null, '" + day + "')";
    return database.query(query, (err, result) => {
        if (err) throw err;
        console.log(result);
    })
}

function DeleteDniNieczynne(day)
{
    let query = "DELETE FROM dni_nieczynne_stolowki WHERE dzien = '" + day + "';";
    return database.query(query, (err, result) => {
        if (err) throw err;
        console.log(result);
    })
}

function getDniNieczynne(websocketClient)
{
    let query = "SELECT * FROM dni_nieczynne_stolowki"
    return database.query(query, (err, result) => {
        if (err) throw err;
        console.log(result);
        websocketClient.send(
            JSON.stringify(
                {
                    action: "response",
                    params: {
                        variable: "DisabledDays",
                        value: result
                    }
                }))
    })
}

function getStudentDeclarationInternat(websocketClient)
{
    let query = "SELECT * FROM deklaracja_zywieniowa_internat  JOIN slownik_wersje ON wersja = slownik_wersje.id";
    return database.query(query, (err, result) => {
        if (err) throw err;
        console.log(result);
        console.log(result);
        websocketClient.send(
            JSON.stringify(
                {
                    action: "response",
                    params: {
                        variable: "StudentDeclarationInternat",
                        value: result
                    }
                }))
    })
}

function getStudentDeclarationZsti(websocketClient)
{
    let query = "SELECT * FROM deklaracja_zywieniowa_zsti";
    return database.query(query, (err, result) => {
        if (err) throw err;
        console.log(result);
        console.log(result);
        websocketClient.send(
            JSON.stringify(
                {
                    action: "response",
                    params: {
                        variable: "StudentDeclarationZsti",
                        value: result
                    }
                }))
    })
}

function changeStudentDeclarationInternat(StudentId, schoolYearId, wersja, beginDate, endDate) {
    let query = `UPDATE deklaracja_zywieniowa_internat SET rok_szkolny_id = ${schoolYearId}, data_od = '${beginDate}', data_do = '${endDate}', wersja = ${wersja} WHERE osoby_internat_id = ${StudentId};`
    return database.query(query, (err, result) => {
        if (err) throw err;
        console.log(result);
    })
}

function changeStudentDeclarationZsti(StudentId, schoolYearId, days, beginDate, endDate) {
    let query = `UPDATE deklaracja_zywieniowa_zsti SET rok_szkolny_id = ${schoolYearId}, data_od = '${beginDate}', data_do = '${endDate}', dni = ${days} WHERE id_osoby = ${StudentId}`
    return database.query(query, (err, result) => {
        if (err) throw err;
        console.log(result);
    })
}

function getStudentListZsti(websocketClient)
{
    let query = "SELECT * FROM osoby_zsti";
    database.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
        websocketClient.send(
            JSON.stringify(
                {
                    action: "response",
                    params: {
                        variable: "StudentListZsti",
                        value: result
                    }
                }))
    });
}

function getStudentListInternat(websocketClient)
{
    let query = "SELECT * FROM osoby_internat";
    database.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
        websocketClient.send(
            JSON.stringify(
                {
                    action: "response",
                    params: {
                        variable: "StudentListInternat",
                        value: result
                    }
                }))
    });
}

function getStudentZstiDays(websocketClient, StudentId)
{
    let query = "SELECT * FROM nieobecnosci_zsti WHERE osoby_zsti_id = " + StudentId + ";";
    return database.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
        websocketClient.send(JSON.stringify(
            {
                action: "response",
                params: {
                    variable: "StudentZstiDays",
                    value: result
                }
            }
        ))
    })
}

function getStudentInternatDays(websocketClient, StudentId)
{
    let query = "SELECT * FROM nieobecnosci_internat  WHERE osoby_internat_id = " + StudentId + ";";
    return database.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
        websocketClient.send(JSON.stringify(
            {
                action: "response",
                params: {
                    variable: "StudentInternatDays",
                    value: result
                }
            }
        ))
    })
}

function AddZstiDays(StudentId, Date, schoolYearId)
{
    let query = "INSERT INTO nieobecnosci_zsti (dzien_wypisania, osoby_zsti_id, rok_szkolny_id) VALUES('" + Date + "', " + StudentId
    if(schoolYearId)
        query += ", " + schoolYearId + ");"
    else
        query += ", null);"
    return database.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
    })
}

function AddInternatDays(StudentId, Date, mealId, schoolYearId)
{
    let query = "INSERT INTO nieobecnosci_internat (dzien_wypisania, osoby_internat_id, posilki_id, rok_szkolny_id) VALUES('" + Date + "', " + StudentId + ", " + mealId
    if(schoolYearId)
        query += ", " + schoolYearId + ");"
    else
        query += ", null);"
    return database.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
    })
}

function DeleteZstiDays(StudentId, Date)
{
    let query = "DELETE FROM nieobecnosci_zsti WHERE osoby_zsti_id = " + StudentId + " && dzien_wypisania = '" + Date + "';";
    console.log(query, "NIGER NIGER NIGER")
    return database.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
    })
}

function DeleteInternatDays(StudentId, Date, mealId)
{
    let query = "DELETE FROM nieobecnosci_internat WHERE osoby_internat_id = " + StudentId + " && dzien_wypisania = '" + Date + "' && posilki_id = " + mealId + ";";
    return database.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
    })
}

function getStudentDisabledZstiDays(websocketClient, StudentId)
{
    let query = "SELECT * FROM obencosci_zsti WHERE osoby_zsti_id = " + StudentId + ";";
    return database.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
        websocketClient.send(JSON.stringify(
            {
                action: "response",
                params: {
                    variable: "StudentDisabledZstiDays",
                    value: result
                }
            }
        ))
    })
}

function getStudentDisabledInternatDays(websocketClient, StudentId)
{
    let query = "SELECT * FROM obencosci_internat WHERE osoby_internat_id = " + StudentId + ";";
    return database.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
        websocketClient.send(JSON.stringify(
            {
                action: "response",
                params: {
                    variable: "StudentDisabledInternatDays",
                    value: result
                }
            }
        ))
    })
}

function AddDisabledZstiDays(StudentId, Date, schoolYearId)
{
    let query = "INSERT INTO obencosci_zsti (dzien_wypisania, osoby_zsti_id, rok_szkolny_id) VALUES('" + Date + "', " + StudentId
    if(schoolYearId)
        query += ", " + schoolYearId + ");"
    else
        query += ", null);"
    return database.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
    })
}

function AddDisabledInternatDays(StudentId, Date, schoolYearId, mealId)
{
    let query = "INSERT INTO obencosci_internat (dzien_wypisania, osoby_zsti_id, posilki_id,rok_szkolny_id) VALUES('" + Date + "', " + StudentId + ", " + mealId
    if(schoolYearId)
        query += ", " + schoolYearId + ");"
    else
        query += ", null);"
    return database.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
    })
}

function DeleteDisabledZstiDays(StudentId, Date)
{
    let query = "DELETE FROM obencosci_zsti WHERE osoby_zsti_id = " + StudentId + " && dzien_wypisania = '" + Date + "';";
    console.log(query, "NIGER NIGER NIGER")
    return database.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
    })
}

function DeleteDisabledInternatDays(StudentId, Date, mealId)
{
    let query = "DELETE FROM obencosci_internat WHERE osoby_zsti_id = " + StudentId + " && dzien_wypisania = '" + Date + "' && posilki_id = " + mealId + ";";
    return database.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
    })
}













function CardScan(cardId, timestamp)
{
    let query = "INSERT INTO skan (id_karty, time) VALUES(" + cardId + ",'" + timestamp +"')"
    return database.query(query, function (err, res) {
        console.log("Error of " + query + " - :" +err);
        console.log(res);
        return res;
    })
}

function QueryExecute(websocketClient, query, pass, responseBool, variable) {
    if(serverPassword !== pass)
        return -1
    database.query(query, function (err, result)  {
        console.log("Error of " + query + " - :" +err);
        console.log("Result of " + query + " - :" +result);
        if(!responseBool)
            return result;
        websocketClient.send(JSON.stringify(
            {
                action: "response",
                params: {
                    variable: variable,
                    value: result
                }
            }))
    })
}

function StudentList(websocketClient, condition)
{
    let query = "SELECT * FROM uczniowie";
    if(condition!=="")
        query += " WHERE " + condition;
    query += ";"
    database.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
        websocketClient.send(
            JSON.stringify(
            {
            action: "response",
            params: {
                variable: "StudentList",
                value: result
            }
        }))
    });
}

function CalendarStudent(websocketClient, studentId, relationBool, isAll)
{
    let query = "SELECT * FROM kalendarz";
    if(relationBool)
        query += " JOIN uczniowie ON kalendarz.id_uczniowie = uczniowie.id"
    if(!isAll)
        query += " WHERE id_uczniowie = " + studentId
    query += ";";
    database.query(query, function (err, result) {
        if (err) throw err;
        websocketClient.send(
            JSON.stringify(
                {
                    action: "response",
                    params: {
                        variable: "CalendarStudent",
                        value: result
                    }
                }
            )
        )
    })
}

function StudentMeal(websocketClient, studentId)
{
    let query = "SELECT id_posilki FROM uczniowie WHERE id = " + studentId + ";";
    database.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
        websocketClient.send(
            JSON.stringify(
                {
                    action: "response",
                    params: {
                        variable: "StudentMeal",
                        value: result
                    }
                }
            )
        )
    })
}

function CalendarAdd(websocketClient, studentId, date, mealId)
{
    let query = "INSERT INTO kalendarz Values("+studentId+", '"+date+"', " + mealId + ");";
    database.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
    })
}

function CalendarDelete(websocketClient, studentId, date, mealId)
{
    let query = "DELETE FROM kalendarz WHERE id_uczniowie = "+studentId+" AND dzien_wypisania = '"+date+"' AND typ_posilku = "+mealId+";";
    console.log(query);
    database.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
    })
}
function UpdateStudent(websocketClient, studentId, name, surname, mealId)
{
    let query = "UPDATE uczniowie SET imie = '" + name + "', nazwisko = '" + surname + "', id_posilki = " + mealId + " WHERE id = " + studentId + ";";
    database.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
    })
}
function DeleteStudent(websocketClient, studentId)
{
    let query = "DELETE FROM uczniowie WHERE id = " + studentId +";";
    database.query(query, function (err, result){
        if(err) throw err;
        console.log(result)
    })
}
