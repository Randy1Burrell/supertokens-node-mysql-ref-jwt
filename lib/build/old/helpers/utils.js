"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validator = require("validator");
const crypto_1 = require("crypto");
const logging_1 = require("./logging");
const errors_1 = require("./errors");
/**
 *
 * @param stringText
 */
function checkIfStringIsJSONObj(stringText) {
    try {
        let result = JSON.parse(stringText);
        return result !== null && typeof (result) === "object";
    }
    catch (err) {
        return false;
    }
}
exports.checkIfStringIsJSONObj = checkIfStringIsJSONObj;
/**
 *
 * @param field
 */
function sanitizeStringInput(field) {
    if (field === "") {
        return "";
    }
    if (typeof field !== "string") {
        return undefined;
    }
    try {
        let result = validator.trim(field);
        return result;
    }
    catch (err) {
        logging_1.errorLogging(err);
    }
    return undefined;
}
exports.sanitizeStringInput = sanitizeStringInput;
/**
 *
 * @param field
 */
function sanitizeNumberInput(field) {
    if (typeof field === "number") {
        return field;
    }
    if (typeof field !== "string") {
        return undefined;
    }
    try {
        let result = Number(validator.trim(field));
        if (isNaN(result)) {
            return undefined;
        }
        return result;
    }
    catch (err) {
        logging_1.errorLogging(err);
    }
    return undefined;
}
exports.sanitizeNumberInput = sanitizeNumberInput;
/**
 *
 * @param field
 */
function sanitizeBooleanInput(field) {
    if (field === true || field === false) {
        return field;
    }
    if (field === "false") {
        return false;
    }
    if (field === "true") {
        return true;
    }
    return undefined;
}
exports.sanitizeBooleanInput = sanitizeBooleanInput;
/**
 *
 * @param metaInfo
 */
function validateJSONObj(jsonObj) {
    if (jsonObj === undefined) {
        jsonObj = {};
    }
    if (jsonObj === null || typeof jsonObj !== "object") {
        throw errors_1.MiscellaneousErrors.invalidJSON;
    }
    return jsonObj;
}
exports.validateJSONObj = validateJSONObj;
/**
 *
 * @param jsonObj
 */
function serializeMetaInfoToString(metaInfo) {
    return JSON.stringify(validateJSONObj(metaInfo));
}
exports.serializeMetaInfoToString = serializeMetaInfoToString;
// TODO: dont just use date.now()!! use something more. add more randomness!!! What is the context of using these? for keys, md5 is unacceptable!
/**
 *
 */
function generate32CharactersRandomString() {
    return crypto_1.createHash("md5").update(Date.now().toString() + crypto_1.randomBytes(8)).digest("hex");
}
exports.generate32CharactersRandomString = generate32CharactersRandomString;
/**
 *
 * @param stringText
 */
function hash(stringText) {
    return crypto_1.createHash("sha256").update(stringText).digest("hex");
}
exports.hash = hash;
/**
 *
 */
function generate44ChararctersRandomString() {
    return crypto_1.createHash("sha256").update(crypto_1.randomBytes(64)).digest("base64").toString();
}
exports.generate44ChararctersRandomString = generate44ChararctersRandomString;
/**
 *
 */
function generateNewKey() {
    return new Promise((resolve, reject) => {
        crypto_1.pbkdf2(crypto_1.randomBytes(64), crypto_1.randomBytes(64), 100, 32, 'sha512', (err, i) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(i.toString("base64"));
        });
    });
}
exports.generateNewKey = generateNewKey;
/**
 *
 * @param userId
 */
function checkUserIdContainsNoDot(userId) {
    return userId.split(".").length === 1;
}
exports.checkUserIdContainsNoDot = checkUserIdContainsNoDot;
//# sourceMappingURL=utils.js.map