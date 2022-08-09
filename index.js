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
        let unpacked = unpack_keys(options.packed)
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
        let unpacked = unpack_keys(options.packed)
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


function pack_keys(options) {

    options = options || {}

    let signkey = options.signkey || readFileSync("signkey.txt").toString()

    let messagekey = options.messagekey || readFileSync("messagekey.txt").toString()

    let out = `${signkey}.${messagekey}`

    return out
}

function unpack_keys(options) {

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

function chunkString(str, size) {
    const numChunks = Math.ceil(str.length / size)
    const chunks = new Array(numChunks)
  
    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
      chunks[i] = str.substr(o, size)
    }
  
    return chunks
}
  //https://stackoverflow.com/a/29202760

function pack_text(options) {
    options = options || {}

    if(options.text && options.size) {
        //two modes: one for sizes >= 128, where every part is signed
        // and one for sizes < 128 && > 0, where the encrypted part is just legit split

        if(options.size < 128) {
            if(options.size <= 0) {
                throw new InvalidOptionsError("the size given has to be greater than 0")
            }

            let enc = encrypt(options.text,options)

            let out = chunkString(enc,options.size)

            out[-1] = "0"

            return out

        } else {
            //>=128

            options.hashes = options.hashes || 1000

            let chunkSizes = options.size - 55 - options.hashes.toString().length - 3 - 3 
            //45 because of the hash (+10 because of base64 to hex conversion), 3 because of the hashes, 3 dots, 3 for the version
            if(chunkSizes <= 0) {
                options.size--;
                console.error("chunkSizes calculated would be impossible")
                pack_text(options)
            }

            let chunks = chunkString(options.text,chunkSizes)

            let out = {}

            for(let i in chunks) {
                let chunk = chunks[i]
                out[i] = encrypt(chunk,options)
            }

            out[-1] = "1"

            return out
        }
    } else {
        throw new InvalidOptionsError("either no options, no text, or no size was given")
    }
}

function unpack_text(options) {
    options = options || {}

    if(options.data) {
        if(options.data[-1] || options.size) {
            let mode = options.data[-1] || ""+(+(options.size >= 128))

            if(mode == "0") {
                let inp = ""
                for(let i in options.data) {
                    if(i!=-1) {
                        inp += options.data[i]
                    }
                }

                return decrypt(inp,options).msg
            } else {
                let out = ""
                for(let i in options.data) {
                    if(i!=-1) {
                        let temp = decrypt(options.data[i],options)
                        if(temp.status=="success") {
                            out += temp.msg
                        } else {
                            console.error("error decrypting packed text")
                            return
                        }
                    }
                }
                return out
            }

        } else {
            throw new InvalidOptionsError("no size and not enough data given")
        }

    } else {
        throw new InvalidOptionsError("no data given")
    }
}

export {
    decrypt,
    encrypt,
    pack_keys,
    unpack_keys,
    pack_text,
    unpack_text
}