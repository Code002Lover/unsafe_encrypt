function xor(a,b) {
    let c = ""
    for (let ac of a) {
        cc = ac.charCodeAt(0)
        for(let bc of b) {
            cc = cc ^ bc.charCodeAt(0)
        }
        c += String.fromCharCode(cc)
    }

    return c
}

const msg = "aBAb"
const msg2 = "bABa"

console.log(msg,msg2);

console.log(xor(msg,msg2));
console.log(xor(msg2,msg));

console.log(xor(xor(msg,msg2),msg2));
