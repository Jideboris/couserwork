const encryptionHelper = require('./cryptoengine')
const path = require('path')
const pem = require('pem')
const fs = require('fs')
const request = require('request')
const crypto = require('crypto')

const privateKeyPath = path.resolve('./public/keys/Alice.key')
const publicKeyPath = path.resolve('./public/keys/Alice.cert')
const alicesymmetrickeypath = path.resolve('./public/keys/Alice-SymmetricKey.key')
const aliceivkeypath = path.resolve('./public/keys/Alice-IV.key')

const bobpublicKeyPath = path.resolve('./public/keys/Bob.cert')

const processors = {}

function requestbobpublickey(req, res) {
    request('http://localhost:3000/api/v1/retrievebobpublickey', function (err, response, body) {
        var decText = encryptionHelper.decrypt(body).split('|')
        console.log("decrypted text = " + decText)
        fs.writeFileSync(bobpublicKeyPath, decText[0])

        postnounceandidentitytobobwithitspublickey().then((resp) => {
            let toextractnouncebforbob = encryptionHelper.decryptwithprivatekey(resp.body, privateKeyPath)

            let na = toextractnouncebforbob.split('|')[0]
            let nb = toextractnouncebforbob.split('|')[1]
            let confirmbob = toextractnouncebforbob.split('|')[2]

            console.log('-------------')
            console.log(na)
            console.log('-------------')
            console.log(nb)
            console.log('-------------')
            console.log(confirmbob)
            let encrytednounceb = encryptionHelper.encryptwithpublickey(nb, bobpublicKeyPath)

           // console.log(encrytednounceb)

            postnouncebtobobtovalidatepublikey(encrytednounceb).then((response) => {
                console.log(response.body)
                res.send(response.body)
            })
        })
    })
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
            let tobestorebyaliceforcommwithtrent = encryptionHelper.decryptwithprivatekey(response.body, privateKeyPath)
            let sessionkey = tobestorebyaliceforcommwithtrent.split('|')[0]
            let ivkey = tobestorebyaliceforcommwithtrent.split('|')[1]

            fs.writeFileSync(alicesymmetrickeypath, sessionkey)
            fs.writeFileSync(aliceivkeypath, ivkey)

            res.status(200).send('ALICE IS READY!!!')
        })
    })
}
function postnounceandidentitytobobwithitspublickey() {
    const bobpublickeypath = path.resolve('./public/keys/Bob.cert')
    let nounceA = Math.random()
    let data = nounceA + '|' + 'Alice'

    let nounceandalice = encryptionHelper.encryptwithpublickey(data, bobpublickeypath)
    var myJSONObject = {
        forbob: nounceandalice
    }
    return new Promise((resolve, reject) => {
        request({
            url: "http://localhost:9000/api/v1/processfromalice",
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
            url: "http://localhost:3000/api/v1/alicepublickey/",
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

function postnouncebtobobtovalidatepublikey(encryptednounceb) {
    var myJSONObject = {
        nb: encryptednounceb
    }
    return new Promise((resolve, reject) => {
        request({
            url: "http://localhost:9000/api/v1/encryptednounceb/",
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

module.exports = {
    generatecert: generatecert,
    requestbobpublickey: requestbobpublickey

}