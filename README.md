## What is `validat`?

Validation of input parameters in the GulfStream package.

## Installation

```bash
npm i validat
```

## Usage

Import the library in your code:

```js
const validat = require('validat');
```

### Validation input params

```js
validat.input({
    "source": "3652DB1AFBC5D414DBCAF5920F741FF93B1ED9E5",
    "imdb_id": "0944947",
    "tmdb_id": 1399,
    "douban_id": 26584183,
    "kp_id": "464963",
    "tmdb_key": "e547e17d4e91c3e62a571656cd1ccaff",
    "imdb_key": "966f4f4f",
    "voice": "en",
    "subtitle": "it",
    "season": "1",
    "episode": "1-5",
    "quality": "1080p",
    "release": "HBO",
    "proxy": "login:pass@192.168.0.1:80," +
        "login:pass@192.168.0.2:8080",
    "adult": "The video title",
    "oauth": "{\"login\":\"user\"}",
    "metafilm": "{\"name\":\"Title\"}"
}).then(params => {
    console.log(params);
});
//{ source: '3652DB1AFBC5D414DBCAF5920F741FF93B1ED9E5',
//  imdb_id: '0944947',
//  tmdb_id: '1399',
//  douban_id: '26584183',
//  kp_id: '464963',
//  tmdb_key: 'e547e17d4e91c3e62a571656cd1ccaff',
//  imdb_key: '966f4f4f',
//  voice: 'en',
//  subtitle: 'it',
//  season: '1',
//  episode: [ '1', '2', '3', '4', '5' ],
//  quality: '1080p',
//  release: 'HBO',
//  proxy:
//   [ { host: '192.168.0.1', port: '80', auth: {
//      username: 'login', password: 'pass'
//   } },
//     { host: '192.168.0.2', port: '8080', auth: {
//      username: 'login', password: 'pass'
//   } } ],
//  adult: 'The video title',
//  oauth: { login: 'user' },
//  metafilm: { name: 'Title' } }
```

### Validation output params

```js
validat.output({
    "imdb_id": "4688388",
    "name": "Hello World",
    "otherKey": "otherValue"
}).then(params => {
    console.log(params);
});
//{ imdb_id: '4688388',
//  name: 'Hello World' }
```

## Running tests

```bash
npm test
```