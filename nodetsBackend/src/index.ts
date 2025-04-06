import 'dotenv/config';
import { createPool, Pool, PoolConnection } from 'mysql2/promise';
import { WebSocket } from 'ws';
import {
    ActionType,
    ServerData,
    ResponsePayload,
    RequestPayload,
    Params,
    QueriesStructure
} from "./types";
import { logger, wss, dbConfig, Queries } from './config'
import { query } from "winston";
logger.info(``);
logger.info(`Successfully started the server!`);
logger.info(``);

const pool: Pool = createPool(dbConfig);

async function executeQuery<T = any>(query: string, params?: Params): Promise<T>
{
    const conn: PoolConnection = await pool.getConnection();
    try{
        const [results] = await conn.query(query, params);
        logger.info(`Query executed successfully: `, {query, params});
        return results as T;
    }
    catch(error){
        logger.error(`Execute query error: `, {query, error});
        throw error;
    }
    finally{
        conn.release();
    }
}

async function sendResponse(ws: WebSocket, variable: string, value: any): Promise<void>
{
    try {
        ws.send(standardizeData('response', {variable, value} as ResponsePayload))
        logger.info(`Sending response completed successfully: `, {variable, value});
    }
    catch(error){
        await sendError(ws, 300, `Sending response error`, {variable, value, error});
        logger.error(`Sending response error: `, {variable, value, error});
        throw error;
    }
}

function standardizeData(action: ActionType, params: ResponsePayload): string
{
    return JSON.stringify(
        {
            action,
            params
        } as ServerData
    );
}


async function handleMethod(ws: WebSocket, params: RequestPayload): Promise<void>
{
    try{
        const [sector, category, operation] = params.method.split('.');
        const method = (Queries as QueriesStructure)[sector][category];
        const query: string = method[operation] as string;

        const rawResult = await executeQuery(query, params.params);

        if(params.responseVar)
        {
            const result = method.type.parse(rawResult);
            await sendResponse(ws, params.responseVar, result);
        }
    } catch (error) {
        await sendError(ws, 300, `Failed to handle method`, query);
        logger.error(`Failed to handle method: ${query}`);
        throw error;
    }
}


wss.on('connection', async (ws: WebSocket) => {
    await sendResponse(ws, 'message', `Successfully connected to the server!`);

    ws.on('error', async (error) => {
        await sendError(ws, 1, `WebSocket spotted an error`, error);
        logger.error(`WebSocket spotted an error: `, {error});
    });

    ws.on('message', async (data: Buffer) => {
        try {
            const message: ServerData = JSON.parse(data.toString());
            if(message.action === 'request') {
                await handleMethod(ws, message.params as RequestPayload)
            }
        } catch(error) {
            await sendError(ws, 200, `Message formatting error`, error);
            logger.error(`Message formatting error: `, {error})
        }
    })
})

async function sendError(
    ws: WebSocket,
    code: number,
    message: string,
    details?: any
): Promise<void> {
    await sendResponse(ws, 'error', {code, message, details})
}