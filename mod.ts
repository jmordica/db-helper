// deno-lint-ignore-file no-explicit-any
import * as mysql from "https://deno.land/x/mysql2@v1.0.6/mod.ts";
import { 
  getUserByIdSql,
  getUserByEmailSql
} from "./sql.ts";

export class Database {

  /**
   * Initializes the database
   * @returns The result of the query
   * @throws Error if the query fails
   */

  mysql: mysql.Pool;

  constructor(connString: string) {
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
  }

  async run(sql: string, values: any) {
    try {
      const [rows] = await this.mysql.execute(sql, values);
      return rows;
    } catch (err) {return err}
  }

  /**
   * Returns the user with the given id
   * @param id - User ID
   * @returns The user record
   */
  async getUserById(id: number) {
    return await this.run(getUserByIdSql, {id});
  }

  /**
   * Returns the user with the given email
   * @param email - User email
   * @returns The user record
   */
  async getUserByEmail(email: string) {
    return await this.run(getUserByEmailSql, {email});
  }

}