import morgan from "morgan";
import chalk from "chalk";
import { Debug } from "./types";
import { Express } from "express";

export function configureApp(app : Express) {
  morgan.token('method', (req) => {
    const types : Record<string, string> = {
      'GET' : chalk.green('GET'),
      'POST' : chalk.blue('POST'),
      'PUT' : chalk.yellow('PUT'),
      'DELETE' : chalk.red('DELETE'),
      'PATCH' : chalk.magenta('PATCH'),
      'HEAD' : chalk.cyan('HEAD'),
      'OPTIONS' : chalk.gray('OPTIONS'),
      'TRACE' : chalk.white('TRACE'),
      'CONNECT' : chalk.whiteBright('CONNECT'),
    }
    return types[req.method!] || chalk.white(req.method);
  });

  morgan.token('status', (_req, res) => {
    const status = res.statusCode;
    if (status >= 200 && status < 300)
      return chalk.green(status);

    if (status >= 300 && status < 400)
      return chalk.cyan(status);

    if (status >= 400 && status < 500)
      return chalk.yellow(status);

    if (status >= 500)
      return chalk.red(status);

    return chalk.white(status);
  })

  app.use(morgan(':method :url :status :response-time ms', {
    stream : {
      write : (message) => {
        Debug(message.trim());
      }
    }
  }));
}
