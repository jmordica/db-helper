export interface Query {
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

const common = {
  us_users: 'us_id, us_username, us_password, us_up_id, us_email, us_avatar_path, us_avatar_file_name, us_resettoken, us_te_id, us_receive_queue_reports, us_receive_user_queue_reports, us_io_id, us_timezone, us_re_id, us_enable_sf_tasks, us_enable_reporting',
}

export const getUsersByAccountId: Query = {
  sql: `SELECT ${common.us_users} FROM us_users WHERE us_te_id = :id`,
  db: 'mysql',
  write: false,
}

export const getUserById: Query = {
  sql: `SELECT ${common.us_users} FROM us_users WHERE us_id = :id LIMIT 1`,
  db: 'rqlite',
  write: false,
}

export const getUserByEmail: Query = {
  sql: `SELECT ${common.us_users} FROM us_users WHERE us_email = :email LIMIT 1`,
  db: 'rqlite',
  write: false,
}

export const addUserTenant: Query = {
  sql: `insert into ut_usertenants (ut_te_id, ut_us_id) values (:tenantId, :userId)`,
  db: 'rqlite',
  write: true,
}