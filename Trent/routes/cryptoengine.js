
var crypto = require("crypto");
var EncryptionHelper = {
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
    encryptwithpublickey: encryptwithpublickey

}
function decryptwithprivatekey(privateKey, data) {
    let enc = crypto.privateDecrypt({
        key: privateKey,
        padding: crypto.RSA_PKCS1_OAEP_PADDING
    }, Buffer.from(data, 'base64'));

    return enc.toString();
};

function encryptwithpublickey(publicKey, data) {
    let enc = crypto.publicEncrypt({
        key: publicKey,
        padding: crypto.RSA_PKCS1_OAEP_PADDING
    }, Buffer.from(data));

    return enc.toString('base64');
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