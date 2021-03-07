import { Request, Response } from "express";
import { getUser } from "./auth";
import { admin, db } from "./config/firebase";
import { UserFactory } from "./model/User";

export const getMe = async (req: Request, res: Response) => {
  try {
    const decodedIdToken: admin.auth.DecodedIdToken | null = await getUser(req);
    if (!decodedIdToken) return res.status(403).send();

    const userRef = db.collection("users").doc(decodedIdToken.uid);
    const exists = (await userRef.get()).exists;

    if (!exists) {
      const user = new UserFactory().fromIdToken(decodedIdToken);
      await userRef.set(user);
    }
    return res.status(200).json({
      status: "success",
      message: (exists ? "" : "non") + "existing user",
      data: (await userRef.get()).data()
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
