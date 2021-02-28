import * as functions from "firebase-functions";
import * as express from "express";
import { addEntry } from "./entryController";

const api = express.Router();

api.get("/", (req, res) => res.status(200).send("mitjatsszunk.online api"));
api.post("/entries", addEntry);

const app = express();
app.use("/api", api);
exports.api = functions.https.onRequest(app);
