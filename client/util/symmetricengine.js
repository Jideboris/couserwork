var crypto, algoritmn, hmacalgo;

crypto = require('crypto');

algoritmn = 'AES-256-CBC';
hmacalgo = 'SHA256';

var encrypt = function (plain_text, symmetric_key, hmackey) {

    var IV = new Buffer(crypto.randomBytes(16)); 
    var cipher_text;
    var hmac;
    var encryptor;

    encryptor = crypto.createCipheriv(algoritmn, symmetric_key, IV);
    encryptor.setEncoding('hex');
    encryptor.write(plain_text);
    encryptor.end();

    cipher_text = encryptor.read();

    hmac = crypto.createHmac(hmacalgo, hmackey);
    hmac.update(cipher_text);
    hmac.update(IV.toString('hex')); 

    return cipher_text + "$" + IV.toString('hex') + "$" + hmac.digest('hex')

};

var decrypt = function (cipher_text, symmetric_key, hmackey) {
    var cipher_blob = cipher_text.split("$");
    var ct = cipher_blob[0];
    var IV = new Buffer(cipher_blob[1], 'hex');
    var hmac = cipher_blob[2];
    var decryptor;

    chmac = crypto.createHmac(hmacalgo, hmackey);
    chmac.update(ct);
    chmac.update(IV.toString('hex'));

    if (!constant_time_compare(chmac.digest('hex'), hmac)) {
        console.log("Encrypted message has been corrupted...");
        return null;
    }

    decryptor = crypto.createDecipheriv(algoritmn, symmetric_key, IV);
    decryptor.update(ct, 'hex', 'utf-8');
    return decryptor.final('utf-8');


};

var constant_time_compare = function (val1, val2) {
    var sentinel;
    if (val1.length !== val2.length) {
        return false;
    }
    for (var i = 0; i <= (val1.length - 1); i++) {
        sentinel |= val1.charCodeAt(i) ^ val2.charCodeAt(i);
    }
    return sentinel === 0
};

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt
}
