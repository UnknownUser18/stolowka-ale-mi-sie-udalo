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
        }

    });
});

//todo: ENV variables
const serverPassword = process.argv.slice(2,6)[0]
const dbPassword = process.argv.slice(2,6)[1]
const dbHost = process.argv.slice(2,6)[2]
const dbPort = process.argv.slice(2,6)[3]

const database = mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: "root",
    password: dbPassword,
    database: "stolowka"
})

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

function StudentList(websocketClient ,condition)
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
    let query = "INSERT INTO kalendarz (id_uczniowie, dzien_wypisania, typ_posilku) VALUES("+studentId+", '"+date+"', "+mealId+")";
    database.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
    })
}