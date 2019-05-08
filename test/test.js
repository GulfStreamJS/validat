const validat = require('../');

describe('Validation', function() {
    describe('#()', function() {
        this.timeout(30000);
        it('validation without error', function (done) {
            validat({
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
                if (params.proxy[0].host === '192.168.0.1') return done();
                else return done('Error!');
            }).catch(error => {
                return done(error);
            });
        });
        it('validation with error', function (done) {
            validat({
                "source": "1CB2ED9B9790616848E217910D30C7C8D364BFFB"
            }).catch(error => {
                if (error.message === 'NO torrent, NO video!') return done();
                return done(error);
            });
        });
    });
});