Put secret game folders in here (same way projects/ and new-games/ work),
e.g. secret-games/my-game/index.html

Then add an entry for it in config/secret-games.json, for example:

{
  "link": "secret-games/my-game/index.html",
  "imgSrc": "secret-games/my-game/thumb.png",
  "title": "My Game"
}

These entries only show up on /games.html once you unlock /secret.html
with the code, and only for games listed in config/secret-games.json.
