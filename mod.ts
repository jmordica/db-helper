// deno-lint-ignore-file no-explicit-any
import * as mysql from "https://deno.land/x/mysql2@v1.0.6/mod.ts";
import { 
  getUserByIdSql,
  getUserByEmailSql,
  getUsersByAccountId
} from "./sql.ts";

export class Database {

  /**
   * Initializes the database
   * @returns The result of the query
   * @throws Error if the query fails
   */

  mysql: mysql.Pool;
  rqliteUri: string;

  constructor(connString: string, rqliteUri: string) {
    const regex = /mysql:\/\/(.*)[:](.*)[@](.*)[:](.*)[/](.*)/g;
    const match = regex.exec(connString) || ['', 'root', 'root', 'localhost', '3306', 'main'];

    this.mysql = mysql.createPool({
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

  async run(sql: string, values: any, db: string, write: boolean) {
    try {
      if (db === 'rqlite') return await this.rqlite(sql, values, write);

      if (db === 'mysql') {
        const [rows] = await this.mysql.execute(sql, values);
        return rows;
      }
    } catch (err) {return err}
  }

  async rqlite(sql: string, values: any, write: boolean) {    
    const uri = write ?
      `${this.rqliteUri}/execute?timings` :
      `${this.rqliteUri}/query?level=none&timings&associative`;
    
    const data = [sql, values];

    const res = await fetch(uri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([data]),
    });
    const json = await res.json();
    return json?.results?.[0]?.rows;  
  }

  /**
   * Returns the user with the given id
   * @param id - User ID
   * @returns The user record
   */
  async getUserById(id: number) {
    const { sql, db, write } = getUserByIdSql;
    return await this.run(sql, {id}, db, write);
  }

  /**
   * Returns the user with the given email
   * @param email - User email
   * @returns The user record
   */
  async getUserByEmail(email: string) {
    const { sql, db, write } = getUserByEmailSql;
    return await this.run(sql, {email}, db, write);
  }

  /**
   * Returns the users with the given account id
   * @param id - Account ID
   * @returns The user records
   */
  async getUsersByAccountId(id: number) {
    const { sql, db, write } = getUsersByAccountId;
    return await this.run(sql, {id}, db, write);
  }

}