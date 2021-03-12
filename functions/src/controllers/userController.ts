import { Request, Response } from "express";
import { decodeToken, registerUserIfNotPresent } from "../auth";
import { db } from "../config/firebase";
import { Exception } from "../model/Exception";
import { User, UserRole } from "../model/User";
import assignDefined from "../utils/assignDefined";

export const viewUser = (user: User, currentUser: User | null) => {
  if (
    currentUser &&
    (currentUser.role === UserRole.ADMIN ||
      currentUser.role === UserRole.MODERATOR ||
      currentUser.uid === user.uid)
  )
    return user;

  const { userName, uid, role } = user;
  const returObject = { userName, uid, role } as User;
  if (user.emailPublic) returObject.email = user.email;
  if (user.namePublic) returObject.name = user.name;
  return returObject;
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    let currentUser: User | null = null;
    try {
      const decodedIdToken = await decodeToken(req);
      currentUser = await registerUserIfNotPresent(decodedIdToken);
    } catch (error) {
      console.log(error);
    }

    const allUsers: User[] = [];
    const querySnapshot = await db.collection("users").get();
    querySnapshot.forEach((doc: any) => {
      allUsers.push(viewUser(doc.data(), currentUser));
    });
    return res.status(200).json(allUsers);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const {
    body: { name, userName, role, namePublic, emailPublic },
    params: { userId }
  } = req;

  try {
    try {
      const decodedIdToken = await decodeToken(req);
      const currentUser = await registerUserIfNotPresent(decodedIdToken);

      const isAdmin = currentUser.role === UserRole.ADMIN;
      const isMe = currentUser.uid === userId;
      if (!isAdmin && !isMe)
        return res.status(403).json({
          status: "error",
          message: Exception.AUTH_UNAUTHORIZED_ACTION
        });

      const entry = db.collection("users").doc(userId);
      const currentData = (await entry.get()).data() || {};
      //console.log(currentData);

      const userObject = assignDefined(currentData, {
        name,
        namePublic,
        emailPublic,
        userName,
        role:
          (isAdmin && currentData.role !== UserRole.ADMIN && role) || undefined
      });

      Object.keys(userObject).forEach(
        (key) => userObject[key] === undefined && delete userObject[key]
      );

      /*const userObject = {
        name: name || currentData.name,
        namePublic:
          namePublic ||
          (typeof currentData.namePublic === "boolean"
            ? currentData.namePublic
            : true),
        emailPublic:
          emailPublic ||
          (typeof currentData.emailPublic === "boolean"
            ? currentData.emailPublic
            : true),
        userName: userName || currentData.userName,
        role:
          (isAdmin && currentData.role !== UserRole.ADMIN && role) ||
          currentData.role ||
          UserRole.USER
      };*/

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
