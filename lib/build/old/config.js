"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./helpers/errors");
const utils_1 = require("./helpers/utils");
// TODO: have all types in one file ideally.. easier to navigate and maintain. call this file types. This is done so that the other files do not get bogged down with types.. and have just the logic.
/**
 * @class
 */
class Config {
    constructor(config) {
        this.config = sanitize(config);
    }
    static set(config) {
        validate(config);
        if (Config.instance === undefined) {
            Config.instance = new Config(config);
        }
    }
    // NOTE: wherever you have used this, remember that this can throw an error.
    static get() {
        if (Config.instance === undefined) {
            throw errors_1.ConfigErrors.configNotSet;
        }
        return Config.instance.config;
    }
}
exports.Config = Config;
const validate = (config) => {
    const mysqlInputConfig = config.mysql;
    if (typeof mysqlInputConfig !== "object") {
        throw errors_1.ConfigErrors.mysql.configUndefined;
    }
    const host = utils_1.sanitizeStringInput(mysqlInputConfig.host);
    const port = utils_1.sanitizeNumberInput(mysqlInputConfig.port);
    const user = utils_1.sanitizeStringInput(mysqlInputConfig.user);
    if (user === undefined) {
        throw errors_1.ConfigErrors.mysql.userNotPassed;
    }
    const password = utils_1.sanitizeStringInput(mysqlInputConfig.password);
    if (password === undefined) {
        throw errors_1.ConfigErrors.mysql.passwordNotPassed;
    }
    const connectionLimit = utils_1.sanitizeNumberInput(mysqlInputConfig.connectionLimit);
    const database = utils_1.sanitizeStringInput(mysqlInputConfig.database);
    if (database === undefined) {
        throw errors_1.ConfigErrors.mysql.databaseNotPassed;
    }
    let tables;
    const tablesMysqlInputConfig = mysqlInputConfig.tables;
    if (tablesMysqlInputConfig !== undefined) {
        const signingKey = utils_1.sanitizeStringInput(tablesMysqlInputConfig.signingKey);
        const refreshTokens = utils_1.sanitizeStringInput(tablesMysqlInputConfig.refreshTokens);
        tables = {
            signingKey,
            refreshTokens
        };
    }
    const mysql = {
        host,
        port,
        user,
        password,
        connectionLimit,
        database,
        tables
    };
    let tokensInputConfig = config.tokens;
    const accessTokenInputConfig = tokensInputConfig.accessToken;
    let accessToken;
    if (accessTokenInputConfig !== undefined) {
        const signingKeyInputConfig = accessTokenInputConfig.signingKey;
        let signingKey;
        if (signingKeyInputConfig !== undefined) {
            const dynamic = utils_1.sanitizeBooleanInput(signingKeyInputConfig.dynamic);
            let updateInterval = utils_1.sanitizeNumberInput(signingKeyInputConfig.updateInterval);
            if (updateInterval !== undefined) {
                if (updateInterval > defaultConfig.tokens.accessToken.signingKey.updateInterval.max) {
                    throw errors_1.ConfigErrors.tokens.accessToken.signingKey.updateIntervalNotWithinAllowedInterval;
                }
                else if (updateInterval < defaultConfig.tokens.accessToken.signingKey.updateInterval.min) {
                    throw errors_1.ConfigErrors.tokens.accessToken.signingKey.updateIntervalNotWithinAllowedInterval;
                }
            }
            const get = signingKeyInputConfig.get;
            if (get !== undefined && typeof get !== "function") {
                throw errors_1.ConfigErrors.tokens.accessToken.signingKey.valuePassedInGetANotFunction;
            }
            signingKey = {
                dynamic,
                updateInterval,
                get
            };
        }
        let validity = utils_1.sanitizeNumberInput(accessTokenInputConfig.validity);
        if (validity !== undefined) {
            if (validity > defaultConfig.tokens.accessToken.validity.max) {
                throw errors_1.ConfigErrors.tokens.accessToken.validityNotWithinAllowedInterval;
            }
            else if (validity < defaultConfig.tokens.accessToken.validity.min) {
                throw errors_1.ConfigErrors.tokens.accessToken.validityNotWithinAllowedInterval;
            }
        }
        accessToken = {
            signingKey,
            validity
        };
    }
    let refreshTokenInputConfig = tokensInputConfig.refreshToken;
    if (typeof refreshTokenInputConfig !== "object") {
        throw errors_1.ConfigErrors.tokens.refreshToken.configUndefined;
    }
    let validity = utils_1.sanitizeNumberInput(refreshTokenInputConfig.validity);
    if (validity !== undefined) {
        if (validity > defaultConfig.tokens.refreshToken.validity.max) {
            throw errors_1.ConfigErrors.tokens.refreshToken.validityNotWithinAllowedInterval;
        }
        else if (validity < defaultConfig.tokens.refreshToken.validity.min) {
            throw errors_1.ConfigErrors.tokens.refreshToken.validityNotWithinAllowedInterval;
        }
    }
    const renewTokenURL = utils_1.sanitizeStringInput(refreshTokenInputConfig.renewTokenURL);
    if (renewTokenURL === undefined) {
        throw errors_1.ConfigErrors.tokens.refreshToken.renewTokenURLNotPassed;
    }
    const refreshToken = {
        renewTokenURL,
        validity
    };
    const tokens = {
        accessToken,
        refreshToken
    };
    let loggingInputConfig = config.logging;
    let logging;
    if (loggingInputConfig !== undefined) {
        let info = loggingInputConfig.info;
        let error = loggingInputConfig.error;
        if (info !== undefined && typeof info !== "function") {
            throw errors_1.ConfigErrors.logging.infoFunctionError;
        }
        if (error !== undefined && typeof error !== "function") {
            throw errors_1.ConfigErrors.logging.errorFunctionError;
        }
        logging = {
            info,
            error
        };
    }
    const cookieInputConfig = config.cookie;
    const domain = utils_1.sanitizeStringInput(cookieInputConfig.domain);
    const secure = utils_1.sanitizeBooleanInput(cookieInputConfig.secure);
    if (domain === undefined) {
        throw errors_1.ConfigErrors.cookie.cookieDomainUndefined;
    }
    const cookie = {
        domain,
        secure
    };
    const securityInputConfig = config.security;
    let security;
    if (securityInputConfig !== undefined) {
        const onTheftDetection = securityInputConfig.onTheftDetection;
        if (onTheftDetection !== undefined && typeof onTheftDetection !== "function") {
            throw errors_1.ConfigErrors.security.onTheftDetectionFunctionError;
        }
        security = {
            onTheftDetection
        };
    }
    return {
        mysql,
        tokens,
        cookie,
        logging,
        security
    };
};
const sanitize = (config) => {
    // TODO: do not do this style.. check for explicit undefined... what is something is number | undefined and that person gives 0 as a number.. then its as good as false. Or an empty string???
    return {
        mysql: {
            host: config.mysql.host || defaultConfig.mysql.host,
            port: config.mysql.port || defaultConfig.mysql.port,
            user: config.mysql.user,
            password: config.mysql.password,
            connectionLimit: config.mysql.connectionLimit || defaultConfig.mysql.connectionLimit,
            database: config.mysql.database,
            tables: config.mysql.tables === undefined ? defaultConfig.mysql.tables : {
                refreshTokens: config.mysql.tables.refreshTokens || defaultConfig.mysql.tables.refreshTokens,
                signingKey: config.mysql.tables.signingKey || defaultConfig.mysql.tables.signingKey
            }
        },
        tokens: {
            accessToken: config.tokens.accessToken === undefined ? {
                signingKey: {
                    dynamic: defaultConfig.tokens.accessToken.signingKey.dynamic,
                    updateInterval: defaultConfig.tokens.accessToken.signingKey.updateInterval.default * 60 * 60 * 1000,
                    get: undefined
                },
                validity: defaultConfig.tokens.accessToken.validity.default * 1000
            } : {
                signingKey: config.tokens.accessToken.signingKey === undefined ? {
                    dynamic: defaultConfig.tokens.accessToken.signingKey.dynamic,
                    updateInterval: defaultConfig.tokens.accessToken.signingKey.updateInterval.default,
                    get: undefined
                } : {
                    dynamic: config.tokens.accessToken.signingKey.dynamic === undefined ? defaultConfig.tokens.accessToken.signingKey.dynamic : config.tokens.accessToken.signingKey.dynamic,
                    updateInterval: (config.tokens.accessToken.signingKey.updateInterval || defaultConfig.tokens.accessToken.signingKey.updateInterval.default) * 60 * 60 * 1000,
                    get: config.tokens.accessToken.signingKey.get
                },
                validity: (config.tokens.accessToken.validity || defaultConfig.tokens.accessToken.validity.default) * 1000
            },
            refreshToken: {
                validity: (config.tokens.refreshToken.validity || defaultConfig.tokens.refreshToken.validity.default) * 60 * 60 * 1000,
                renewTokenURL: config.tokens.refreshToken.renewTokenURL
            }
        },
        cookie: {
            secure: config.cookie.secure === undefined ? defaultConfig.cookie.secure : config.cookie.secure,
            domain: config.cookie.domain,
            accessTokenCookieKey: defaultConfig.cookie.accessTokenCookieKey,
            refreshTokenCookieKey: defaultConfig.cookie.refreshTokenCookieKey,
            idRefreshTokenCookieKey: defaultConfig.cookie.idRefreshTokenCookieKey
        },
        logging: {
            info: config.logging !== undefined ? config.logging.info : undefined,
            error: config.logging !== undefined ? config.logging.error : undefined
        },
        security: {
            onTheftDetection: config.security !== undefined ? config.security.onTheftDetection : undefined
        }
    };
};
const defaultConfig = {
    mysql: {
        host: "localhost",
        port: 3306,
        connectionLimit: 50,
        tables: {
            signingKey: "signing_key",
            refreshTokens: "refresh_token"
        }
    },
    tokens: {
        accessToken: {
            signingKey: {
                dynamic: false,
                updateInterval: {
                    min: 1,
                    max: 720,
                    default: 24
                }
            },
            validity: {
                min: 10,
                max: 1000 * 24 * 3600,
                default: 3600
            }
        },
        refreshToken: {
            validity: {
                min: 1,
                max: 365 * 24,
                default: 100 * 24
            }
        }
    },
    cookie: {
        secure: true,
        accessTokenCookieKey: "sAccessToken",
        refreshTokenCookieKey: "sRefreshToken",
        idRefreshTokenCookieKey: "sIdRefreshToken"
    }
};
//# sourceMappingURL=config.js.map