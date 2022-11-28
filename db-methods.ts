import { Database } from "./mod.ts";
import { Res } from "./types.ts";
import {
  getUserById,
  getUserByEmail,
  getUsersByAccountId,
  addUserTenant
} from "./sql.ts";

export class Db extends Database {

  constructor(connString: string, rqliteUri: string) {
    super(connString, rqliteUri);
  }

  /**
   * Returns the user with the given id
   * @param id - User ID
   * @returns The user record
   */
   async getUserById(id: number): Promise<Res> {
    return await this.dbRes(getUserById, {id});
  }

  /**
   * Returns the user with the given email
   * @param email - User email
   * @returns The user record
   */
  async getUserByEmail(email: string): Promise<Res> {
    return await this.dbRes(getUserByEmail, {email});
  }

  /**
   * Returns the users with the given account id
   * @param id - Account ID
   * @returns The user records
   */
  async getUsersByAccountId(id: number): Promise<Res> {
    return await this.dbRes(getUsersByAccountId, {id});
  }

  /**
   * Adds a user to a tenant
   * @param tenantId - Tenant ID
   * @param userId - User ID
   * @returns The result of the query
   */
  async addUserTenant(tenantId: number, userId: number): Promise<Res> {
    return await this.dbRes(addUserTenant, {tenantId, userId});
  }
}