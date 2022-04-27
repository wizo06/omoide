const { Logger } = require("@wizo06/logger");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { listener, apiClient } = require("./twitch.js");
const { db } = require("./firestore.js");
const config = require("../config/config.json");

const logger = new Logger();

const eventHandler = async (event) => {
  try {
    logger.info(`${event.broadcasterName} went offline`);
    const vods = await apiClient.videos.getVideosByUser(event.broadcasterId, { type: "archive" });
    for (const vod of vods?.data) {
      const doc = await db.collection("captured").doc(vod.id).get();
      if (!doc.exists) {
        const d = new Date(vod.creationDate);
        const month = d.getMonth() + 1 < 10 ? `0${d.getMonth + 1}` : d.getMonth() + 1;
        const date = d.getDate() < 10 ? `0${d.getDate}` : d.getDate();
        const timestamp = `${d.getFullYear}${month}${date}`;
        await db.collection("captured").doc(vod.id).set({
          creationDate: timestamp,
          title: vod.title,
          url: vod.url,
          userId: vod.userId,
          userName: vod.userName,
        });
        await fetch(config.webhook, {
          method: "POST",
          body: JSON.stringify({
            content: `${timestamp}_${vod.id}_${vod.title} ${vod.url}`,
          }),
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  } catch (e) {
    logger.error(e);
  }
};

(async () => {
  try {
    await apiClient.eventSub.deleteAllSubscriptions();

    await listener.listen();

    db.collection("channels").onSnapshot((querySnapshot) => {
      querySnapshot.docChanges().forEach(async (change) => {
        try {
          if (change.type === "added") {
            await listener.subscribeToStreamOfflineEvents(change.doc.id, async (event) => {
              try {
                logger.info(`${event.broadcasterName} went offline`);
                const vods = await apiClient.videos.getVideosByUser(event.broadcasterId, { type: "archive" });
                for (const vod of vods?.data) {
                  const doc = await db.collection("captured").doc(vod.id).get();
                  if (!doc.exists) {
                    logger.info(`Uncaptured vod found: ${vod.creationDate} ${vod.id} ${vod.title} ${vod.userId} ${vod.userName}`)
                    const d = new Date(vod.creationDate);
                    const month = d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
                    const date = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
                    const timestamp = `${d.getFullYear()}${month}${date}`;
                    await db.collection("captured").doc(vod.id).set({
                      creationDate: timestamp,
                      title: vod.title,
                      url: vod.url,
                      userId: vod.userId,
                      userName: vod.userName,
                    });
                    await fetch(config.webhook, {
                      method: "POST",
                      body: JSON.stringify({
                        content: `${timestamp}_${vod.id}_${vod.title} ${vod.url}`,
                      }),
                      headers: { "Content-Type": "application/json" },
                    });
                  }
                }
              } catch (e) {
                logger.error(e);
              }
            });
            logger.success(`Listening to offline events from ${change.doc.data().name}`);

            return;
          }
          if (change.type === "modified") {
            return;
          }
          if (change.type === "removed") {
            return;
          }
        } catch (e) {
          logger.error(e);
        }
      });
    });
  } catch (e) {
    logger.error(e);
  }
})();
