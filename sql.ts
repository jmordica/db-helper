import { Req } from "./types.ts";

const common = {
  us_users: 'us_id, us_username, us_password, us_up_id, us_email, us_avatar_path, us_avatar_file_name, us_resettoken, us_te_id, us_receive_queue_reports, us_receive_user_queue_reports, us_io_id, us_timezone, us_re_id, us_enable_sf_tasks, us_enable_reporting',
}

export const getUsersByAccountId: Req = {
  sql: `SELECT ${common.us_users} FROM us_users WHERE us_te_id = :id`,
  db: 'mysql',
  write: false,
}

export const getUserById: Req = {
  sql: `SELECT ${common.us_users} FROM us_users WHERE us_id = :id LIMIT 1`,
  db: 'mysql',
  write: false,
}

export const getUserByEmail: Req = {
  sql: `SELECT ${common.us_users} FROM us_users WHERE us_email = :email LIMIT 1`,
  db: 'rqlite',
  write: false,
}

export const addUserTenant: Req = {
  sql: `insert into ut_usertenants (ut_te_id, ut_us_id) values (:tenantId, :userId)`,
  db: 'rqlite',
  write: true,
}