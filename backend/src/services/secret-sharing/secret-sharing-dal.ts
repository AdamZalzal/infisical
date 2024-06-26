import { TDbClient } from "@app/db";
import { TableName } from "@app/db/schemas";
import { ormify } from "@app/lib/knex";

export type TSecretSharingDALFactory = ReturnType<typeof secretSharingDALFactory>;

export const secretSharingDALFactory = (db: TDbClient) => ormify(db, TableName.SharedSecrets);
