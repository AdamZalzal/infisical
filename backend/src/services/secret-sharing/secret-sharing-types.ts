export type TCreateSharedSecret = {
  data: string;
  userId: string;
  expiration: string;
};

export type TGetSharedSecret = {
  sharedSecretId: string;
};
