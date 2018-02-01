const path = require('path');
const pem = require('pem')
const fs = require('fs');

const crypto = require('crypto');


const filePathCert = path.resolve('./public/keys', 'server' + '.key')

const algoritmn = 'AES-256-CBC';
const hmacalgo = 'SHA256';

function encryptwithsymmetrickey(data, symmetric_key, hmackey) {

    var IV = new Buffer(crypto.randomBytes(16))
    var cipher_text;
    var hmac;
    var encryptor;
    console.log('here1')
    encryptor = crypto.createCipheriv(algoritmn, symmetric_key, IV);
    console.log('here2')
    encryptor.setEncoding('hex');
    encryptor.write(data);
    encryptor.end();
    console.log('here')
    cipher_text = encryptor.read();

    hmac = crypto.createHmac(hmacalgo, hmackey);
    hmac.update(cipher_text);
    hmac.update(IV.toString('hex'));

    return cipher_text + "$" + IV.toString('hex') + "$" + hmac.digest('hex')
};

function decryptwithsymmetrickey(ecrypteddata, symmetric_key) {
    let output = ecrypteddata.split("|");
    let ct = output[0];
    let IV = new Buffer(output[1], 'hex');


    // chmac = crypto.createHmac(hmacalgo, hmackey);
    // chmac.update(ct);
    // chmac.update(IV.toString('hex'));

    // if (!constant_time_compare(chmac.digest('hex'), hmac)) {
    //     console.log("Encrypted message has been corrupted");
    //     return null;
    // }

    let decryptor = crypto.createDecipheriv(algoritmn, symmetric_key, IV);
    decryptor.update(ct, 'hex', 'utf-8');
    return decryptor.final('utf-8');


};

function storepublickeys(req, res) {
    try {
        let key = req.body.key
        let from = req.body.from
        const publickeypath = path.resolve('./public/keys', from + '.cert')
        fs.writeFileSync(publickeypath, key)

        res.status(200).send()

    } catch (err) {
        console.log('error----->' + err)
        res.status(500).send(err)
    }
}

function preparestorepublickeys(req, res) {
    try {
        let key = req.body.key
        let from = req.body.from
        let to = req.body.to
        console.log(to)
        const publickeypath = path.resolve('./public/keys', from + '.cert')
        const sessionkeypath = path.resolve('./public/keys', from + '.key')
        const targetpublickey = path.resolve('./public/keys', to + '.cert')

        fs.writeFileSync(publickeypath, key)

        let sessionkey = generateSymmetricKey()
        fs.writeFileSync(sessionkeypath, sessionkey)
        let frompublickey = fs.readFileSync(publickeypath)
        //encrypt bob's public key and bob identity
        let topublickey = fs.readFileSync(targetpublickey)
        let publickeyandbobidentity = topublickey + '|' + to
        let testing = Buffer.from('publickeyandbobidentity', 'utf8');
        console.log(testing)
        let tobeforwardedtobob = encryptwithsymmetrickey(testing, sessionkey, sessionkey)
        //let foralicetodescryptandforward = tobeforwardedtobob + '|' + sessionkey
        // let encryptforalicetodecryt = encryptwithpublickey(key, foralicetodescryptandforward)
        let todecrypted = decryptwithsymmetrickey(publickeyandbobidentity, sessionkey)
        console.log(tobeforwardedtobob)
        console.log(todecrypted)

        res.status(200).send(tobeforwardedtobob)

    } catch (err) {
        console.log('error----->' + err)
        res.status(500).send(err)
    }

}

function generateresponse(encryptedtopublickeyandtoidentity, frompublickey) {

}

function generateSymmetricKey() {
    var generatedKey = crypto.randomBytes(32); //.toString('base64');
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
    preparestorepublickeys: preparestorepublickeys,
    storepublickeys: storepublickeys

}