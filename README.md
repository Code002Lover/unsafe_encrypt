### unsafe_encrypt

I actually don't know how safe this thing is

# how it works as a normal user:

run `node encrypt.js`  
input the message

send the message to the receiver (after you have securely shared your two keys: messagekey.txt and signkey.txt)

the receiver runs `node decrypt.js` and gets the original message you entered

# how you can use it as a dev:

install it `npm install unsafe_encrypt`

after requiring it in your project via `const unsafeencrypt = require("./index.js")`, you can use to encrypt and decrypt

#### functions

### encrypt
example: `let encrypted = unsafeencrypt.encrypt(input)`

output: a hex string

### decrypt
example: `let out = unsafeencrypt.decrypt(input)`
where input is optional (default: "output.txt")  
input can be a file name (has to have a "." in it to be detected), or a previously encrypted string  

out: object containing the following  
status: "success" or "error"  
msg: the decrypted message, even if it failed  
signature: the signature that is in the encrypted message, undefined if status is "success"  
expected: the signature that is expected to be in the encrypted message, undefined if status is "success"  

