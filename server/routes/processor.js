const encryptionHelper = require('./cryptoengine')
const path = require('path')
const request = require('request')
const pem = require('pem')
const fs = require('fs')

const crypto = require('crypto')

const privateKeyPath = path.resolve('./public/keys/Bob.key')
const publicKeyPath = path.resolve('./public/keys/Bob.cert')
const bobsymmetrickeypath = path.resolve('./public/keys/Bob-SymmetricKey.key')
const bobivkeypath = path.resolve('./public/keys/Bob-IV.key')

const algoritmn = 'AES-256-CBC'
const hmacalgo = 'SHA256'

function encryptwithsymmetrickey(data, symmetric_key) {

    var IV = new Buffer(crypto.randomBytes(16));
    var cipher_text;
    var encryptor;

    encryptor = crypto.createCipheriv(algoritmn, symmetric_key, IV);
    encryptor.setEncoding('hex')
    encryptor.write(data)
    encryptor.end()

    cipher_text = encryptor.read()

    return cipher_text + "|" + IV.toString('hex')
};

function decryptwithsymmetrickey(ecrypteddata, symmetric_key) {
    let output = ecrypteddata.split("|");
    let ct = output[0];
    let IV = new Buffer(output[1], 'hex');

    let decryptor = crypto.createDecipheriv(algoritmn, symmetric_key, IV);
    decryptor.update(ct, 'hex', 'utf-8');
    return decryptor.final('utf-8');

}

function generatecert(req, res) {
    pem.createCertificate({
        days: 365,
        selfSigned: true
    }, function (err, keys) {
        if (err) {
            throw err
        }
        fs.writeFileSync(privateKeyPath, keys.serviceKey)
        fs.writeFileSync(publicKeyPath, keys.certificate)

        postpublickeytotrent(keys.certificate).then((response) => {
            let tobestorebybobforcommwithtrent = encryptionHelper.decryptwithprivatekey(response.body, privateKeyPath)
            let sessionkey = tobestorebybobforcommwithtrent.split('|')[0]
            let ivkey = tobestorebybobforcommwithtrent.split('|')[1]

            fs.writeFileSync(bobsymmetrickeypath, sessionkey)
            fs.writeFileSync(bobivkeypath, ivkey)

            res.status(200).send('BOB IS READY!!!')
        })
    })
}

function postpublickeytotrent(key) {
    var myJSONObject = {
        key: key
    }
    return new Promise((resolve, reject) => {
        request({
            url: "http://localhost:3000/api/v1/bobpublickey/",
            method: "POST",
            json: true,
            body: myJSONObject
        }, (error, response, body) => {
            if (error) {
                reject(error)
            }
            resolve(response)
        })

    }).catch((err) => {
        console.log(err)
    })
}


function generateresponse(encryptedtopublickeyandtoidentity, frompublickey) {

}

function generateSymmetricKey() {
    var generatedKey = crypto.randomBytes(32).toString('base64');
    return generatedKey;

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

module.exports = {
   // storepublickeyontrent: storepublickeyontrent,
    generatecert: generatecert
}