import { admin } from "../config/firebase";
const randomAnimalName = require("random-animal-name");

export class UserFactory {
  fromIdToken = (decodedIdToken: admin.auth.DecodedIdToken) => {
    const user: User = {
      uid: decodedIdToken.uid,
      userName: (randomAnimalName() as string)
        .replace(/\s+/g, "-")
        .toLowerCase(),
      email: decodedIdToken.email as string,
      emailPublic: true,
      emailVerified: decodedIdToken.email_verified as boolean,
      name: decodedIdToken.name,
      namePublic: true,
      picture: decodedIdToken.picture,
      role: UserRole.USER
    };
    return user;
  };
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
  emailPublic: boolean;
  emailVerified: boolean;
  name?: string;
  namePublic: boolean;
  picture?: string;
  role: UserRole;
};
