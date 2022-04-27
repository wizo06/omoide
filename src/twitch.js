const { ApiClient } = require("@twurple/api");
const { ClientCredentialsAuthProvider } = require("@twurple/auth");
const { EventSubListener, ReverseProxyAdapter } = require("@twurple/eventsub");
const { randomUUID } = require("crypto");
const config = require("../config/config.json");

const authProvider = new ClientCredentialsAuthProvider(config.clientId, config.clientSecret);
exports.apiClient = apiClient = new ApiClient({ authProvider });

exports.listener = new EventSubListener({
  apiClient,
  adapter: new ReverseProxyAdapter({ hostName, port }),
  secret: randomUUID(),
  strictHostCheck: true,
});
