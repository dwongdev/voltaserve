// Copyright (c) 2023 Anass Bouassaba.
//
// Use of this software is governed by the Business Source License
// included in the file LICENSE in the root of this repository.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// AGPL-3.0-only in the root of this repository.
import {
  newInternalServerError,
  newUserNotFoundError,
} from '@/error/creators.ts'
import { withPostgres } from '@/infra/postgres.ts'
import { InsertOptions, UpdateOptions, User } from '@/user/model.ts'

class UserRepoImpl {
  findById(id: string): Promise<User> {
    return withPostgres(async (client) => {
      const { rows } = await client.queryObject(
        `SELECT * FROM "user" WHERE id = $1`,
        [id],
      )
      if (rows.length === 0) {
        throw newUserNotFoundError()
      }
      return this.mapRow(rows[0])
    })
  }

  findByUsername(username: string): Promise<User> {
    return withPostgres(async (client) => {
      const { rows } = await client.queryObject(
        `SELECT * FROM "user" WHERE username = $1`,
        [username],
      )
      if (rows.length === 0) {
        throw newUserNotFoundError()
      }
      return this.mapRow(rows[0])
    })
  }

  findByEmail(email: string): Promise<User> {
    return withPostgres(async (client) => {
      const { rows } = await client.queryObject(
        `SELECT * FROM "user" WHERE email = $1`,
        [email],
      )
      if (rows.length === 0) {
        throw newUserNotFoundError()
      }
      return this.mapRow(rows[0])
    })
  }

  findByRefreshTokenValue(refreshTokenValue: string): Promise<User> {
    return withPostgres(async (client) => {
      const { rows } = await client.queryObject(
        `SELECT * FROM "user" WHERE refresh_token_value = $1`,
        [refreshTokenValue],
      )
      if (rows.length === 0) {
        throw newUserNotFoundError()
      }
      return this.mapRow(rows[0])
    })
  }

  findByResetPasswordToken(resetPasswordToken: string): Promise<User> {
    return withPostgres(async (client) => {
      const { rows } = await client.queryObject(
        `SELECT * FROM "user" WHERE reset_password_token = $1`,
        [resetPasswordToken],
      )
      if (rows.length === 0) {
        throw newUserNotFoundError()
      }
      return this.mapRow(rows[0])
    })
  }

  findByEmailConfirmationToken(
    emailConfirmationToken: string,
  ): Promise<User> {
    return withPostgres(async (client) => {
      const { rows } = await client.queryObject(
        `SELECT * FROM "user" WHERE email_confirmation_token = $1`,
        [emailConfirmationToken],
      )
      if (rows.length === 0) {
        throw newUserNotFoundError()
      }
      return this.mapRow(rows[0])
    })
  }

  findByEmailUpdateToken(emailUpdateToken: string): Promise<User> {
    return withPostgres(async (client) => {
      const { rows } = await client.queryObject(
        `SELECT * FROM "user" WHERE email_update_token = $1`,
        [emailUpdateToken],
      )
      if (rows.length === 0) {
        throw newUserNotFoundError()
      }
      return this.mapRow(rows[0])
    })
  }

  list(page: number, size: number): Promise<User[]> {
    return withPostgres(async (client) => {
      const { rows } = await client.queryObject(
        `SELECT *
       FROM "user"
       ORDER BY create_time
       OFFSET $1
       LIMIT $2`,
        [(page - 1) * size, size],
      )
      return rows.map(this.mapRow)
    })
  }

  findMany(ids: string[]): Promise<User[]> {
    return withPostgres(async (client) => {
      const { rows } = await client.queryObject(
        `SELECT *
       FROM "user"
       WHERE id = ANY ($1)
       ORDER BY create_time`,
        [ids],
      )
      return rows.map(this.mapRow)
    })
  }

  getCount(): Promise<number> {
    return withPostgres(async (client) => {
      const { rowCount } = await client.queryObject(
        `SELECT COUNT(id) as count FROM "user"`,
      )
      return rowCount ?? 0
    })
  }

  isUsernameAvailable(username: string): Promise<boolean> {
    return withPostgres(async (client) => {
      const { rowCount } = await client.queryObject(
        `SELECT * FROM "user" WHERE username = $1`,
        [username],
      )
      return rowCount === 0
    })
  }

  insert(data: InsertOptions): Promise<User> {
    return withPostgres(async (client) => {
      const { rowCount } = await client.queryObject(
        `INSERT INTO "user" (
        id,
        full_name,
        username,
        email,
        password_hash,
        refresh_token_value,
        refresh_token_expiry,
        reset_password_token,
        email_confirmation_token,
        is_email_confirmed,
        is_admin,
        is_active,
        picture,
        strategy,
        create_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
        [
          data.id,
          data.fullName,
          data.username,
          data.email,
          data.passwordHash,
          data.refreshTokenValue,
          data.refreshTokenExpiry,
          data.resetPasswordToken,
          data.emailConfirmationToken,
          data.isEmailConfirmed || false,
          data.isAdmin || false,
          data.isActive || true,
          data.picture,
          data.strategy,
          new Date().toISOString(),
        ],
      )
      if (!rowCount || rowCount === 0) {
        throw newInternalServerError()
      }
      return await this.findById(data.id)
    })
  }

  update(data: UpdateOptions): Promise<User> {
    return withPostgres(async (client) => {
      const entity = await this.findById(data.id)
      if (!entity) {
        throw newUserNotFoundError()
      }
      Object.assign(entity, data)
      entity.updateTime = new Date().toISOString()
      const { rowCount } = await client.queryObject(
        `UPDATE "user" 
        SET
          full_name = $1,
          username = $2,
          email = $3,
          password_hash = $4,
          refresh_token_value = $5,
          refresh_token_expiry = $6,
          reset_password_token = $7,
          email_confirmation_token = $8,
          is_email_confirmed = $9,
          is_admin = $10,
          is_active = $11,
          email_update_token = $12,
          email_update_value = $13,
          picture = $14,
          failed_attempts = $15,
          locked_until = $16,
          update_time = $17
        WHERE id = $18
        RETURNING *`,
        [
          entity.fullName,
          entity.username,
          entity.email,
          entity.passwordHash,
          entity.refreshTokenValue,
          entity.refreshTokenExpiry,
          entity.resetPasswordToken,
          entity.emailConfirmationToken,
          entity.isEmailConfirmed,
          entity.isAdmin,
          entity.isActive,
          entity.emailUpdateToken,
          entity.emailUpdateValue,
          entity.picture,
          entity.failedAttempts,
          entity.lockedUntil,
          new Date().toISOString(),
          entity.id,
        ],
      )
      if (!rowCount || rowCount === 0) {
        throw newInternalServerError()
      }
      return await this.findById(data.id)
    })
  }

  delete(id: string): Promise<void> {
    return withPostgres(async (client) => {
      await client.queryObject('DELETE FROM "user" WHERE id = $1', [id])
    })
  }

  suspend(id: string, suspend: boolean): Promise<void> {
    return withPostgres(async (client) => {
      await client.queryObject(
        'UPDATE "user" SET is_active = $1, refresh_token_value = null, refresh_token_expiry = null, update_time = $2 WHERE id = $3',
        [!suspend, new Date().toISOString(), id],
      )
    })
  }

  makeAdmin(id: string, makeAdmin: boolean): Promise<void> {
    return withPostgres(async (client) => {
      await client.queryObject(
        'UPDATE "user" SET is_admin = $1, update_time = $2 WHERE id = $3',
        [makeAdmin, new Date().toISOString(), id],
      )
    })
  }

  enoughActiveAdmins() {
    return withPostgres(async (client) => {
      const { rows } = await client.queryObject(
        'SELECT COUNT(*) as count FROM "user" WHERE is_admin IS TRUE AND is_active IS TRUE',
      )
      const result = rows as { count: number }[]
      return result[0].count > 1
    })
  }

  private mapRow(row: any): User {
    return {
      id: row.id,
      fullName: row.full_name,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      refreshTokenValue: row.refresh_token_value,
      refreshTokenExpiry: row.refresh_token_expiry,
      resetPasswordToken: row.reset_password_token,
      emailConfirmationToken: row.email_confirmation_token,
      isEmailConfirmed: row.is_email_confirmed,
      isAdmin: row.is_admin,
      isActive: row.is_active,
      emailUpdateToken: row.email_update_token,
      emailUpdateValue: row.email_update_value,
      picture: row.picture,
      failedAttempts: Number(row.failed_attempts),
      lockedUntil: row.locked_until,
      strategy: row.strategy,
      createTime: row.create_time,
      updateTime: row.update_time,
    }
  }
}

const userRepo: UserRepoImpl = new UserRepoImpl()

export default userRepo
