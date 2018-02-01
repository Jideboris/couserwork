const {
    encrypt,
    decrypt
} = require('./symmetricengine')
const rsaWrapper = require('./rsa-wrapper')
const path = require('path')
const pem = require('pem')
const fs = require('fs')
const request = require('request')
const crypto = require('crypto')
const filePathCert = path.resolve('./public/keys', 'Alice' + '.key')
const publicKeyPath = path.resolve('./public/keys', 'Alice' + '.cert')
 
const processors = {};

function generatecert() {
    pem.createCertificate({
        days: 365,
        selfSigned: true
    }, function (err, keys) {
        if (err) {
            throw err
        }
        fs.writeFileSync(filePathCert, keys.serviceKey)
        fs.writeFileSync(publicKeyPath, keys.certificate)

        postpublickeytotrent(keys.certificate, 'Alice', 'Bob').then((response) => {
            console.log(response.buffer)
        })
    })
}

function postpublickeytotrent(key, from, to) {
    var myJSONObject = {
        key: key,
        from: from,
        to: to
    }
    return new Promise((resolve, reject) => {
        request({
            url: "http://localhost:3000/api/v1/storepublickey/",
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

function generatecertificateandsymeetrickeys(req, res) {
    generatecert()
    let publicKey = fs.readFileSync(publicKeyPath)
    postpublickeytotrent(publicKey, 'Alice', 'Bob').then((response) => {
        // session key from Trent
        console.log(response)
        res.send(response)

        //console.log(publicKey.toString('base64'))

        // let publicKey = fs.readFileSync(publicKeyPath)
        //  console.log(publicKey.toString('base64'))
        // const result = http.get('http://localhost:3000/api/v1/getcontent', (resp) => {
        //     let data = '';
        //     // A chunk of data has been recieved.
        //     resp.on('data', (chunk) => {
        //         data += chunk;
        //     });
        //     resp.on('end', () => {
        //         var output = JSON.parse(data)
        //         //temporily save certificate prrior verification
        //         fs.writeFileSync(filePath, output.digitalcert);
        //         //validate if certificate is valid
        //         var isCertificateValid = validateCert();
        //         if (isCertificateValid) {
        //             //generate sessioned symmetric key in base64
        //             var sessionKey = generateSymmetricKey();
        //             //generate another to hash cipher-text
        //             var hmacKey = generateSymmetricKey();
        //             //write session key to file-different for each session
        //             fs.writeFileSync(sessionedSymmetricKeyPath, sessionKey)
        //             //wite hmac key to file
        //             fs.writeFileSync(hmacKeyPath, hmacKey);
        //             //encrypt the session key with server certificate public key and send to server
        //             //generate timestamp to verify freshness
        //             var currentTime = new Date()
        //             //include timestamp to check the freshness with the key and hmac key
        //             var sessionKeyPlusTimeStamp = sessionKey + '|' + currentTime + '|' + hmacKey + '|' + 'S' + '|' + 'C';
        //             //get or read public key from file
        //             var publicKey = fs.readFileSync(filePath);
        //             //encrypt session key
        //             var encryptedSessionKeyWithPublicKey = rsaWrapper.encrypt(publicKey, sessionKeyPlusTimeStamp);
        //             // send the encryptedSessionKeyWithPublicKey to server
        //             var abc = postencryptedsessionedkeywithserverpublickey(encryptedSessionKeyWithPublicKey).then((response) => {
        //                 var item = JSON.parse(response);
        //                 //get the session key buffer format 
        //                 var buf = Buffer.from(sessionKey, 'base64')
        //                 //get hmac key
        //                 var bufHmac = Buffer.from(hmacKey, 'base64')
        //                 if (item == -1) {
        //                     resolve("sender or recipient is not valid")
        //                 }
        //                 else {
        //                     //decrypt to get message from server
        //                     var decp = decrypt(item.output, buf, bufHmac)
        //                     message = decp;
        //                     resolve(decp)
        //                 }

        //             });
        //         }
        //         else {
        //             resolve("sender or recipient is not valid")
        //         }

        //     });

        // }).on("error", (err) => {
        //     console.log("Error: " + err.message);
        // });
        // result.on('error', (err) => reject(err))
    });



}

function validateCert() {
    var cert = x509.parseCert(filePath),
        date = new Date();

    if (cert.notAfter > date) {
        return true;
    }
    return false;

}


module.exports = {
    validateCert: validateCert,
    generatecertificateandsymeetrickeys: generatecertificateandsymeetrickeys,
    generatecert: generatecert

};