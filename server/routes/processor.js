
const encryptionHelper = require('./cryptoengine')
const path = require('path')
const request = require('request')
const pem = require('pem')
const fs = require('fs')

const crypto = require('crypto')

const noucefromalicepath = path.resolve('./public/keys/nounceA.txt')
const noucebpath = path.resolve('./public/keys/nounceB.txt')
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
function processfromalice(req, res) {
    let forbob = req.body.forbob
    let nouceandalice = encryptionHelper.decryptwithprivatekey(forbob, privateKeyPath)
    let na = nouceandalice.split('|')[0]
    let alice = nouceandalice.split('|')[1]

    fs.writeFileSync(noucefromalicepath, na)

    let tosendtotrent = 'Bob' + '|' + alice

    let bobaliceencryptionfortrent = encryptionHelper.encrypt(tosendtotrent)

    console.log(bobaliceencryptionfortrent)

    postalicebobtotrentfrombobo(bobaliceencryptionfortrent).then((resp) => {
        //resp is encrpted alice public key with symmtric key
        const alicepublickeyforbobpath = path.resolve('./public/keys/Alice.cert')
        let alicepublickey = encryptionHelper.decrypt(resp.body)
        let pubickeyofalice = alicepublickey.split('|')[0]
        console.log(pubickeyofalice)
        fs.writeFileSync(alicepublickeyforbobpath, pubickeyofalice)

        let noucebob = Math.random()
        let nouncealice = fs.readFileSync(noucefromalicepath)

        fs.writeFileSync(noucebpath, noucebob)

        let sendtoalicenounceaandbwithbob = nouncealice + '|' + noucebob + '|' + 'Bob'
        let banktoalice = encryptionHelper.encryptwithpublickey(sendtoalicenounceaandbwithbob, alicepublickeyforbobpath)
        res.send(banktoalice)
    })


}
function postalicebobtotrentfrombobo(key) {
    var myJSONObject = {
        boboalice: key
    }
    return new Promise((resolve, reject) => {
        request({
            url: "http://localhost:3000/api/v1/boboalicefrombob/",
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
function generateSymmetricKey() {
    var generatedKey = crypto.randomBytes(32).toString('base64');
    return generatedKey;

}

function checkandvalidnounceb(req, res) {
    let encryptednounce = req.body.nb
    let decryptednounce = encryptionHelper.decryptwithprivatekey(encryptednounce, privateKeyPath)
    let output = ''
    console.log('--------------------')
    // let nounce = new Buffer(storenounce, 'utf-8');
    fs.readFile(noucebpath, 'utf8', (err, data) => {
        if (err) throw err;
        if (data === decryptednounce) {
            console.log('passed')
            output = 'WELDONE EXCHANGE HAS COMPLETED!!!'
        }
        else {
            output = 'FAILED!!!'
        }
        return res.send(output)
    })
    
}
module.exports = {
    processfromalice: processfromalice,
    generatecert: generatecert,
    checkandvalidnounceb: checkandvalidnounceb
}