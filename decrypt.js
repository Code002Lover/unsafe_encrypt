const unsafeencrypt = require("./index.js")

const out = unsafeencrypt.decrypt()

if(out.status == "success") {
    console.log("output:")
    console.log(out.msg)
} else {
    console.log("error decrypting the message")
    console.log("perhaps you have the wrong keys?")
    console.log("decrypted message: ", out.msg)
    console.log("signature: ", out.signature)
    console.log("signature expected: ", out.expected)
}