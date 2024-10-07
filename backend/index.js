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
            }
        }
    });

});


const database = mysql.createConnection({
    host: "kejpa.duckdns.org",
    user: "root",
    password: "kapa1Gkf!!jfFg",
    database: "kapa"
})
function CardScan(id_karty, timestamp)
{
    let query = "INSERT INTO skan (id_karty, time) VALUES(" + id_karty + ",'" + timestamp +"')"
    return database.query(query, (err, res) => {console.log(err)
    console.log(res)})
}
