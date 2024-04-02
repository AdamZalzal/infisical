import { infisicalSymmetricDecrypt, infisicalSymmetricEncypt } from "@app/lib/crypto/encryption";
import { TSecretSharingDALFactory } from "./secret-sharing-dal";
import { TCreateSharedSecret, TGetSharedSecret } from "./secret-sharing-types";
import { SecretKeyEncoding } from "@app/db/schemas";
import { BadRequestError } from "@app/lib/errors";

type TSecretSharingServiceFactoryDep = {
  secretSharingDAL: TSecretSharingDALFactory;
};

export type TSecretSharingServiceFactory = ReturnType<typeof secretSharingServiceFactory>;

export const secretSharingServiceFactory = ({ secretSharingDAL }: TSecretSharingServiceFactoryDep) => {
  const createSharedSecret = async ({ data, userId, expiration }: TCreateSharedSecret): Promise<string> => {
    const encryptedInput = infisicalSymmetricEncypt(data);
    const sharedSecret = await secretSharingDAL.create({
      userId,
      algorithm: encryptedInput.algorithm,
      keyEncoding: encryptedInput.encoding,
      expiration: new Date(expiration),
      iv: encryptedInput.iv,
      tag: encryptedInput.tag,
      cipherText: encryptedInput.ciphertext
    });

    return sharedSecret.id;
  };

  const getSharedSecret = async ({ sharedSecretId }: TGetSharedSecret): Promise<string> => {
    let sharedSecret;
    try {
      sharedSecret = await secretSharingDAL.findById(sharedSecretId);
    } catch (err) {
      throw new BadRequestError({ message: "Shared secret doesn't exist." });
    }
    const currentDate = new Date();
    const expirationDate = new Date(sharedSecret.expiration);
    if (expirationDate > currentDate) {
      const decryptedSecret = infisicalSymmetricDecrypt({
        keyEncoding: sharedSecret.keyEncoding as SecretKeyEncoding,
        ciphertext: sharedSecret.cipherText,
        tag: sharedSecret.tag,
        iv: sharedSecret.iv
      });

      return decryptedSecret;
    } else {
      throw new BadRequestError({ message: "Shared secret link has expired." });
    }
  };

  return {
    createSharedSecret,
    getSharedSecret
  };
};
