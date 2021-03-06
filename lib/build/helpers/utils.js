"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const uuid = require("uuid");
const validator = require("validator");
/**
 * number of iterations is 32 here. To make this "more random", increase this value. But know that doing so will increase the amount of time it takes to generate a key.
 */
function generateNewSigningKey() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new Promise((resolve, reject) => {
            crypto_1.pbkdf2(crypto_1.randomBytes(64), crypto_1.randomBytes(64), 100, 32, "sha512", (err, key) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(key.toString("base64"));
            });
        });
    });
}
exports.generateNewSigningKey = generateNewSigningKey;
function generateUUID() {
    return uuid.v1();
}
exports.generateUUID = generateUUID;
function hash(toHash) {
    return crypto_1.createHash("sha256").update(toHash).digest("hex");
}
exports.hash = hash;
function hmac(text, key) {
    const hashFunction = crypto_1.createHmac("sha256", key);
    return hashFunction.update(text).digest("hex");
}
exports.hmac = hmac;
/**
 * Encrypts text by given key
 * @param text text to encrypt
 * @param masterKey key used to encrypt
 * @returns String encrypted text, base64 encoded
 */
function encrypt(text, masterkey) {
    return __awaiter(this, void 0, void 0, function* () {
        // random initialization vector
        const iv = crypto_1.randomBytes(16);
        // random salt
        const salt = crypto_1.randomBytes(64);
        // derive encryption key: 32 byte key length
        // in assumption the masterkey is a cryptographic and NOT a password there is no need for
        // a large number of iterations. It may can replaced by HKDF
        // the value of 2145 is randomly chosen!
        const key = yield new Promise((resolve, reject) => {
            crypto_1.pbkdf2(masterkey, salt, 100, 32, "sha512", (err, key) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(key);
            });
        });
        // AES 256 GCM Mode
        const cipher = crypto_1.createCipheriv('aes-256-gcm', key, iv);
        // encrypt the given text
        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        // extract the auth tag
        const tag = cipher.getAuthTag();
        // generate output
        return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
    });
}
exports.encrypt = encrypt;
/**
 * Decrypts text by given key
 * @param encdata base64 encoded input data
 * @param masterkey key used to decrypt
 * @returns String decrypted (original) text
 */
function decrypt(encdata, masterkey) {
    return __awaiter(this, void 0, void 0, function* () {
        // base64 decoding
        const bData = Buffer.from(encdata, 'base64');
        // convert data to buffers
        const salt = bData.slice(0, 64);
        const iv = bData.slice(64, 80);
        const tag = bData.slice(80, 96);
        const text = bData.slice(96); // NOTE: any because there is something wrong with TS definition file
        // derive key using; 32 byte key length
        const key = yield new Promise((resolve, reject) => {
            crypto_1.pbkdf2(masterkey, salt, 100, 32, 'sha512', (err, key) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(key);
            });
        });
        // AES 256 GCM Mode
        const decipher = crypto_1.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag);
        // encrypt the given text
        const decrypted = decipher.update(text, 'binary', 'utf8') + decipher.final('utf8');
        return decrypted;
    });
}
exports.decrypt = decrypt;
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
    catch (err) { }
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
    catch (err) { }
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
//# sourceMappingURL=utils.js.map