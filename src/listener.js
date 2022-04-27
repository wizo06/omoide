const { Logger } = require("@wizo06/logger");
const { listener, apiClient } = require("./twitch.js");
const { db } = require("./firestore.js");

const logger = new Logger();

(async () => {
  try {
    await apiClient.eventSub.deleteAllSubscriptions();

    await listener.listen();

    db.collection("channels").onSnapshot((querySnapshot) => {
      querySnapshot.docChanges().forEach(async (change) => {
        try {
          if (change.type === "added") {
            await listener.subscribeToStreamOfflineEvents(change.doc.id, async (event) => {
              const vods = await apiClient.videos.getVideosByUser(change.doc.id, { type: "archive" });
              if (vods?.data[0]?.url) {
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
