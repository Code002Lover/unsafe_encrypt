import { pack, encrypt, decrypt } from "../index.js";

import { randomBytes } from "crypto";

const attempts = 1000

const per = attempts/100

const randomString = (length = 4) => {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;

};

let string = randomString(attempts)

for(let i=0;i<attempts;i++) {

    const messagekey = randomBytes(2**10).toString('hex');

    const signkey = randomBytes(2**8).toString('hex');

    const packed = pack({
        signkey: signkey,
        messagekey: messagekey
    })

    let encrypted = encrypt(string.substring(0,i), {packed:packed})

    let out = decrypt(encrypted, {packed:packed})

    if(out.status == "error") {
        console.error(out)
        process.abort(i)
    }

    if(i%100==0) {
        console.log("progress: ",i+"/"+attempts,i/per+"%");
    }

}

console.log("succeeded extended packing test")