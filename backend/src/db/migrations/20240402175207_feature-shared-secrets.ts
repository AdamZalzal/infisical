import type { Knex } from "knex";

import { SecretEncryptionAlgo, SecretKeyEncoding, TableName } from "../schemas";
import { createOnUpdateTrigger, dropOnUpdateTrigger } from "../utils";

export async function up(knex: Knex): Promise<void> {
  const doesTableExist = await knex.schema.hasTable(TableName.SharedSecrets);
  if (!doesTableExist) {
    await knex.schema.createTable(TableName.SharedSecrets, (t) => {
      t.uuid("id", { primaryKey: true }).defaultTo(knex.fn.uuid());
      t.string("algorithm").notNullable().defaultTo(SecretEncryptionAlgo.AES_256_GCM);
      t.string("keyEncoding").notNullable().defaultTo(SecretKeyEncoding.UTF8);
      t.string("cipherText").notNullable();
      t.string("tag").notNullable();
      t.string("iv").notNullable();
      t.uuid("userId").notNullable();
      t.timestamp("expiration").notNullable();
    });
  }
  await createOnUpdateTrigger(knex, TableName.SharedSecrets);
}

export async function down(knex: Knex): Promise<void> {
  await dropOnUpdateTrigger(knex, TableName.SharedSecrets);
  await knex.schema.dropTableIfExists(TableName.SharedSecrets);
}
