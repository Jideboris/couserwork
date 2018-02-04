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

function storealicepublickey(req, res) {
    const output = {}
    let key = req.body.key
    const alicepublickeypath = path.resolve('./public/keys/Alice.cert')
    const alicetrentsessionkeypath = path.resolve('./public/keys/Alice-Symmetric.key')
    const alicetrentivkeypath = path.resolve('./public/keys/Alice-IV.key')

    fs.writeFileSync(alicepublickeypath, key)

    let sessionkey = generateSymmetricKey()
    let ivkey = generateIV()

    fs.writeFileSync(alicetrentsessionkeypath, sessionkey.toString('base64'))

    fs.writeFileSync(alicetrentivkeypath, ivkey.toString('base64'))

    let tobeencryptedforalice = sessionkey.toString('base64') + '|' + ivkey.toString('base64')

    let afterencryptedwithalicepublickey = encryptionHelper.encryptwithpublickey(tobeencryptedforalice, alicepublickeypath)

    res.send(afterencryptedwithalicepublickey)

}

function storebobpublickey(req, res) {
    const output = {}
    let key = req.body.key
    const bobpublickeypath = path.resolve('./public/keys/Bob.cert')
    const bobtrentsessionkeypath = path.resolve('./public/keys/Bob-Symmetric.key')
    const bobtrentivkeypath = path.resolve('./public/keys/Bob-IV.key')

    fs.writeFileSync(bobpublickeypath, key)

    let sessionkey = generateSymmetricKey()
    let ivkey = generateIV()

    fs.writeFileSync(bobtrentsessionkeypath, sessionkey.toString('base64'))

    fs.writeFileSync(bobtrentivkeypath, ivkey.toString('base64'))

    let tobeencryptedforbob = sessionkey.toString('base64') + '|' + ivkey.toString('base64')

    let afterencryptedwithbobpublickey = encryptionHelper.encryptwithpublickey(tobeencryptedforbob, bobpublickeypath)
    console.log(afterencryptedwithbobpublickey)

    res.send(afterencryptedwithbobpublickey)
}
function getboboalicefrombob(req, res) {
    let boboalice = req.body.boboalice
    let boboalicedecrypted = encryptionHelper.decrypt(boboalice)
    let conalicebob = boboalicedecrypted.split('|')[1]
    //console.log(conalicebob)

    const alicepublickeypath = path.resolve('./public/keys/Alice.cert')
    const bobpublickeypath = path.resolve('./public/keys/Bob.cert')

    let alicepublickey = fs.readFileSync(alicepublickeypath)

    //console.log(alicepublickey)

    let tosentobob = alicepublickey + '|' + conalicebob

    let alicepublicekeyidentity = encryptionHelper.encrypt(tosentobob, bobpublickeypath)

    console.log(alicepublicekeyidentity)

    res.send(alicepublicekeyidentity)

}
function getbobpublickeys(req, res) {
    try {
        const bobpublickeypath = path.resolve('./public/keys/Bob.cert')
        const alicetrentsessionkeypath = path.resolve('./public/keys/Alice-Symmetric.key')
        const alicetrentivkeypath = path.resolve('./public/keys/Alice-IV.key')

        let topublickey = fs.readFileSync(bobpublickeypath)
        let publickeyandbobidentity = topublickey + '|' + 'Bob'

        var tobeforwardedtobob = encryptionHelper.encrypt(publickeyandbobidentity)
        //  console.log("encrypted text = " + tobeforwardedtobob)

        res.status(200).send(tobeforwardedtobob)

    } catch (err) {
        console.log('error----->' + err)
        res.status(500).send(err)
    }
}

function generateSymmetricKey() {
    var generatedKey = crypto.randomBytes(32) //.toString('base64');
    return generatedKey;

}

function generateIV() {
    // return new Buffer(crypto.randomBytes(16))
    return crypto.randomBytes(16) //.toString('base64')
}

module.exports = {
    storepublickeys: storepublickeys,
    storealicepublickey: storealicepublickey,
    storebobpublickey: storebobpublickey,
    getbobpublickeys: getbobpublickeys,
    getboboalicefrombob: getboboalicefrombob

}