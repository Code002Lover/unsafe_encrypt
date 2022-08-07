const crypto = require("crypto");
const fs = require("fs");

const messagekey = crypto.randomBytes(2**10).toString('hex');

fs.writeFileSync("messagekey.txt",messagekey)
