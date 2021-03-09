import { Request, Response } from "express";
import { getUser } from "./auth";
import { admin, db } from "./config/firebase";
import { User, UserFactory, UserRole } from "./model/User";

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

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const decodedIdToken: admin.auth.DecodedIdToken | null = await getUser(req);
    let user: User | null = null;
    if (decodedIdToken) {
      const userRef = db.collection("users").doc(decodedIdToken.uid);
      if ((await userRef.get()).exists)
        user = (await userRef.get()).data() as User;
    }

    const allUsers: User[] = [];
    const querySnapshot = await db.collection("users").get();
    querySnapshot.forEach((doc: any) => {
      let data = doc.data();
      if (
        !user ||
        (user.role !== UserRole.ADMIN && user.uid !== doc.data().uid)
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

  const decodedIdToken: admin.auth.DecodedIdToken | null = await getUser(req);
  let currentUser: User | null = null;
  if (decodedIdToken) {
    const userRef = db.collection("users").doc(decodedIdToken.uid);
    if ((await userRef.get()).exists)
      currentUser = (await userRef.get()).data() as User;
  }

  console.log(decodedIdToken, currentUser);

  try {
    if (
      !currentUser ||
      currentUser.role !== UserRole.ADMIN ||
      currentUser.uid !== userId
    )
      return res.status(403).send();

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
    return res.status(500).json(error.message);
  }
};
