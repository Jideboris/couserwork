const crypto = require("crypto")
const path = require("path")
const fs = require("fs")
const algorithm = 'aes-256-ctr'
const password = 'd6F3Efeq'
const EncryptionHelper = {
    getKeyAndIV: getKeyAndIV,
    encryptText: encryptText,
    decryptText: decryptText,
    CIPHERS: {
        "AES_128": "aes128", //requires 16 byte key
        "AES_128_CBC": "aes-128-cbc", //requires 16 byte key
        "AES_192": "aes192", //requires 24 byte key
        "AES_256": "aes256" //requires 32 byte key
    },
    decryptwithprivatekey: decryptwithprivatekey,
    encryptwithpublickey: encryptwithpublickey,
    encrypt: encrypt,
    decrypt: decrypt

}
function encrypt(text) {
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}
function encryptwithpublickey(toEncrypt, relativeOrAbsolutePathToPublicKey) {
    let absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey)
    let publicKey = fs.readFileSync(absolutePath, "utf8")
    let buffer = new Buffer(toEncrypt)
    let encrypted = crypto.publicEncrypt(publicKey, buffer)
    return encrypted.toString("base64")
}

function decryptwithprivatekey(toDecrypt, relativeOrAbsolutePathtoPrivateKey) {
    var absolutePath = path.resolve(relativeOrAbsolutePathtoPrivateKey)
    var privateKey = fs.readFileSync(absolutePath, "utf8")
    var buffer = new Buffer(toDecrypt, "base64")
    var decrypted = crypto.privateDecrypt(privateKey, buffer)
    return decrypted.toString("utf8")
}

function getKeyAndIV(key) {
    const output = {
        iv: '',
        key: ''
    }
    return new Promise((resolve, reject) => {
        crypto.pseudoRandomBytes(16, function (err, ivBuffer) {
            var keyBuffer = (key instanceof Buffer) ? key : new Buffer(key)
            output.iv = ivBuffer
            output.key = keyBuffer
        })
        resolve(output)

    })

}

function encryptText(cipher_alg, key, iv, text, encoding) {
    var cipher = crypto.createCipheriv(cipher_alg, key, iv)
    encoding = encoding || "binary";
    var result = cipher.update(text, "utf8", encoding);
    result += cipher.final(encoding);
    return result;
}

function decryptText(cipher_alg, key, iv, text, encoding) {
    var decipher = crypto.createDecipheriv(cipher_alg, key, iv);
    encoding = encoding || "binary";
    var result = decipher.update(text, encoding);
    result += decipher.final();
    return result;
}

module.exports = EncryptionHelper