const unsafeencrypt = require("../index.js")

const crypto = require("crypto");

const attempts = 100000

const per = attempts/100

for(let i=0;i<attempts;i++) {

    const messagekey = crypto.randomBytes(2**10).toString('hex');

    const signkey = crypto.randomBytes(2**8).toString('hex');

    const packed = unsafeencrypt.pack({
        signkey: signkey,
        messagekey: messagekey
    })

    const unpacked = unsafeencrypt.unpack(packed)

    if(unpacked.signkey != signkey || unpacked.messagekey != messagekey) {
        console.log(unpacked);
        process.exit(i)
    }

    if(i%10000==0) {
        console.log("progress: ",i+"/"+attempts,i/per+"%");
    }

}