import * as mysql from "https://deno.land/x/mysql2@v1.0.6/mod.ts";
import {
  Query,
  getUserById,
  getUserByEmail,
  getUsersByAccountId,
  addUserTenant
} from "./sql.ts";

export type dbRes = {
  /**
   * The SQL query string
   * @type {Interface}
   */
  req: Query,
  /** The result of the query in an array
   * @type {any[]}
   */
  rows: [],
  /** The number of rows affected by the query
   * @type {number}
   */
  affectedRows: number,
  /** The number of rows returned by the query
   * @type {number}
   */
  insertId: number,
  /** The time it took to execute the query
   * @type {number}
   */
  time: number,
  /** The error if there was one
   * @type {string}
   */
  error: string
}

export class Database {

  /**
   * Initializes the database
   * @returns The result of the query
   * @throws Error if the query fails
   */

  pool: mysql.Pool;
  rqliteUri: string;

  constructor(connString: string, rqliteUri: string) {
    const regex = /mysql:\/\/(.*)[:](.*)[@](.*)[:](.*)[/](.*)/g;
    const match = regex.exec(connString) || ['', 'root', 'root', 'localhost', '3306', 'main'];

    this.pool = mysql.createPool({
      host: match[3],
      user: match[1],
      password: match[2],
      port: parseInt(match[4]),
      database: match[5],
      connectionLimit: 5,
      namedPlaceholders: true,
      dateStrings: true,
    })

    this.rqliteUri = rqliteUri || 'http://localhost:4001/db';
  }

  async dbRes(sql: Query, values: { [param: string]: string | number }): Promise<dbRes> {
    const res = await this[sql.db](sql, values);
    return {
      req: {
        sql: sql.sql,
        write: sql.write,
        db: sql.db,
        queue: sql.queue,
        values,
      },
      rows: res.isArray ? res : [],
      affectedRows: res.affectedRows || 0,
      insertId: res.insertId || 0,
      time: res.time || 0,
      error: res.err || '',
    }
  }

  async mysql(sql: Query, values: { [param: string]: string | number }) {
    try {
      if (sql.write) {
        // Handle write queries
        const res = await this.pool.execute(sql, values);
        return res[0];
      }
  
      // Handle read queries
      const [rows] = await this.pool.query(sql, values);
      return rows
    } catch (err) {return {err: err.message}}
  }

  async rqlite(sql: Query, values: { [param: string]: string | number }) {    
    const uri = sql.write ?
      `${this.rqliteUri}/execute?timings` :
      `${this.rqliteUri}/query?level=none&timings&associative`;
    
    const props = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([[sql.sql, values]]),
    }

    try {
      const res = await fetch(uri, props);
      if (res.status >= 400) return {err: res.statusText};      
      
      const json = await res.json();
      
      if (sql.write) {
        return {
          affectedRows: json.results[0]?.rows_affected,
          insertId: json.results[0]?.last_insert_id,
          time: json.results[0]?.time,
          err: json.error,
        }
      }
      
      return json?.results?.[0]?.rows || [];
    } catch (err) {return {err: err?.message}}
  }

  /**
   * Returns the user with the given id
   * @param id - User ID
   * @returns The user record
   */
  async getUserById(id: number) {
    return await this.dbRes(getUserById, {id});
  }

  /**
   * Returns the user with the given email
   * @param email - User email
   * @returns The user record
   */
  async getUserByEmail(email: string) {
    return await this.dbRes(getUserByEmail, {email});
  }

  /**
   * Returns the users with the given account id
   * @param id - Account ID
   * @returns The user records
   */
  async getUsersByAccountId(id: number) {
    return await this.dbRes(getUsersByAccountId, {id});
  }

  /**
   * Adds a user to a tenant
   * @param tenantId - Tenant ID
   * @param userId - User ID
   * @returns The result of the query
   */
  async addUserTenant(tenantId: number, userId: number): Promise<dbRes> {
    return await this.dbRes(addUserTenant, {tenantId, userId});
  }

}