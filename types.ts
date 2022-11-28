export interface Req {
  /** The SQL query string */
  sql: string;
  /** Is this a read write query? */
  write: boolean;
  /**  Options are 'rqlite' | 'mysql' */
  db: "mysql" | "rqlite";
  /** Queue (optional) https://github.com/rqlite/rqlite/blob/master/DOC/QUEUED_WRITES.md */
  queue?: boolean;
  /** Values to be inserted into the query */
  values?: { [param: string]: string | number };
}

export interface Res {
  /**
   * The request object containing the SQL query string and values
   * @type {Interface}
   */
  req: Req,
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