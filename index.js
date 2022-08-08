const enc_stuff = require("./modules/enc_module.js")
const SHA256 = enc_stuff.SHA256
const xor = enc_stuff.xor

const fs = require("fs")

function decrypt(str,options) {

    options = options || {}

    str = str || ""

    let out;

    if(str.search("\\.") == -1 && str != "") {
        out = str
    } else {
        out = fs.readFileSync(str || "output.txt").toString()
    }

    let buf = Buffer.from(out,"hex")

    out = buf.toString()

    let messagekey = options.messagekey
    if(!messagekey)messagekey = fs.readFileSync("messagekey.txt").toString()

    let signed = xor(out,messagekey)

    let version = signed.substring(signed.lastIndexOf("\.")+1)
    signed = signed.substring(0,signed.lastIndexOf("\."))


    let hashes = parseInt(signed.substring(signed.lastIndexOf("\.")+1))

    signed = signed.substring(0,signed.lastIndexOf("\."))

    let msg = signed.substring(0,signed.lastIndexOf("\."))
    let hash = signed.substring(signed.lastIndexOf("\.")+1)

    let signkey = options.signkey
    if(!signkey)signkey = fs.readFileSync("signkey.txt").toString()

    let signhash = SHA256(msg,signkey,hashes)

    if(signhash == hash) {
        //message has been verified
        return {
            "msg": msg,
            "status": "success",
            "version": version,
            "currentversion": require("./package.json").version.replace(/\./g,"")
        }
    } else {
        //there's been an error, invalid key?
        return {
            "status": "error",
            "msg": msg,
            "signature": hash,
            "expected": signhash,
            "version": version,
            "currentversion": require("./package.json").version.replace(/\./g,"")
        }
    }
}

function encrypt(msg) {

    if(!fs.existsSync("signkey.txt")) {
        require("./modules/gen_signkey.js")
        console.log("generated a signature key")
    }
    
    if(!fs.existsSync("messagekey.txt")) {
        require("./modules/gen_messagekey.js")
        console.log("generated a message key")
    }
    
    const signkey = fs.readFileSync("signkey.txt").toString()
    
    const messagekey = fs.readFileSync("messagekey.txt").toString()
    
    const hashes = 1000

    let signedmsg = msg + "." + SHA256(msg,signkey,hashes) + "." + hashes + "." + require("./package.json").version.replace(/\./g,"")
    
    let xoredmsg = xor(signedmsg,messagekey)
    
    let buf = Buffer.from(xoredmsg)
    
    xoredmsg = buf.toString("hex")

    return xoredmsg;
}


function pack(options) {

    options = options || {}

    let signkey = options.signkey || fs.readFileSync("signkey.txt").toString()

    let messagekey = options.messagekey || fs.readFileSync("messagekey.txt").toString()

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
            fs.writeFileSync("signkey.txt",signkey)
            fs.writeFileSync("messagekey.txt",messagekey)
        }
        return {
            "messagekey": messagekey,
            "signkey": signkey
        }
    }

    return {"error":"no packed keys given"}
}

module.exports = {
    decrypt,
    encrypt,
    pack,
    unpack
}