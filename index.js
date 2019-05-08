module.exports = params => {

    let languages = ['ab', 'aa', 'af', 'ak', 'sq', 'am', 'ar', 'an', 'hy', 'as', 'av', 'ae', 'ay', 'az', 'bm', 'ba', 'eu', 'be', 'bn', 'bi', 'bs', 'br', 'bg', 'my', 'ca', 'ch', 'ce', 'zh', 'cu', 'cv', 'kw', 'co', 'cr', 'hr', 'cs', 'da', 'dv', 'nl', 'dz', 'en', 'eo', 'et', 'ee', 'fo', 'fj', 'fi', 'fr', 'ff', 'gl', 'lg', 'ka', 'de', 'el', 'gn', 'gu', 'ht', 'ha', 'he', 'hz', 'hi', 'ho', 'hu', 'is', 'io', 'ig', 'id', 'ia', 'ie', 'iu', 'ik', 'ga', 'it', 'ja', 'jv', 'kl', 'kn', 'kr', 'ks', 'kk', 'km', 'ki', 'rw', 'kv', 'kg', 'ko', 'kj', 'ku', 'ky', 'lo', 'la', 'lv', 'li', 'ln', 'lt', 'lu', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'gv', 'mi', 'mr', 'mh', 'mn', 'na', 'nv', 'ng', 'ne', 'nd', 'se', 'no', 'nb', 'nn', 'ny', 'oc', 'oj', 'or', 'om', 'os', 'pi', 'ps', 'fa', 'pl', 'pt', 'pa', 'qu', 'ro', 'rm', 'rn', 'ru', 'sm', 'sg', 'sa', 'sc', 'gd', 'sr', 'sh', 'sn', 'ii', 'sd', 'si', 'sk', 'sl', 'so', 'nr', 'st', 'es', 'su', 'sw', 'ss', 'sv', 'tl', 'ty', 'tg', 'ta', 'tt', 'te', 'th', 'bo', 'ti', 'to', 'ts', 'tn', 'tr', 'tk', 'tw', 'uk', 'ur', 'ug', 'uz', 've', 'vi', 'vo', 'wa', 'cy', 'fy', 'wo', 'xh', 'yi', 'yo', 'za', 'zu'];

    ['kp_id', 'tmdb_id', 'imdb_id', 'douban_id'].forEach(key => {
        if (typeof params[key] !== 'undefined') {
            params[key] = (params[key]).toString();
            params[key] = params[key]
                .replace(/[^0-9]/ig, '');
            params[key] = params[key].length <= 11
                ? params[key]
                : '';
        }
    });

    ['voice', 'subtitle'].forEach(key => {
        if (typeof params[key] !== 'undefined') {
            params[key] = (params[key]).toString().toLowerCase();
            params[key] = params[key].replace(/[^a-z]/ig, '');
            params[key] = languages.indexOf(params[key]) + 1
                ? params[key]
                : '';
        }
    });

    ['season', 'episode'].forEach(key => {
        if (typeof params[key] !== 'undefined') {
            params[key] = (params[key]).toString();
            if (/^[0-9]{1,3}$/i.test(params[key])) {
                params[key] = params[key];
            } else if (/^[0-9]{1,3}-[0-9]{1,3}$/i.test(params[key])) {
                let [start, finish] = params[key].split('-').map(i => parseInt(i));
                if (start > finish) [start, finish] = [finish, start];
                params[key] = [];
                for (let i = start; i <= finish; i++) {
                    params[key].push(i.toString());
                }
            } else {
                params[key] = '';
            }
        }
    });

    ['tmdb_key', 'imdb_key', 'quality', 'release', 'proxy', 'adult'].forEach(key => {
        if (typeof params[key] !== 'undefined') {
            params[key] = (params[key]).toString();
            params[key] = params[key]
                .replace(/\s+/g, ' ')
                .replace(/(^\s*)|(\s*)$/g, '');
        }
    });

    if (typeof params.oauth !== 'undefined') {
        params.oauth = (params.oauth).toString();
        try {
            params.oauth = JSON.parse(params.oauth);
        } catch (e) {
            params.oauth = '';
        }
    }

    if (typeof params.metafilm !== 'undefined') {
        params.metafilm = (params.metafilm).toString();
        try {
            params.metafilm = JSON.parse(params.metafilm);
        } catch (e) {
            params.metafilm = {};
        }
    }

    if (typeof params.proxy !== 'undefined') {
        params.proxy = (params.proxy).toString();
        params.proxy = params.proxy.split(',');
        params.proxy.forEach((proxy, i) => {
            if (params.proxy[i].indexOf('@') + 1) {
                let at = params.proxy[i].split('@');
                params.proxy[i] = {
                    host: (at[1]).split(':')[0],
                    port: (at[1]).split(':')[1],
                    auth: {
                        username: (at[0]).split(':')[0],
                        password: (at[0]).split(':')[1]
                    }
                };
            } else if (params.proxy[i].indexOf(':') + 1) {
                let colon = params.proxy[i].split(':');
                params.proxy[i] = {
                    host: colon[0],
                    port: colon[1]
                };
            } else {
                params.proxy[i] = '';
            }
        });
    }

    return Promise.all([
        require('metator').isvi(params.source),
        require('metator').isto(params.source)
    ]).then(is => {
        let [video, torrent] = is;
        if (!video && !torrent) {
            return Promise.reject({message: 'NO torrent, NO video!', value: params.source});
        }
        return params;
    }).then(params => {
        let bad = [];
        Object.keys(params).forEach(key => {
            if (params[key] === '') bad.push(key);
        });
        if (bad.length) {
            return Promise.reject({message: 'Bad data!', value: bad.join(' | ')});
        }
        return Promise.resolve(params);
    });

};