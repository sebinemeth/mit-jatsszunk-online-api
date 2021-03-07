import * as functions from "firebase-functions";
import * as express from "express";
import {
  addEntry,
  getAllEntries,
  updateEntry,
  deleteEntry
} from "./entryController";
import * as users from "./userController";

const api = express.Router();

api.get("/", (req, res) => res.status(200).send("mitjatsszunk.online api"));
api.post("/entries", addEntry);
api.get("/entries", getAllEntries);
api.patch("/entries/:entryId", updateEntry);
api.delete("/entries/:entryId", deleteEntry);

api.get("/users/me", users.getMe);

const app = express();
app.use("/api", api);
exports.api = functions.https.onRequest(app);
