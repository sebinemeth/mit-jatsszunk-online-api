import { admin, db } from "./config/firebase";
import { Request } from "express";
import { Exception } from "./model/Exception";
import { User, UserFactory } from "./model/User";

export const decodeToken = async (req: Request) => {
  const auth = req.headers.authorization;
  if (!auth) throw Exception.AUTH_NO_TOKEN;
  const idToken = auth.split(" ")[1];
  if (!idToken) throw Exception.AUTH_NO_TOKEN;
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  if (!decodedToken) throw Exception.AUTH_INVALID_TOKEN;
  return decodedToken;
};

export const registerUserIfNotPresent = async (
  decodedIdToken: admin.auth.DecodedIdToken
) => {
  const userRef = db.collection("users").doc(decodedIdToken.uid);
  const exists = (await userRef.get()).exists;
  if (!exists) {
    const user = new UserFactory().fromIdToken(decodedIdToken);
    await userRef.set(user);
  }
  return (await userRef.get()).data() as User;
};
