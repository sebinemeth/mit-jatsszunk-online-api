import { Request, Response } from "express";
import { decodeToken, registerUserIfNotPresent } from "../auth";
import { db } from "../config/firebase";
import { Game } from "../model/Game";
import { User } from "../model/User";

export const getAllGames = async (req: Request, res: Response) => {
  try {
    let currentUser: User | null = null;
    try {
      const decodedIdToken = await decodeToken(req);
      currentUser = await registerUserIfNotPresent(decodedIdToken);
    } catch (error) {}

    const allGames: Game[] = [];
    const querySnapshot = await db.collection("games").get();
    querySnapshot.forEach((doc: any) => {
      allGames.push(doc.data());
    });
    return res.status(200).json(allGames);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
