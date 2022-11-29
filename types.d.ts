export interface Req {
  /** The SQL query string as a Named Placeholer
   * @example SELECT * FROM users WHERE id = :id
   * @example INSERT INTO users (name, email) VALUES (:name, :email)
   * @example UPDATE users SET name = :name, email = :email WHERE id = :id
   * @example DELETE FROM users WHERE id = :id
   */
  sql: string;
  /** Is this a read write query?
   * @default false
   */
   isWrite: boolean;
  /**  Options are 'rqlite' | 'mysql'
   * @default 'mysql'
   */
  db: "mysql" | "rqlite";
  /** Queue (optional) https://github.com/rqlite/rqlite/blob/master/DOC/QUEUED_WRITES.md */
  queue?: boolean;
  /** Values to be inserted into the query
   * @example {id: 1}
   * @example {name: 'John', email: 'sam@gmail.com'}
   */
  values: { [param: string]: string | number };
}

export interface Res {
  /**
   * The request object containing the SQL query string and values
   * @type {Interface}
   * @property {string} sql The SQL query string
   * @property {boolean} isWrite Is this a read write query?
   * @property {string} db Options are 'rqlite' | 'mysql'
   * @property {boolean} queue Queue (optional)
   * @property {object} values Values to be inserted into the query
   * @example
   * { sql: 'SELECT * FROM users WHERE id = :id', isWrite: false, db: 'mysql', queue: false, values: { id: 1 } }
   */
  req: Req,
  /** The result of a SELECT query in an array of objects
   * @type {Array}
   * @example
   * [ { id: 1, name: 'John' }, { id: 2, name: 'Jane' } ]
   */
  rows: { [param: string]: string | number }[],
  /** The number of rows affected by the query
   * @type {number}
   * @default 0
   */
  affectedRows: number,
  /** The insert ID of the last row inserted
   * @type {number}
   * @default 0
   */
  insertId: number,
  /** The time it took to execute the query (only available for rqlite)
   * @type {number}
   * @default 0
   */
  time: number,
  /** The error if there was one
   * @type {string}
   * @default ''
   */
  error: string
}