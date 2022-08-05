const crypto = require("crypto")
/**
 * hashes with the secure hashing algorithm 256
 * @param       {string} str   string to hash
 * @param       {any} salt  salt to apply to string
 * @param       {number} num   amount of times to hash, defaults to 1
 * @returns     {string}    base64 digested hash
*/
function SHA256(str,salt,num) {
    if(!num && num!==0)num=1;
    if(!str)return;
    
    let ret = str;

    for (let i = 0; i < num; i++) {
        ret = crypto
            .createHash("sha256")
            .update(ret+salt)
            .digest("base64");
    }
    return ret;
}

function xor(a,b) {
    let c = ""
    for (let ac of a) {
        cc = ac.charCodeAt(0)
        for(let i=0;i<b.length;i++) {
            cc = cc ^ b.charCodeAt(i) ^ i
        }
        c += String.fromCharCode(cc)
    }

    return c
}

const fs = require("fs")

let out = fs.readFileSync("output.txt").toString()

let buf = Buffer.from(out,"hex")

out = buf.toString()

let messagekey = fs.readFileSync("messagekey.txt").toString()

let signed = xor(out,messagekey)

let hashes = parseInt(signed.substring(signed.lastIndexOf("\.")+1))

signed = signed.substring(0,signed.lastIndexOf("\."))

let msg = signed.substring(0,signed.lastIndexOf("\."))
let hash = signed.substring(signed.lastIndexOf("\.")+1)

const signkey = fs.readFileSync("signkey.txt").toString()

let signhash = SHA256(msg,signkey,hashes)

if(signhash == hash) {
    console.log("output:");
    console.log(msg);
} else {
    console.log("key mismatch?");
    console.log("Message:",msg);
    console.log("signature:",hash);
    console.log("expected:",signhash);
}
