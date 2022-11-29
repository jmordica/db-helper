import { mysql } from "./deps.ts";
import { Req, Res } from "./types.d.ts";

export class Database {
  private pool: mysql.Pool;
  private rqliteUri: string;

  /**  
   * @param {string} mysqlUri The mysql connection string
   * @param {string} rqliteUri The rqlite connection string
   * @example
   * const db = new Vorm('mysql://root:root@localhost:3306/main', 'http://localhost:4001/db');
   */
  constructor(mysqlUri: string, rqliteUri: string) {
    const regex = /mysql:\/\/(.*)[:](.*)[@](.*)[:](.*)[/](.*)/g;
    const match = regex.exec(mysqlUri) || ['', 'root', 'root', 'localhost', '3306', 'main'];
    const [_, user, password, host, port, database] = match;
    
    // Create mysql pool
    this.pool = mysql.createPool({
      host,
      user,
      password,
      port: Number(port),
      database,
      connectionLimit: 5,
      namedPlaceholders: true,
      dateStrings: true,
    })

    // Create rqlite uri
    this.rqliteUri = rqliteUri || 'http://localhost:4001/db';
  }

  /**
   * Execute a query
   * @param {object} req The request object containing the SQL query string and values
   * @property {string} sql The SQL query string
   * @property {boolean} isWrite Is this a read write query?
   * @property {string} db Options are 'rqlite' | 'mysql'
   * @property {boolean} queue Queue (optional)
   * @property {object} values Values to be inserted into the query
   */
  async dbRes(req: Req): Promise<Res> {
    const res = await this[req.db](req);
    const { affectedRows = 0, insertId = 0, time = 0, error = '' } = res;
    return { req, rows: res || [], affectedRows, insertId, time, error }
  }

  /**
   * Execute a mysql query
   * @param {object} req The request object containing the SQL query string and values
   * @property {string} sql The SQL query string
   * @property {boolean} write Is this a read write query?
   * @property {string} db Options are 'rqlite' | 'mysql'
   * @property {boolean} queue Queue (optional)
   * @property {object} values Values to be inserted into the query
   */
  async mysql(req: Req) {
    try {
      if (req.isWrite) {
        // Handle write queries
        const res = await this.pool.execute(req.sql, req.values);
        return res[0];
      }
  
      // Handle read queries
      const [rows] = await this.pool.query(req.sql, req.values);
      return rows
    } catch (err) {return {error: err.message}}
  }

  /**
   * Execute a rqlite query
   * @param {object} req The request object containing the SQL query string and values
   * @property {string} sql The SQL query string
   * @property {boolean} isWrite Is this a read write query?
   * @property {string} db Options are 'rqlite' | 'mysql'
   * @property {boolean} queue Queue (optional)
   * @property {object} values Values to be inserted into the query
   */
  async rqlite(req: Req) {    
    const uri = req.isWrite ?
      `${this.rqliteUri}/execute?timings` :
      `${this.rqliteUri}/query?level=none&timings&associative`;
    
    const props = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([[req.sql, req.values]]),
    }

    try {
      const res = await fetch(uri, props);
      if (res.status >= 400) return {error: res.statusText};      
      
      const json = await res.json();
      
      if (req.isWrite) {
        return {
          affectedRows: json.results[0]?.rows_affected,
          insertId: json.results[0]?.last_insert_id,
          time: json.results[0]?.time,
          error: json.error,
        }
      }
      
      return json?.results?.[0]?.rows || [];
    } catch (err) {return {error: err?.message}}
  }
}