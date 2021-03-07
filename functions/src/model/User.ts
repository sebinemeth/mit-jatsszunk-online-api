import { admin } from "../config/firebase";

export class UserFactory {
  fromIdToken = (decodedIdToken: admin.auth.DecodedIdToken) =>
    ({
      uid: decodedIdToken.uid,
      email: decodedIdToken.email as string,
      emailVerified: decodedIdToken.email_verified as boolean,
      picture: decodedIdToken.picture,
      name: decodedIdToken.name
    } as User);
}

export type User = {
  uid: string;
  userName?: string;
  email: string;
  emailVerified: boolean;
  picture?: string;
  name?: string;
};
