const unsafeencrypt = require("./index.js")

const out = unsafeencrypt.decrypt()

let argv = process.argv.splice(2)

let silent = false

for(let arg of argv) {
    switch(arg) {
        case "-s":
            silent = true
            break;
    }
}

if(out.status == "success") {
    if(silent)return
    console.log("output:")
    console.log(out.msg)
} else {

    process.exitCode = 1

    if(silent)return
    console.log("error decrypting the message")
    console.log("perhaps you have the wrong keys?")
    console.log("decrypted message: ", out.msg)
    console.log("signature: ", out.signature)
    console.log("signature expected: ", out.expected)

    
}