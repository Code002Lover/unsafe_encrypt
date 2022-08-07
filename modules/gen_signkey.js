const crypto = require("crypto");
const fs = require("fs");

const signkey = crypto.randomBytes(2**8).toString('hex');

fs.writeFileSync("signkey.txt",signkey)