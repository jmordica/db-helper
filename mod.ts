import { mysql } from "./deps.ts";
import { Req, Res } from "./types.d.ts";

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

  async dbRes(req: Req): Promise<Res> {
    const res = await this[req.db](req);
    return {
      req: {
        sql: req.sql,
        write: req.write,
        db: req.db,
        queue: req.queue,
        values: req.values,
      },
      rows: res.isArray ? res : [],
      affectedRows: res.affectedRows || 0,
      insertId: res.insertId || 0,
      time: res.time || 0,
      error: res.err || '',
    }
  }

  async mysql(req: Req) {
    try {
      if (req.write) {
        // Handle write queries
        const res = await this.pool.execute(req.sql, req.values);
        return res[0];
      }
  
      // Handle read queries
      const [rows] = await this.pool.query(req.sql, req.values);
      return rows
    } catch (err) {return {err: err.message}}
  }

  async rqlite(req: Req) {    
    const uri = req.write ?
      `${this.rqliteUri}/execute?timings` :
      `${this.rqliteUri}/query?level=none&timings&associative`;
    
    const props = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([[req.sql, req.values]]),
    }

    try {
      const res = await fetch(uri, props);
      if (res.status >= 400) return {err: res.statusText};      
      
      const json = await res.json();
      
      if (req.write) {
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
}