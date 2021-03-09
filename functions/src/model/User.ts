import { admin } from "../config/firebase";
const randomAnimalName = require("random-animal-name");

export class UserFactory {
  fromIdToken = (decodedIdToken: admin.auth.DecodedIdToken) =>
    ({
      uid: decodedIdToken.uid,
      userName: (randomAnimalName() as string)
        .replace(/\s+/g, "-")
        .toLowerCase(),
      email: decodedIdToken.email as string,
      emailVerified: decodedIdToken.email_verified as boolean,
      picture: decodedIdToken.picture,
      name: decodedIdToken.name,
      role: UserRole.USER
    } as User);
}

export enum UserRole {
  ADMIN = "admin",
  MODERATOR = "moderator",
  USER = "user"
}

export type User = {
  uid: string;
  userName: string;
  email: string;
  emailVerified: boolean;
  picture?: string;
  name?: string;
  role: UserRole;
};
