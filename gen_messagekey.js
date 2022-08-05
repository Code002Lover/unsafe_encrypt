const crypto = require("crypto");
const fs = require("fs");

const messagekey = crypto.randomBytes(256).toString('hex');

fs.writeFileSync("messagekey.txt",messagekey)
