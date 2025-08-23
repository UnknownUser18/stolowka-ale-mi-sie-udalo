import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export enum StatusCodes {
  'OK' = 200,
  'Inserted' = 201,
  'Updated' = 202,
  'Removed' = 203,
  'Internal Server Error' = 500,
  'Database Connection Error' = 700,
  'Duplicate Entry' = 701,
  'Unknown Column' = 702,
  'Invalid Query Syntax' = 703,
  'Table Not Found' = 704,
  'Access Denied' = 705,
  'User has no permissions for this action' = 706,
  'Cannot remove or update a record, foreign key constraint fails' = 707,
  'Cannot add or update a record, foreign key constraint fails' = 708,
  'Data too long' = 709,
  'Incorrect data value' = 710,
  'Column cannot be null' = 711,
}

export class Packet {
  status : StatusCodes;
  statusMessage : string;
  timestamp : Date;
  data? : any[] | null;
  constructor(status : StatusCodes, statusMessage : string, timestamp : string, ...data : any[]) {
    this.status = status;
    this.statusMessage = statusMessage;
    this.timestamp = new Date(timestamp);
    this.data = data.length > 0 ? data : null;
  }
}

export class ErrorPacket extends Packet {
  override data : null;
  constructor(status : StatusCodes, statusMessage : string, timestamp : string) {
    super(status, statusMessage, timestamp);
    this.data = null;
  }
}

@Injectable({
  providedIn : 'root'
})
export abstract class TypesService {
  public http = inject(HttpClient);
  public readonly api = '/api/';
}
