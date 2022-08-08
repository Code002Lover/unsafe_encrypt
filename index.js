import {SHA256, xor} from "./modules/enc_module.js"

import { readFileSync,writeFileSync,existsSync } from "fs"

import { run as gen_messagekey }  from "./modules/gen_messagekey.js"

import { run as gen_signkey }  from "./modules/gen_signkey.js"

const packageversion = JSON.parse(readFileSync("package.json").toString()).version.replace(/\./g,"")

function decrypt(str,options) {

    options = options || {}

    str = str || ""

    let out;

    if(str.search("\\.") == -1 && str != "") {
        out = str
    } else {
        out = readFileSync(str || "output.txt").toString()
    }

    let buf = Buffer.from(out,"hex")

    out = buf.toString()

    if(options.packed) {
        let unpacked = unpack(options.packed)
        options.messagekey = unpacked.messagekey
        options.signkey = unpacked.signkey
    }

    let messagekey  = options.messagekey    || readFileSync("messagekey.txt").toString()

    let signkey     = options.signkey       || readFileSync("signkey.txt").toString()

    let signed = xor(out,messagekey)

    let version = signed.substring(signed.lastIndexOf("\.")+1)
    signed = signed.substring(0,signed.lastIndexOf("\."))


    let hashes = parseInt(signed.substring(signed.lastIndexOf("\.")+1))

    signed = signed.substring(0,signed.lastIndexOf("\."))

    let msg = signed.substring(0,signed.lastIndexOf("\."))
    let hash = signed.substring(signed.lastIndexOf("\.")+1)

    

    let signhash = SHA256(msg,signkey,hashes)

    if(signhash == hash) {
        //message has been verified
        return {
            "msg": msg,
            "status": "success",
            "version": version,
            "currentversion": packageversion
        }
    } else {
        //there's been an error, invalid key?
        return {
            "status": "error",
            "msg": msg,
            "signature": hash,
            "expected": signhash,
            "version": version,
            "currentversion": packageversion
        }
    }
}

function encrypt(msg, options) {

    options = options || {}

    if(options.packed) {
        let unpacked = unpack(options.packed)
        options.messagekey = unpacked.messagekey
        options.signkey = unpacked.signkey
    }

    if(!existsSync("signkey.txt") && !options.signkey) {
        gen_signkey()
        console.log("generated a signature key")
    }
    
    if(!existsSync("messagekey.txt") && !options.messagekey) {
        gen_messagekey()
        console.log("generated a message key")
    }
    
    const signkey = options.signkey || readFileSync("signkey.txt").toString()
    
    const messagekey = options.messagekey || readFileSync("messagekey.txt").toString()
    
    const hashes = options.hashes || 1000

    let signedmsg = msg + "." + SHA256(msg,signkey,hashes) + "." + hashes + "." + packageversion
    
    let xoredmsg = xor(signedmsg,messagekey)
    
    let buf = Buffer.from(xoredmsg)
    
    xoredmsg = buf.toString("hex")

    return xoredmsg;
}


function pack(options) {

    options = options || {}

    let signkey = options.signkey || readFileSync("signkey.txt").toString()

    let messagekey = options.messagekey || readFileSync("messagekey.txt").toString()

    let out = `${signkey}.${messagekey}`

    return out
}

function unpack(options) {

    if(typeof options == "string")options = {packed: options}

    options = options || {}

    if(options.packed) {
        let keys = options.packed.split("\.")

        let signkey = keys[0]
        let messagekey = keys[1]
        
        if(options.writefile) {
            writeFileSync("signkey.txt",signkey)
            writeFileSync("messagekey.txt",messagekey)
        }
        return {
            "messagekey": messagekey,
            "signkey": signkey
        }
    }

    return {"error":"no packed keys given"}
}

export {
    decrypt,
    encrypt,
    pack,
    unpack
}