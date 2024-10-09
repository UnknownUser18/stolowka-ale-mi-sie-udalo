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

wss.on('connection', function connection(ws) {

    ws.send("Succesfully connected to the server")

    ws.on('error', console.error);

    ws.on('message', function message(data) {
        if(typeof data == 'object') {
            let object = JSON.parse(data.toString())
            switch (object.method) {
                case "CardScan":
                    CardScan(object.id_ucznia, object.timestamp);
                    break;
                case "AnyQuery":
                    QueryExecute(object.query, object.password);
                    break;
            }
        }
    });

});
const password = process.argv.slice(2,6)[0]
const dbpassword = process.argv.slice(2,6)[1]
const dbhost = process.argv.slice(2,6)[2]
const dbport = process.argv.slice(2,6)[3]

const database = mysql.createConnection({
    host: dbhost.toString(),
    port: parseInt(dbport),
    user: "root",
    password: dbpassword.toString(),
})
function CardScan(id_karty, timestamp)
{
    let query = "INSERT INTO skan (id_karty, time) VALUES(" + id_karty + ",'" + timestamp +"')"
    return database.query(query, (err, res) => {
        console.log(err); console.log(res)
        return err;})
}

function QueryExecute(query, pass) {
    if(password === pass)
    {
        database.query(query, (err, res) => {
            console.log(err); console.log(res)
            return err;
        })
    }
    else{
        return -1;
    }
}
