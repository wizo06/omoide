# twitch-archiver
```
cp config/template.toml config/config.toml
npm i
```
To get the user id of a channel, go to the respective stream and check for `gql` under Network tab of DevTools.

# Local development
```
npm run listener-dev
npm run downloader
```

# Production
```
npm run listener
npm run downloader
```
In a production environment, this repo assumes that a reverse proxy is setup already, and it's pointing to localhost with port `port` from the config file.

# Limits
[https://dev.twitch.tv/docs/eventsub](https://dev.twitch.tv/docs/eventsub)

> The maximum number of subscriptions you can create grows as users authorize your application. Here’s how it works:
>
> - There is a limit of 3 subscriptions with the same `type` and `condition` values.
> - Subscriptions that require a user to authorize your application have zero cost (e.g., `channel.subscribe`).
> - Subscriptions that take a user in their condition, but do not require that user to authorize your application (e.g., `channel.follow`, `channel.update`), have a cost unless that user has authorized your application (i.e., you have an OAuth scope for that user).

---

This repo does not implement any user authorization, therefore the `userIds` array from the config file is limited to 3 channels.