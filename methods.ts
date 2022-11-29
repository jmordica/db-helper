import { Database } from "./mod.ts";
import { Res } from "./types.d.ts";

const common = {
  us_users: 'us_id, us_username, us_password, us_up_id, us_email, us_avatar_path, us_avatar_file_name, us_resettoken, us_te_id, us_receive_queue_reports, us_receive_user_queue_reports, us_io_id, us_timezone, us_re_id, us_enable_sf_tasks, us_enable_reporting',
}

export class Vorm extends Database {

  /**
   * Returns the user with the given id
   * @param id - User ID
   * @returns The user record
   */
   async getUserById(id: number): Promise<Res> {
    return await this.dbRes({
      sql: `SELECT ${common.us_users} FROM us_users WHERE us_id = :id LIMIT 1`,
      db: 'mysql',
      isWrite: false,
      values: {id}
    });
  }

  /**
   * Returns the user with the given email
   * @param email - User email
   * @returns The user record
   */
  async getUserByEmail(email: string): Promise<Res> {
    return await this.dbRes({
      sql: `SELECT ${common.us_users} FROM us_users WHERE us_email = :email LIMIT 1`,
      db: 'rqlite',
      isWrite: false,
      values: {email},
    });
  }

  /**
   * Returns the users with the given account id
   * @param id - Account ID
   * @returns The user records
   */
  async getUsersByAccountId(id: number): Promise<Res> {
    return await this.dbRes({
      sql: `SELECT ${common.us_users} FROM us_users WHERE us_te_id = :id`,
      db: 'mysql',
      isWrite: false,
      values: {id},
    });
  }

  /**
   * Adds a user to a tenant
   * @param tenantId - Tenant ID
   * @param userId - User ID
   * @returns The result of the query
   */
  async addUserTenant(tenantId: number, userId: number): Promise<Res> {
    return await this.dbRes({
      sql: `insert into ut_usertenants (ut_te_id, ut_us_id) values (:tenantId, :userId)`,
      db: 'rqlite',
      isWrite: true,
      values: {tenantId, userId},
    });
  }
}