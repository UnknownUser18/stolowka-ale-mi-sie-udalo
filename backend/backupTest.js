const msdump = require("mysqldump")
const subProcess = require('child_process')

async function backup() {
    const now = new Date();
    const dateString = now.toJSON().substring(0, 16).replace(":", "");
    const filename = `db-stolowka-backup.sql`;
    const path = ".\\BackupDatabase\\" + filename;
    await msdump({
        connection: {
            user: "root",
            host: "7.tcp.eu.ngrok.io",
            port: 14363,
            password: "niger",
            database: "stolowka"
        },
        dumpToFile: path
    }).then((result) => {
        subProcess.exec('echo jestes czarny', (err, stdout, stderr) => {
            if (err) {
                console.error(err)
                process.exit(1)
            } else {
                console.log(`The stdout Buffer from shell: ${stdout.toString()}`)
                console.log(`The stderr Buffer from shell: ${stderr.toString()}`)
            }
        })
    });
}
backup()
// run the backup function every hour
// setInterval(backup, 3600 * 1000);
