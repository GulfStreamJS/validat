const ajv = new (require('ajv'))({removeAdditional: 'all'});

module.exports.input = (params = {}) => {

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
            switch (typeof params[key]) {
                case 'number':
                    params[key] = [params[key].toString()];
                    break;
                case 'object':
                    params[key] = params[key]
                        .map(v => v.toString().replace(/[^0-9]/g, ''))
                        .filter(Boolean);
                    break;
                case 'string':
                    if (/^[0-9]{1,3}$/i.test(params[key])) {
                        params[key] = [params[key]];
                    } else if (/^[0-9]{1,3}-[0-9]{1,3}$/i.test(params[key])) {
                        let [start, finish] = params[key].split('-').map(i => parseInt(i));
                        if (start > finish) [start, finish] = [finish, start];
                        params[key] = [];
                        for (let i = start; i <= finish; i++) {
                            params[key].push(i.toString());
                        }
                    } else if (/^[0-9]{1,3},/i.test(params[key])) {
                        params[key] = params[key]
                            .split(',')
                            .map(v => v.replace(/[^0-9]/g, ''))
                            .filter(Boolean)
                    } else {
                        params[key] = '';
                    }
                    break;
                default:
                    params[key] = '';
            }
        }
    });

    ['tmdb_key', 'imdb_key', 'quality', 'release', 'adult'].forEach(key => {
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
            let metafilm = JSON.parse(params.metafilm);
            params = {...params, ...metafilm};
        } catch (e) {
            params.metafilm = {};
        }
        delete params.metafilm;
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
        require('metator').isto(params.source),
        require('metator').info(params.source)
    ]).then(is => {
        let [video, torrent, info] = is;
        if (!video && !torrent) {
            return Promise.reject({message: 'NO torrent, NO video!', value: params.source});
        }
        if (video && info) {
            params.downloat = info;
        }
        return params;
    }).then(params => {
        let bad = [];
        Object.keys(params).forEach(key => {
            if (params[key] === '') bad.push(key);
        });
        if (bad.length) {
            return Promise.reject({message: 'The parameters is required!', value: bad.join(' | ')});
        }
        return Promise.resolve(params);
    });

};

module.exports.output = (params = {}) => {
    return new Promise((resolve, reject) => {
        let validate = ajv.compile({
            $id: 'gulfstream',
            type: 'object',
            additionalProperties: false,
            required: ['name'],
            anyOf: [
                {required: ['imdb_id']},
                {required: ['tmdb_id']},
                {required: ['kp_id']},
                {required: ['douban_id']}
            ],
            properties: {
                imdb_id: {
                    type: 'string',
                    pattern: '[0-9]{1,11}'
                },
                tmdb_id: {
                    type: 'string',
                    pattern: '[0-9]{1,11}'
                },
                kp_id: {
                    type: 'string',
                    pattern: '[0-9]{1,11}'
                },
                douban_id: {
                    type: 'string',
                    pattern: '[0-9]{1,11}'
                },
                facebook_id: {
                    type: 'string',
                    pattern: '[A-Za-z0-9_\\-.]{1,255}',
                },
                instagram_id: {
                    type: 'string',
                    pattern: '[A-Za-z0-9_\\-.]{1,255}',
                },
                twitter_id: {
                    type: 'string',
                    pattern: '[A-Za-z0-9_\\-.]{1,255}',
                },
                vk_id: {
                    type: 'string',
                    pattern: '[A-Za-z0-9_\\-.]{1,255}',
                },
                name: {
                    type: 'string',
                    maxLength: 1024
                },
                year: {
                    type: 'integer',
                    minimum: 1874,
                    maximum: 2050
                },
                image: {
                    type: 'object',
                    properties: {
                        sm: {
                            type: 'string',
                            format: 'uri',
                            maxLength: 255
                        },
                        md: {
                            type: 'string',
                            format: 'uri',
                            maxLength: 255
                        },
                        lg: {
                            type: 'string',
                            format: 'uri',
                            maxLength: 255
                        },
                        og: {
                            type: 'string',
                            format: 'uri',
                            maxLength: 255
                        }
                    }
                },
                premiere: {
                    type: 'string',
                    format: 'date'
                },
                countries: {
                    type: 'array',
                    items: {
                        type: 'string',
                        enum: ['AF', 'AX', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AQ', 'AG', 'AR', 'AM', 'AW', 'AC', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BM', 'BT', 'BO', 'BA', 'BW', 'BR', 'IO', 'VG', 'BN', 'BG', 'BF', 'BI', 'KH', 'CM', 'CA', 'IC', 'CV', 'BQ', 'KY', 'CF', 'EA', 'TD', 'CL', 'CN', 'CX', 'CC', 'CO', 'KM', 'CG', 'CD', 'CK', 'CR', 'CI', 'HR', 'CU', 'CW', 'CY', 'CZ', 'DK', 'DG', 'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'ET', 'EZ', 'FK', 'FO', 'FJ', 'FI', 'FR', 'GF', 'PF', 'TF', 'GA', 'GM', 'GE', 'DE', 'GH', 'GI', 'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GG', 'GN', 'GW', 'GY', 'HT', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IM', 'IL', 'IT', 'JM', 'JP', 'JE', 'JO', 'KZ', 'KE', 'KI', 'XK', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU', 'MO', 'MK', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MQ', 'MR', 'MU', 'YT', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MS', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NC', 'NZ', 'NI', 'NE', 'NG', 'NU', 'NF', 'KP', 'MP', 'NO', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH', 'PN', 'PL', 'PT', 'PR', 'QA', 'RE', 'RO', 'RU', 'RW', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SX', 'SK', 'SI', 'SB', 'SO', 'ZA', 'GS', 'KR', 'SS', 'ES', 'LK', 'BL', 'SH', 'KN', 'LC', 'MF', 'PM', 'VC', 'SD', 'SR', 'SJ', 'SZ', 'SE', 'CH', 'SY', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TK', 'TO', 'TT', 'TA', 'TN', 'TR', 'TM', 'TC', 'TV', 'UM', 'VI', 'UG', 'UA', 'AE', 'GB', 'UN', 'US', 'UY', 'UZ', 'VU', 'VA', 'VE', 'VN', 'WF', 'EH', 'YE', 'ZM', 'ZW',
                            'AB', 'AA', 'AK', 'SQ', 'AN', 'HY', 'AV', 'AY', 'EU', 'CE', 'ZH', 'CS', 'DA', 'DV', 'EN', 'EO', 'FF', 'LG', 'KA', 'EL', 'HA', 'HE', 'HZ', 'HI', 'HO', 'IG', 'IA', 'IU', 'IK', 'JA', 'JV', 'KL', 'KS', 'KK', 'KV', 'KO', 'KJ', 'KU', 'LO', 'LN', 'GV', 'MI', 'NV', 'ND', 'NB', 'NN', 'NY', 'OC', 'OJ', 'OR', 'OS', 'PI', 'FA', 'QU', 'RM', 'RN', 'II', 'SU', 'SW', 'TY', 'TE', 'TI', 'TS', 'UK', 'UR', 'VO', 'WA', 'FY', 'WO', 'XH', 'YI', 'YO', 'ZU']
                    }
                },
                genres: {
                    type: 'array',
                    items: {
                        type: 'string',
                        enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35']
                    }
                },
                imdb_rating: {
                    type: 'integer',
                    minimum: 0,
                    maximum: 100
                },
                imdb_vote: {
                    type: 'integer',
                    minimum: 0,
                    maximum: 999999999
                },
                tmdb_rating: {
                    type: 'integer',
                    minimum: 0,
                    maximum: 100
                },
                tmdb_vote: {
                    type: 'integer',
                    minimum: 0,
                    maximum: 999999999
                },
                kp_rating: {
                    type: 'integer',
                    minimum: 0,
                    maximum: 100
                },
                kp_vote: {
                    type: 'integer',
                    minimum: 0,
                    maximum: 999999999
                },
                douban_rating: {
                    type: 'integer',
                    minimum: 0,
                    maximum: 100
                },
                douban_vote: {
                    type: 'integer',
                    minimum: 0,
                    maximum: 999999999
                },
                rt_rating: {
                    type: 'integer',
                    minimum: 0,
                    maximum: 100
                },
                metacritic_rating: {
                    type: 'integer',
                    minimum: 0,
                    maximum: 100
                },
                album_id: {
                    type: 'string',
                    pattern: '[0-9]{1,11}'
                },
                translations: {
                    type: 'array',
                    items: {
                        type: 'object',
                        additionalProperties: false,
                        required: ['country', 'language'],
                        anyOf: [
                            {required: ['name']},
                            {required: ['overview']}
                        ],
                        properties: {
                            country: {
                                type: 'string',
                                enum: ['AF', 'AX', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AQ', 'AG', 'AR', 'AM', 'AW', 'AC', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BM', 'BT', 'BO', 'BA', 'BW', 'BR', 'IO', 'VG', 'BN', 'BG', 'BF', 'BI', 'KH', 'CM', 'CA', 'IC', 'CV', 'BQ', 'KY', 'CF', 'EA', 'TD', 'CL', 'CN', 'CX', 'CC', 'CO', 'KM', 'CG', 'CD', 'CK', 'CR', 'CI', 'HR', 'CU', 'CW', 'CY', 'CZ', 'DK', 'DG', 'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'ET', 'EZ', 'FK', 'FO', 'FJ', 'FI', 'FR', 'GF', 'PF', 'TF', 'GA', 'GM', 'GE', 'DE', 'GH', 'GI', 'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GG', 'GN', 'GW', 'GY', 'HT', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IM', 'IL', 'IT', 'JM', 'JP', 'JE', 'JO', 'KZ', 'KE', 'KI', 'XK', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU', 'MO', 'MK', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MQ', 'MR', 'MU', 'YT', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MS', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NC', 'NZ', 'NI', 'NE', 'NG', 'NU', 'NF', 'KP', 'MP', 'NO', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH', 'PN', 'PL', 'PT', 'PR', 'QA', 'RE', 'RO', 'RU', 'RW', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SX', 'SK', 'SI', 'SB', 'SO', 'ZA', 'GS', 'KR', 'SS', 'ES', 'LK', 'BL', 'SH', 'KN', 'LC', 'MF', 'PM', 'VC', 'SD', 'SR', 'SJ', 'SZ', 'SE', 'CH', 'SY', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TK', 'TO', 'TT', 'TA', 'TN', 'TR', 'TM', 'TC', 'TV', 'UM', 'VI', 'UG', 'UA', 'AE', 'GB', 'UN', 'US', 'UY', 'UZ', 'VU', 'VA', 'VE', 'VN', 'WF', 'EH', 'YE', 'ZM', 'ZW',
                                    'AB', 'AA', 'AK', 'SQ', 'AN', 'HY', 'AV', 'AY', 'EU', 'CE', 'ZH', 'CS', 'DA', 'DV', 'EN', 'EO', 'FF', 'LG', 'KA', 'EL', 'HA', 'HE', 'HZ', 'HI', 'HO', 'IG', 'IA', 'IU', 'IK', 'JA', 'JV', 'KL', 'KS', 'KK', 'KV', 'KO', 'KJ', 'KU', 'LO', 'LN', 'GV', 'MI', 'NV', 'ND', 'NB', 'NN', 'NY', 'OC', 'OJ', 'OR', 'OS', 'PI', 'FA', 'QU', 'RM', 'RN', 'II', 'SU', 'SW', 'TY', 'TE', 'TI', 'TS', 'UK', 'UR', 'VO', 'WA', 'FY', 'WO', 'XH', 'YI', 'YO', 'ZU']
                            },
                            language: {
                                type: 'string',
                                enum: ['ab', 'aa', 'af', 'ak', 'sq', 'am', 'ar', 'an', 'hy', 'as', 'av', 'ae', 'ay', 'az', 'bm', 'ba', 'eu', 'be', 'bn', 'bi', 'bs', 'br', 'bg', 'my', 'ca', 'ch', 'ce', 'zh', 'cu', 'cv', 'kw', 'co', 'cr', 'hr', 'cs', 'da', 'dv', 'nl', 'dz', 'en', 'eo', 'et', 'ee', 'fo', 'fj', 'fi', 'fr', 'ff', 'gl', 'lg', 'ka', 'de', 'el', 'gn', 'gu', 'ht', 'ha', 'he', 'hz', 'hi', 'ho', 'hu', 'is', 'io', 'ig', 'id', 'ia', 'ie', 'iu', 'ik', 'ga', 'it', 'ja', 'jv', 'kl', 'kn', 'kr', 'ks', 'kk', 'km', 'ki', 'rw', 'kv', 'kg', 'ko', 'kj', 'ku', 'ky', 'lo', 'la', 'lv', 'li', 'ln', 'lt', 'lu', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'gv', 'mi', 'mr', 'mh', 'mn', 'na', 'nv', 'ng', 'ne', 'nd', 'se', 'no', 'nb', 'nn', 'ny', 'oc', 'oj', 'or', 'om', 'os', 'pi', 'ps', 'fa', 'pl', 'pt', 'pa', 'qu', 'ro', 'rm', 'rn', 'ru', 'sm', 'sg', 'sa', 'sc', 'gd', 'sr', 'sh', 'sn', 'ii', 'sd', 'si', 'sk', 'sl', 'so', 'nr', 'st', 'es', 'su', 'sw', 'ss', 'sv', 'tl', 'ty', 'tg', 'ta', 'tt', 'te', 'th', 'bo', 'ti', 'to', 'ts', 'tn', 'tr', 'tk', 'tw', 'uk', 'ur', 'ug', 'uz', 've', 'vi', 'vo', 'wa', 'cy', 'fy', 'wo', 'xh', 'yi', 'yo', 'za', 'zu']
                            },
                            name: {
                                type: 'string',
                                maxLength: 255
                            },
                            overview: {
                                type: 'string'
                            },
                            poster: {
                                type: 'object',
                                properties: {
                                    sm: {
                                        type: 'string',
                                        format: 'uri',
                                        maxLength: 255
                                    },
                                    md: {
                                        type: 'string',
                                        format: 'uri',
                                        maxLength: 255
                                    },
                                    lg: {
                                        type: 'string',
                                        format: 'uri',
                                        maxLength: 255
                                    },
                                    og: {
                                        type: 'string',
                                        format: 'uri',
                                        maxLength: 255
                                    }
                                }
                            }
                        }
                    }
                },
                people: {
                    type: 'array',
                    items: {
                        type: 'object',
                        additionalProperties: false,
                        required: ['name'],
                        anyOf: [
                            {required: ['imdb_id']},
                            {required: ['tmdb_id']},
                            {required: ['kp_id']},
                            {required: ['douban_id']}
                        ],
                        properties: {
                            imdb_id: {
                                type: 'string',
                                pattern: '[0-9]{1,11}'
                            },
                            tmdb_id: {
                                type: 'string',
                                pattern: '[0-9]{1,11}'
                            },
                            kp_id: {
                                type: 'string',
                                pattern: '[0-9]{1,11}'
                            },
                            douban_id: {
                                type: 'string',
                                pattern: '[0-9]{1,11}'
                            },
                            facebook_id: {
                                type: 'string',
                                pattern: '[A-Za-z0-9_\\-.]{1,255}',
                            },
                            instagram_id: {
                                type: 'string',
                                pattern: '[A-Za-z0-9_\\-.]{1,255}',
                            },
                            twitter_id: {
                                type: 'string',
                                pattern: '[A-Za-z0-9_\\-.]{1,255}',
                            },
                            vk_id: {
                                type: 'string',
                                pattern: '[A-Za-z0-9_\\-.]{1,255}',
                            },
                            name: {
                                type: 'string',
                                maxLength: 1024
                            },
                            birthday: {
                                type: 'string',
                                format: 'date'
                            },
                            deathday: {
                                type: 'string',
                                format: 'date'
                            },
                            gender: {
                                type: 'integer',
                                minimum: 0,
                                maximum: 2,
                            },
                            image: {
                                type: 'object',
                                properties: {
                                    sm: {
                                        type: 'string',
                                        format: 'uri',
                                        maxLength: 255
                                    },
                                    md: {
                                        type: 'string',
                                        format: 'uri',
                                        maxLength: 255
                                    },
                                    lg: {
                                        type: 'string',
                                        format: 'uri',
                                        maxLength: 255
                                    },
                                    og: {
                                        type: 'string',
                                        format: 'uri',
                                        maxLength: 255
                                    }
                                }
                            },
                            translations: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    additionalProperties: false,
                                    required: ['country', 'language'],
                                    anyOf: [
                                        {required: ['name']},
                                        {required: ['overview']}
                                    ],
                                    properties: {
                                        country: {
                                            type: 'string',
                                            enum: ['AF', 'AX', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AQ', 'AG', 'AR', 'AM', 'AW', 'AC', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BM', 'BT', 'BO', 'BA', 'BW', 'BR', 'IO', 'VG', 'BN', 'BG', 'BF', 'BI', 'KH', 'CM', 'CA', 'IC', 'CV', 'BQ', 'KY', 'CF', 'EA', 'TD', 'CL', 'CN', 'CX', 'CC', 'CO', 'KM', 'CG', 'CD', 'CK', 'CR', 'CI', 'HR', 'CU', 'CW', 'CY', 'CZ', 'DK', 'DG', 'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'ET', 'EZ', 'FK', 'FO', 'FJ', 'FI', 'FR', 'GF', 'PF', 'TF', 'GA', 'GM', 'GE', 'DE', 'GH', 'GI', 'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GG', 'GN', 'GW', 'GY', 'HT', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IM', 'IL', 'IT', 'JM', 'JP', 'JE', 'JO', 'KZ', 'KE', 'KI', 'XK', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU', 'MO', 'MK', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MQ', 'MR', 'MU', 'YT', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MS', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NC', 'NZ', 'NI', 'NE', 'NG', 'NU', 'NF', 'KP', 'MP', 'NO', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH', 'PN', 'PL', 'PT', 'PR', 'QA', 'RE', 'RO', 'RU', 'RW', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SX', 'SK', 'SI', 'SB', 'SO', 'ZA', 'GS', 'KR', 'SS', 'ES', 'LK', 'BL', 'SH', 'KN', 'LC', 'MF', 'PM', 'VC', 'SD', 'SR', 'SJ', 'SZ', 'SE', 'CH', 'SY', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TK', 'TO', 'TT', 'TA', 'TN', 'TR', 'TM', 'TC', 'TV', 'UM', 'VI', 'UG', 'UA', 'AE', 'GB', 'UN', 'US', 'UY', 'UZ', 'VU', 'VA', 'VE', 'VN', 'WF', 'EH', 'YE', 'ZM', 'ZW',
                                                'AB', 'AA', 'AK', 'SQ', 'AN', 'HY', 'AV', 'AY', 'EU', 'CE', 'ZH', 'CS', 'DA', 'DV', 'EN', 'EO', 'FF', 'LG', 'KA', 'EL', 'HA', 'HE', 'HZ', 'HI', 'HO', 'IG', 'IA', 'IU', 'IK', 'JA', 'JV', 'KL', 'KS', 'KK', 'KV', 'KO', 'KJ', 'KU', 'LO', 'LN', 'GV', 'MI', 'NV', 'ND', 'NB', 'NN', 'NY', 'OC', 'OJ', 'OR', 'OS', 'PI', 'FA', 'QU', 'RM', 'RN', 'II', 'SU', 'SW', 'TY', 'TE', 'TI', 'TS', 'UK', 'UR', 'VO', 'WA', 'FY', 'WO', 'XH', 'YI', 'YO', 'ZU']
                                        },
                                        language: {
                                            type: 'string',
                                            enum: ['ab', 'aa', 'af', 'ak', 'sq', 'am', 'ar', 'an', 'hy', 'as', 'av', 'ae', 'ay', 'az', 'bm', 'ba', 'eu', 'be', 'bn', 'bi', 'bs', 'br', 'bg', 'my', 'ca', 'ch', 'ce', 'zh', 'cu', 'cv', 'kw', 'co', 'cr', 'hr', 'cs', 'da', 'dv', 'nl', 'dz', 'en', 'eo', 'et', 'ee', 'fo', 'fj', 'fi', 'fr', 'ff', 'gl', 'lg', 'ka', 'de', 'el', 'gn', 'gu', 'ht', 'ha', 'he', 'hz', 'hi', 'ho', 'hu', 'is', 'io', 'ig', 'id', 'ia', 'ie', 'iu', 'ik', 'ga', 'it', 'ja', 'jv', 'kl', 'kn', 'kr', 'ks', 'kk', 'km', 'ki', 'rw', 'kv', 'kg', 'ko', 'kj', 'ku', 'ky', 'lo', 'la', 'lv', 'li', 'ln', 'lt', 'lu', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'gv', 'mi', 'mr', 'mh', 'mn', 'na', 'nv', 'ng', 'ne', 'nd', 'se', 'no', 'nb', 'nn', 'ny', 'oc', 'oj', 'or', 'om', 'os', 'pi', 'ps', 'fa', 'pl', 'pt', 'pa', 'qu', 'ro', 'rm', 'rn', 'ru', 'sm', 'sg', 'sa', 'sc', 'gd', 'sr', 'sh', 'sn', 'ii', 'sd', 'si', 'sk', 'sl', 'so', 'nr', 'st', 'es', 'su', 'sw', 'ss', 'sv', 'tl', 'ty', 'tg', 'ta', 'tt', 'te', 'th', 'bo', 'ti', 'to', 'ts', 'tn', 'tr', 'tk', 'tw', 'uk', 'ur', 'ug', 'uz', 've', 'vi', 'vo', 'wa', 'cy', 'fy', 'wo', 'xh', 'yi', 'yo', 'za', 'zu']
                                        },
                                        name: {
                                            type: 'string',
                                            maxLength: 255
                                        },
                                        overview: {
                                            type: 'string'
                                        }
                                    }
                                }
                            },
                            department: {
                                type: 'string',
                                maxLength: 255
                            },
                            job: {
                                type: 'string',
                                maxLength: 255
                            },
                            character: {
                                type: 'string',
                                maxLength: 255
                            }
                        }
                    }
                },
                video: {
                    type: 'array',
                    minItems: 1,
                    items: {
                        type: 'object',
                        additionalProperties: false,
                        required: ['name', 'file', 'size', 'sha1', 'hosting'],
                        properties: {
                            imdb_id: {
                                type: 'string',
                                pattern: '[0-9]{1,11}'
                            },
                            name: {
                                type: 'string',
                                maxLength: 255
                            },
                            overview: {
                                type: 'string'
                            },
                            image: {
                                type: 'object',
                                properties: {
                                    sm: {
                                        type: 'string',
                                        format: 'uri',
                                        maxLength: 255
                                    },
                                    md: {
                                        type: 'string',
                                        format: 'uri',
                                        maxLength: 255
                                    },
                                    lg: {
                                        type: 'string',
                                        format: 'uri',
                                        maxLength: 255
                                    },
                                    og: {
                                        type: 'string',
                                        format: 'uri',
                                        maxLength: 255
                                    }
                                }
                            },
                            premiere: {
                                type: 'string',
                                format: 'date'
                            },
                            season: {
                                type: 'integer',
                                minimum: 1,
                                maximum: 100
                            },
                            episode: {
                                type: 'integer',
                                minimum: 0,
                                maximum: 9999
                            },
                            imdb_rating: {
                                type: 'integer',
                                minimum: 0,
                                maximum: 100
                            },
                            imdb_vote: {
                                type: 'integer',
                                minimum: 0,
                                maximum: 999999999
                            },
                            tmdb_rating: {
                                type: 'integer',
                                minimum: 0,
                                maximum: 100
                            },
                            tmdb_vote: {
                                type: 'integer',
                                minimum: 0,
                                maximum: 999999999
                            },
                            file: {
                                type: 'string',
                                maxLength: 255
                            },
                            size: {
                                type: 'integer',
                                minimum: 1,
                                maximum: 1e+12
                            },
                            hash: {
                                type: 'string',
                                minLength: 40,
                                maxLength: 40
                            },
                            sha1: {
                                type: 'string',
                                minLength: 40,
                                maxLength: 40
                            },
                            hosting: {
                                type: 'array',
                                minItems: 1,
                                items: {
                                    type: 'object',
                                    required: ['iframe', 'status', 'upload'],
                                    properties: {
                                        iframe: {
                                            type: 'string',
                                            format: 'uri',
                                            maxLength: 255
                                        },
                                        status: {
                                            type: 'integer',
                                            minLength: 100,
                                            maxLength: 999
                                        },
                                        upload: {
                                            type: 'string',
                                            format: 'date-time'
                                        }
                                    }
                                }
                            },
                            quality: {
                                type: 'string',
                                maxLength: 255
                            },
                            release: {
                                type: 'string',
                                maxLength: 255
                            },
                            voice: {
                                type: 'string',
                                enum: ['ab', 'aa', 'af', 'ak', 'sq', 'am', 'ar', 'an', 'hy', 'as', 'av', 'ae', 'ay', 'az', 'bm', 'ba', 'eu', 'be', 'bn', 'bi', 'bs', 'br', 'bg', 'my', 'ca', 'ch', 'ce', 'zh', 'cu', 'cv', 'kw', 'co', 'cr', 'hr', 'cs', 'da', 'dv', 'nl', 'dz', 'en', 'eo', 'et', 'ee', 'fo', 'fj', 'fi', 'fr', 'ff', 'gl', 'lg', 'ka', 'de', 'el', 'gn', 'gu', 'ht', 'ha', 'he', 'hz', 'hi', 'ho', 'hu', 'is', 'io', 'ig', 'id', 'ia', 'ie', 'iu', 'ik', 'ga', 'it', 'ja', 'jv', 'kl', 'kn', 'kr', 'ks', 'kk', 'km', 'ki', 'rw', 'kv', 'kg', 'ko', 'kj', 'ku', 'ky', 'lo', 'la', 'lv', 'li', 'ln', 'lt', 'lu', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'gv', 'mi', 'mr', 'mh', 'mn', 'na', 'nv', 'ng', 'ne', 'nd', 'se', 'no', 'nb', 'nn', 'ny', 'oc', 'oj', 'or', 'om', 'os', 'pi', 'ps', 'fa', 'pl', 'pt', 'pa', 'qu', 'ro', 'rm', 'rn', 'ru', 'sm', 'sg', 'sa', 'sc', 'gd', 'sr', 'sh', 'sn', 'ii', 'sd', 'si', 'sk', 'sl', 'so', 'nr', 'st', 'es', 'su', 'sw', 'ss', 'sv', 'tl', 'ty', 'tg', 'ta', 'tt', 'te', 'th', 'bo', 'ti', 'to', 'ts', 'tn', 'tr', 'tk', 'tw', 'uk', 'ur', 'ug', 'uz', 've', 'vi', 'vo', 'wa', 'cy', 'fy', 'wo', 'xh', 'yi', 'yo', 'za', 'zu']
                            },
                            subtitle: {
                                type: 'string',
                                enum: ['ab', 'aa', 'af', 'ak', 'sq', 'am', 'ar', 'an', 'hy', 'as', 'av', 'ae', 'ay', 'az', 'bm', 'ba', 'eu', 'be', 'bn', 'bi', 'bs', 'br', 'bg', 'my', 'ca', 'ch', 'ce', 'zh', 'cu', 'cv', 'kw', 'co', 'cr', 'hr', 'cs', 'da', 'dv', 'nl', 'dz', 'en', 'eo', 'et', 'ee', 'fo', 'fj', 'fi', 'fr', 'ff', 'gl', 'lg', 'ka', 'de', 'el', 'gn', 'gu', 'ht', 'ha', 'he', 'hz', 'hi', 'ho', 'hu', 'is', 'io', 'ig', 'id', 'ia', 'ie', 'iu', 'ik', 'ga', 'it', 'ja', 'jv', 'kl', 'kn', 'kr', 'ks', 'kk', 'km', 'ki', 'rw', 'kv', 'kg', 'ko', 'kj', 'ku', 'ky', 'lo', 'la', 'lv', 'li', 'ln', 'lt', 'lu', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'gv', 'mi', 'mr', 'mh', 'mn', 'na', 'nv', 'ng', 'ne', 'nd', 'se', 'no', 'nb', 'nn', 'ny', 'oc', 'oj', 'or', 'om', 'os', 'pi', 'ps', 'fa', 'pl', 'pt', 'pa', 'qu', 'ro', 'rm', 'rn', 'ru', 'sm', 'sg', 'sa', 'sc', 'gd', 'sr', 'sh', 'sn', 'ii', 'sd', 'si', 'sk', 'sl', 'so', 'nr', 'st', 'es', 'su', 'sw', 'ss', 'sv', 'tl', 'ty', 'tg', 'ta', 'tt', 'te', 'th', 'bo', 'ti', 'to', 'ts', 'tn', 'tr', 'tk', 'tw', 'uk', 'ur', 'ug', 'uz', 've', 'vi', 'vo', 'wa', 'cy', 'fy', 'wo', 'xh', 'yi', 'yo', 'za', 'zu']
                            }
                        }
                    }
                }
            }
        });
        let valid = validate(params);
        if (valid) {
            return resolve(params);
        } else {
            let errors = validate.errors;
            return reject({
                errors
            });
        }
    });
};