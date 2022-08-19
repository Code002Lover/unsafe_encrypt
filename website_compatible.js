//either you load this file on a webpage via the link, or via the nodejs module and a webserver

class Buffer extends Uint8Array {}
const K_MAX_LENGTH = 0x7fffffff

const hexSliceLookupTable = (function () {
    const alphabet = '0123456789abcdef'
    const table = new Array(256)
    for (let i = 0; i < 16; ++i) {
      const i16 = i * 16
      for (let j = 0; j < 16; ++j) {
        table[i16 + j] = alphabet[i] + alphabet[j]
      }
    }
    return table
  })()

Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer`'
  )
}



Buffer.prototype.slice = function slice (start, end) {
    const len = this.length
    start = ~~start
    end = end === undefined ? len : ~~end
  
    if (start < 0) {
      start += len
      if (start < 0) start = 0
    } else if (start > len) {
      start = len
    }
  
    if (end < 0) {
      end += len
      if (end < 0) end = 0
    } else if (end > len) {
      end = len
    }
  
    if (end < start) end = start
  
    const newBuf = this.subarray(start, end)
    // Return an augmented `Uint8Array` instance
    Object.setPrototypeOf(newBuf, Buffer.prototype)
  
    return newBuf
  }

function blitBuffer (src, dst, offset, length) {
    let i
    for (i = 0; i < length; ++i) {
      if ((i + offset >= dst.length) || (i >= src.length)) break
      dst[i + offset] = src[i]
    }
    return i
  }

function utf8Write (buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
  }
  
  function asciiWrite (buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length)
  }
  
  function base64Write (buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length)
  }
  
  function ucs2Write (buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
  }

Buffer.prototype.write = function write (string, offset, length, encoding) {
    // Buffer#write(string)
    if (offset === undefined) {
      encoding = 'utf8'
      length = this.length
      offset = 0
    // Buffer#write(string, encoding)
    } else if (length === undefined && typeof offset === 'string') {
      encoding = offset
      length = this.length
      offset = 0
    // Buffer#write(string, offset[, length][, encoding])
    } else if (isFinite(offset)) {
      offset = offset >>> 0
      if (isFinite(length)) {
        length = length >>> 0
        if (encoding === undefined) encoding = 'utf8'
      } else {
        encoding = length
        length = undefined
      }
    } else {
      throw new Error(
        'Buffer.write(string, encoding, offset[, length]) is no longer supported'
      )
    }
  
    const remaining = this.length - offset
    if (length === undefined || length > remaining) length = remaining
  
    if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
      throw new RangeError('Attempt to write outside buffer bounds')
    }
  
    if (!encoding) encoding = 'utf8'
  
    let loweredCase = false
    for (;;) {
      switch (encoding) {
        case 'hex':
          return hexWrite(this, string, offset, length)
  
        case 'utf8':
        case 'utf-8':
          return utf8Write(this, string, offset, length)
  
        case 'ascii':
        case 'latin1':
        case 'binary':
          return asciiWrite(this, string, offset, length)
  
        case 'base64':
          // Warning: maxLength not taken into account in base64Write
          return base64Write(this, string, offset, length)
  
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return ucs2Write(this, string, offset, length)
  
        default:
          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
          encoding = ('' + encoding).toLowerCase()
          loweredCase = true
      }
    }
  }

function asciiSlice (buf, start, end) {
    let ret = ''
    end = Math.min(buf.length, end)
  
    for (let i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i] & 0x7F)
    }
    return ret
  }
  
  function latin1Slice (buf, start, end) {
    let ret = ''
    end = Math.min(buf.length, end)
  
    for (let i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i])
    }
    return ret
  }
  
  function hexSlice (buf, start, end) {
    const len = buf.length
  
    if (!start || start < 0) start = 0
    if (!end || end < 0 || end > len) end = len
  
    let out = ''
    for (let i = start; i < end; ++i) {
      out += hexSliceLookupTable[buf[i]]
    }
    return out
  }
  
  function utf16leSlice (buf, start, end) {
    const bytes = buf.slice(start, end)
    let res = ''
    // If bytes.length is odd, the last 8 bits must be ignored (same as node.js)
    for (let i = 0; i < bytes.length - 1; i += 2) {
      res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
    }
    return res
  }

function slowToString (encoding, start, end) {
    let loweredCase = false
  
    // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
    // property of a typed array.
  
    // This behaves neither like String nor Uint8Array in that we set start/end
    // to their upper/lower bounds if the value passed is out of range.
    // undefined is handled specially as per ECMA-262 6th Edition,
    // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
    if (start === undefined || start < 0) {
      start = 0
    }
    // Return early if start > this.length. Done here to prevent potential uint32
    // coercion fail below.
    if (start > this.length) {
      return ''
    }
  
    if (end === undefined || end > this.length) {
      end = this.length
    }
  
    if (end <= 0) {
      return ''
    }
  
    // Force coercion to uint32. This will also coerce falsey/NaN values to 0.
    end >>>= 0
    start >>>= 0
  
    if (end <= start) {
      return ''
    }
  
    if (!encoding) encoding = 'utf8'
  
    while (true) {
      switch (encoding) {
        case 'hex':
          return hexSlice(this, start, end)
  
        case 'utf8':
        case 'utf-8':
          return utf8Slice(this, start, end)
  
        case 'ascii':
          return asciiSlice(this, start, end)
  
        case 'latin1':
        case 'binary':
          return latin1Slice(this, start, end)
  
        case 'base64':
          return base64Slice(this, start, end)
  
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return utf16leSlice(this, start, end)
  
        default:
          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
          encoding = (encoding + '').toLowerCase()
          loweredCase = true
      }
    }
  }

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    const arr = new Uint8Array(1)
    const proto = { foo: function () { return 42 } }
    Object.setPrototypeOf(proto, Uint8Array.prototype)
    Object.setPrototypeOf(arr, proto)
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Buffer.prototype.toString = function toString () {
    const length = this.length
    if (length === 0) return ''
    if (arguments.length === 0) return utf8Slice(this, 0, length)
    return slowToString.apply(this, arguments)
  }

  Buffer.isBuffer = function isBuffer (b) {
    return b != null && b._isBuffer === true &&
      b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
  }

function createBuffer (length) {
    if (length > K_MAX_LENGTH) {
      throw new RangeError('The value "' + length + '" is invalid for option "size"')
    }
    // Return an augmented `Uint8Array` instance
    const buf = new Uint8Array(length)
    Object.setPrototypeOf(buf, Buffer.prototype)
    return buf
  }

  function utf8ToBytes (string, units) {
    units = units || Infinity
    let codePoint
    const length = string.length
    let leadSurrogate = null
    const bytes = []
  
    for (let i = 0; i < length; ++i) {
      codePoint = string.charCodeAt(i)
  
      // is surrogate component
      if (codePoint > 0xD7FF && codePoint < 0xE000) {
        // last char was a lead
        if (!leadSurrogate) {
          // no lead yet
          if (codePoint > 0xDBFF) {
            // unexpected trail
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
            continue
          } else if (i + 1 === length) {
            // unpaired lead
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
            continue
          }
  
          // valid lead
          leadSurrogate = codePoint
  
          continue
        }
  
        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          leadSurrogate = codePoint
          continue
        }
  
        // valid surrogate pair
        codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
      } else if (leadSurrogate) {
        // valid bmp char, but last char was a lead
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
      }
  
      leadSurrogate = null
  
      // encode utf8
      if (codePoint < 0x80) {
        if ((units -= 1) < 0) break
        bytes.push(codePoint)
      } else if (codePoint < 0x800) {
        if ((units -= 2) < 0) break
        bytes.push(
          codePoint >> 0x6 | 0xC0,
          codePoint & 0x3F | 0x80
        )
      } else if (codePoint < 0x10000) {
        if ((units -= 3) < 0) break
        bytes.push(
          codePoint >> 0xC | 0xE0,
          codePoint >> 0x6 & 0x3F | 0x80,
          codePoint & 0x3F | 0x80
        )
      } else if (codePoint < 0x110000) {
        if ((units -= 4) < 0) break
        bytes.push(
          codePoint >> 0x12 | 0xF0,
          codePoint >> 0xC & 0x3F | 0x80,
          codePoint >> 0x6 & 0x3F | 0x80,
          codePoint & 0x3F | 0x80
        )
      } else {
        throw new Error('Invalid code point')
      }
    }
  
    return bytes
  }

function byteLength (string, encoding) {
if (Buffer.isBuffer(string)) {
    return string.length
}
if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
}
function isInstance (obj, type) {
    return obj instanceof type ||
      (obj != null && obj.constructor != null && obj.constructor.name != null &&
        obj.constructor.name === type.name)
  }
if (typeof string !== 'string') {
    throw new TypeError(
    'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
    'Received type ' + typeof string
    )
}

const len = string.length
const mustMatch = (arguments.length > 2 && arguments[2] === true)
if (!mustMatch && len === 0) return 0

// Use a for loop to avoid recursion
let loweredCase = false
for (;;) {
    switch (encoding) {
    case 'ascii':
    case 'latin1':
    case 'binary':
        return len
    case 'utf8':
    case 'utf-8':
        return utf8ToBytes(string).length
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
        return len * 2
    case 'hex':
        return len >>> 1
    case 'base64':
        return base64ToBytes(string).length
    default:
        if (loweredCase) {
        return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
}
}
Buffer.byteLength = byteLength

function fromString (string, encoding) {
    if (typeof encoding !== 'string' || encoding === '') {
      encoding = 'utf8'
    }
  
    const length = byteLength(string, encoding) | 0
    let buf = createBuffer(length)
  
    const actual = buf.write(string, encoding)
  
    if (actual !== length) {
      // Writing a hex string, for example, that contains invalid characters will
      // cause everything after the first invalid character to be ignored. (e.g.
      // 'abxxcd' will be treated as 'ab')
      buf = buf.slice(0, actual)
    }
  
    return buf
}

Buffer.from = fromString

//part of https://raw.githubusercontent.com/feross/buffer/master/index.js

var hash=function a(b){function c(a,b){return a>>>b|a<<32-b}for(var d,e,f=Math.pow,g=f(2,32),h="length",i="",j=[],k=8*b[h],l=a.h=a.h||[],m=a.k=a.k||[],n=m[h],o={},p=2;64>n;p++)if(!o[p]){for(d=0;313>d;d+=p)o[d]=p;l[n]=f(p,.5)*g|0,m[n++]=f(p,1/3)*g|0}for(b+="\x80";b[h]%64-56;)b+="\x00";for(d=0;d<b[h];d++){if(e=b.charCodeAt(d),e>>8)return;j[d>>2]|=e<<(3-d)%4*8}for(j[j[h]]=k/g|0,j[j[h]]=k,e=0;e<j[h];){var q=j.slice(e,e+=16),r=l;for(l=l.slice(0,8),d=0;64>d;d++){var s=q[d-15],t=q[d-2],u=l[0],v=l[4],w=l[7]+(c(v,6)^c(v,11)^c(v,25))+(v&l[5]^~v&l[6])+m[d]+(q[d]=16>d?q[d]:q[d-16]+(c(s,7)^c(s,18)^s>>>3)+q[d-7]+(c(t,17)^c(t,19)^t>>>10)|0),x=(c(u,2)^c(u,13)^c(u,22))+(u&l[1]^u&l[2]^l[1]&l[2]);l=[w+x|0].concat(l),l[4]=l[4]+w|0}for(d=0;8>d;d++)l[d]=l[d]+r[d]|0}for(d=0;8>d;d++)for(e=3;e+1;e--){var y=l[d]>>8*e&255;i+=(16>y?0:"")+y.toString(16)}return i};

function hexToBase64(hexstring) {
    return btoa(hexstring.match(/\w{2}/g).map(function(a) {
        return String.fromCharCode(parseInt(a, 16));
    }).join(""));
}

function SHA256(str,salt,num) {
    if(!num && num!==0)num=1;
    if(!str)str="";
    let ret = str;
    for (let i = 0; i < num; i++) {
        ret = hexToBase64(hash(ret+salt))
    }
    return ret;
}

function xor(a,b) {
    let c = ""
    let cc
    for (let j=0;j<a.length;j++) {
        cc = a.charCodeAt(j) ^ j
        cc = cc ^ b.charCodeAt((j%b.length))
        // for(let i=0;i<b.length;i++) {
        //     cc = cc ^ b.charCodeAt(i)
        // }
        c += String.fromCharCode(cc)
    }

    return c
}

function readFileSync(){return""}
function existsSync(){return""}
function writeFileSync(){return""}

const gen_signkey = function(){}
const gen_messagekey = function(){}


const packageversion = "101" //resolved version

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