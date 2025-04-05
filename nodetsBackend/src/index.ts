import 'dotenv/config';
import { createPool, Pool, PoolConnection } from 'mysql2/promise';
import { WebSocket } from 'ws';
import { ActionType, ServerData, ResponsePayload, ActionHandler, Person, RequestPayload, Params } from "./types";
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
        sendError(ws, 0x103, `Sending response error`, {variable, value, error});
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

function createHandler<T = any>(queryKey: string, responseVar?: string): ActionHandler
{
    return (async (ws: WebSocket, params: Params): Promise<void> => {
        try{
            const [sector, category, operation] = queryKey.split('.');
            const query: string = (Queries as any)[sector][category][operation];
            const result = await executeQuery<T>(query, params);

            if(responseVar) await sendResponse(ws, responseVar, result);
        } catch (error) {
            sendError(ws, 0x102, `Failed to initialize handler`, query);
            logger.error(`Failed to initialize handler: ${query}`);
            throw error;
        }
    })
}

function handleRequest(ws: WebSocket, params: RequestPayload)
{
    const handler = actionMap[params.method];
    if(!handler){
        sendError(ws, 0x101, `Unknown method`, params);
        logger.error(`Unknown method: `, {params})
        return;
    }

    handler(ws, params.params)
}

wss.on('connection', (ws: WebSocket) => {
    sendResponse(ws, 'message', `Successfully connected to the server!`);

    ws.on('error', (error) => {
        sendError(ws, 0x1, `WebSocket spotted an error`, error);
        logger.error(`WebSocket spotted an error: `, {error});
        throw error;});

    ws.on('message', (data: Buffer) => {
        try {
            const message: ServerData = JSON.parse(data.toString());
            if(message.action === 'request') {
                handleRequest(ws, message.params as RequestPayload);
            }
        } catch(error) {
            sendError(ws, 0x100, `Message formatting error`, error);
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

const actionMap: Record<string, ActionHandler> = {
    'getStudentListZsti': createHandler<Person[]>('zsti.students.get', 'StudentListZsti'),
    'updateStudentZsti': createHandler('zsti.students.update'),
}