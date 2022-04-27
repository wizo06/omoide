const { Logger } = require("@wizo06/logger");
const express = require("express");
const app = express();
const logger = new Logger();
const { db } = require("./firestore.js");
const { form, success, failure } = require("./html.js");
const { apiClient } = require("./twitch.js");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  try {
    logger.info(req.body);
    const user = await apiClient.users.getUserByName(req.body.cname);
    if (!user) return res.end(failure);
    await db.collection("channels").doc(user.id).set({ name: user.name });
    res.end(success);
  } catch (e) {
    logger.error(e);
    res.end(failure);
  }
});

app.get("/", (req, res) => {
  res.end(form);
});

app.listen(50059, () => logger.success(`Express server listening on port 50059`));
