const { ApiClient } = require("@twurple/api");
const { ClientCredentialsAuthProvider } = require("@twurple/auth");
const { EventSubListener, ReverseProxyAdapter } = require("@twurple/eventsub");
const { NgrokAdapter } = require("@twurple/eventsub-ngrok");
const { randomUUID } = require("crypto");
const config = require("../config/config.json");
const authProvider = new ClientCredentialsAuthProvider(config.clientId, config.clientSecret);
const apiClient = new ApiClient({ authProvider });

const listener = new EventSubListener({
  apiClient,
  adapter: new ReverseProxyAdapter({ hostName: config.hostName, port: config.port }),
  // adapter: new NgrokAdapter(),
  secret: randomUUID(),
  strictHostCheck: true,
});

module.exports = {
  apiClient,
  listener,
}