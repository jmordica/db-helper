interface Query {
  /** The SQL query string */
  sql: string;
  /** Is this a read write query? */
  write: boolean;
  /**  Options are 'rqlite' | 'mysql' */
  db: "mysql" | "rqlite";
}

export const getUsersByAccountId: Query = {
  sql: `SELECT * FROM us_users WHERE us_te_id = :id`,
  db: "rqlite",
  write: false,
}

export const getUserByIdSql: Query = {
  sql: `select * from us_users where us_id = :id limit 1`,
  db: "rqlite",
  write: false,
}

export const getUserByEmailSql: Query = {
  sql: `select * from us_users where us_email = :email limit 1`,
  db: "mysql",
  write: false,
}