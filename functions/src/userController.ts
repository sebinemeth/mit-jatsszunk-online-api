import { Request, Response } from "express";
import { decodeToken, registerUserIfNotPresent } from "./auth";
import { db } from "./config/firebase";
import { Exception } from "./model/Exception";
import { User, UserRole } from "./model/User";

export const getMe = async (req: Request, res: Response) => {
  try {
    try {
      const decodedIdToken = await decodeToken(req);
      const currentUser = await registerUserIfNotPresent(decodedIdToken);
      return res.status(200).json({
        status: "success",
        data: currentUser
      });
    } catch (error) {
      return res.status(403).json({
        status: "error",
        message: error.message
      });
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    let currentUser: User | null = null;
    try {
      const decodedIdToken = await decodeToken(req);
      currentUser = (await registerUserIfNotPresent(decodedIdToken)) as User;
    } catch (error) {}

    const allUsers: User[] = [];
    const querySnapshot = await db.collection("users").get();
    querySnapshot.forEach((doc: any) => {
      let data = doc.data();
      if (
        !currentUser ||
        (currentUser.role !== UserRole.ADMIN &&
          currentUser.uid !== doc.data().uid)
      ) {
        const { userName, uid, role } = doc.data();
        data = { userName, uid, role } as User;
      }
      allUsers.push(data);
    });
    return res.status(200).json(allUsers);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const {
    body: { name, userName },
    params: { userId }
  } = req;

  try {
    try {
      const decodedIdToken = await decodeToken(req);
      const currentUser = await registerUserIfNotPresent(decodedIdToken);
      if (currentUser.role !== UserRole.ADMIN && currentUser.uid !== userId)
        return res.status(403).json({
          status: "error",
          message: Exception.AUTH_UNAUTHORIZED_ACTION
        });

      const entry = db.collection("users").doc(userId);
      const currentData = (await entry.get()).data() || {};
      console.log(currentData);

      const userObject = {
        name: name || currentData.name,
        userName: userName || currentData.userName
      };

      await entry.set(userObject, { merge: true }).catch((error) => {
        return res.status(400).json({
          status: "error",
          message: error.message
        });
      });
      return res.status(200).json({
        status: "success",
        message: "entry updated successfully",
        data: (await entry.get()).data()
      });
    } catch (error) {
      return res.status(403).json({
        status: "error",
        message: error.message
      });
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
