import * as functions from "firebase-functions";
import * as express from "express";
const cors = require("cors");
import * as users from "./controllers/userController";
import * as games from "./controllers/gameController";

const api = express.Router();
api.use(cors({ origin: "*" }));

api.get("/", (req, res) => res.status(200).send("mitjatsszunk.online api"));

api.get("/users", users.getAllUsers);
api.patch("/users/:userId", users.updateUser);

api.get("/games", games.getAllGames);

const app = express();
app.use("/api", api);
exports.api = functions.https.onRequest(app);
