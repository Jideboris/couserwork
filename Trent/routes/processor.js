const path = require('path')
const pem = require('pem')
const fs = require('fs')
const crypto = require('crypto')
const filePathCert = path.resolve('./public/keys', 'server' + '.key')

const encryptionHelper = require("./cryptoengine")

var algorithm = encryptionHelper.CIPHERS.AES_256

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
        let ivkey = generateIV()

        fs.writeFileSync(sessionkeypath, sessionkey.toString('base64'))

        let frompublickey = fs.readFileSync(publickeypath)
        //encrypt bob's public key and bob identity
        let topublickey = fs.readFileSync(targetpublickey)

        let publickeyandbobidentity = topublickey + '|' + to

        var tobeforwardedtobob = encryptionHelper.encryptText(algorithm, sessionkey, ivkey, publickeyandbobidentity, "base64")
        console.log("encrypted text = " + tobeforwardedtobob)
        var decText = encryptionHelper.decryptText(algorithm, sessionkey, ivkey, tobeforwardedtobob, "base64")
        console.log("decrypted text = " + decText)
          let tobeforwardedtobob = encryptwithsymmetrickey('Jide', sessionkey, generateSymmetricKey())
        let foralicetodescryptandforward = tobeforwardedtobob + '|' + sessionkey
        let encryptforalicetodecryt = encryptwithpublickey(key, foralicetodescryptandforward)
         let todecrypted = decrypt(tobeforwardedtobob)
         console.log(tobeforwardedtobob)
         console.log(todecrypted.toString('utf-8'))

         res.status(200).send(tobeforwardedtobob)

    } catch (err) {
        console.log('error----->' + err)
        res.status(500).send(err)
    }

}

function generateresponse(encryptedtopublickeyandtoidentity, frompublickey) {

}

function generateSymmetricKey() {
    var generatedKey = crypto.randomBytes(32) //.toString('base64');
    return generatedKey;

}

function generateIV() {
    // return new Buffer(crypto.randomBytes(16))
    return crypto.randomBytes(16) //.toString('base64')
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