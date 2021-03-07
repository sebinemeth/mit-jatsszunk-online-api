import { admin } from "./config/firebase";
import { Request } from "express";

export const getUser = async (req: Request) => {
  try {
    const idToken = req.headers.authorization;
    const decodedToken = await admin.auth().verifyIdToken(idToken as string);
    return decodedToken || null;
  } catch (error) {
    return null;
  }
};
