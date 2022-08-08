import { encrypt, decrypt } from "../index.js";
import { randomBytes } from "crypto";
import { readFileSync, writeFileSync } from "fs";

const randomString = (length = 4) => {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;

};

const attempts = 1000

const per = attempts/100

for(let i=0;i<attempts;i++) {

    let lastkey = readFileSync("messagekey.txt").toString()

    let msg = randomString(50)
    let encrypted = encrypt(msg)

    let newkey = randomBytes(2**10).toString("hex")

    writeFileSync("messagekey.txt",newkey)

    let out = decrypt(encrypted)

    if(out.status=="success" && lastkey!=newkey && out.msg == msg) {
        console.error(out)
        console.log("message:",msg);
        console.log(lastkey);
        console.log(newkey);
        process.exit(i+1) //non-zero
    }

    if(i%100==0) {
        console.log("progress: ",i+"/"+attempts,i/per+"%");
    }
}

console.log("successfully tested randomly messing with messagekey");

for(let i=0;i<attempts;i++) {

    let lastkey = readFileSync("signkey.txt").toString()

    let encrypted = encrypt(randomString(50))

    let newkey = randomBytes(256).toString("hex")

    writeFileSync("signkey.txt",newkey)

    let out = decrypt(encrypted)

    if(out.status=="success" && lastkey!=newkey) {
        console.error(out)
        process.exit(i+1) //non-zero
    }

    if(i%100==0) {
        console.log("progress: ",i+"/"+attempts,i/per+"%");
    }
}

console.log("successfully tested randomly messing with signkey");
