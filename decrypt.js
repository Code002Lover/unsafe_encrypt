const enc_stuff = require("./enc_module.js")
const SHA256 = enc_stuff.SHA256
const xor = enc_stuff.xor

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
