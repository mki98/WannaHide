const crypto = require("crypto");
const { performance } = require("perf_hooks");
const { BigInteger } = require("jsbn");

/** Generates BigInts between low (inclusive) and high (exclusive) */
// function generateRandomBigInt(lowBigInt, highBigInt) {
//   if (lowBigInt >= highBigInt) {
//     throw new Error("lowBigInt must be smaller than highBigInt");
//   }

//   const difference = highBigInt - lowBigInt;
//   const differenceLength = difference.toString().length;
//   let multiplier = "";
//   while (multiplier.length < differenceLength) {
//     multiplier += Math.random().toString().split(".")[1];
//   }
//   multiplier = multiplier.slice(0, differenceLength);
//   const divisor = "1" + "0".repeat(differenceLength);

//   const randomDifference = (difference * BigInt(multiplier)) / BigInt(divisor);

//   return lowBigInt + randomDifference;
// } //Master Math
// class KeyPairs {
//   constructor() {
//     this.primeN =
//       5809605995369958062791915965639201402176612226902900533702900882779736177890990861472094774477339581147373410185646378328043729800750470098210924487866935059164371588168047540943981644516632755067501626434556398193186628990071248660819361205119793693985433297036118232914410171876807536457391277857011849897410207519105333355801121109356897459426271845471397952675959440793493071628394122780510124618488232602464649876850458861245784240929258426287699705312584509625419513463605155428017165714465363094021609290561084025893662561222573202082865797821865270991145082200656978177192827024538990239969175546190770645685893438011714430426409338676314743571154537142031573004276428701433036381801705308659830751190352946025482059931306571004727362479688415574702596946457770284148435989129632853918392117997472632693078113129886487399347796982772784615865232621289656944284216824611318709764535152507354116344703769998514148343807n;
//     this.generator = 2n;
//     this.privateKey = generateRandomBigInt(this.generator, this.primeN - 2n);
//     this.publicKey = (this.generator ^ this.privateKey) % this.primeN;;
//   }
//   generateShared(publicOther){
//     const shared = (publicOther^this.privateKey) % this.primeN;
//     return shared;
//   }
// }

// var Alice = new KeyPairs()
// var Foud = new KeyPairs()
// var Bob = new KeyPairs()

// const crypto = require("crypto");
// console.time("Run Time");
// var startTime = performance.now()
// var primeN =
//   //1500
//   2410312426921032588552076022197566074856950548502459942654116941958108831682612228890093858261341614673227141477904012196503648957050582631942730706805009223062734745341073406696246014589361659774041027169249453200378729434170325843778659198143763193776859869524088940195577346119843545301547043747207749969763750084308926339295559968882457872412993810129130294592999947926365264059284647209730384947211681434464714438488520940127459844288859336526896320919633919n;
// //2048 -> 0.4169
// // 32317006071311007300338913926423828248817941241140239112842009751400741706634354222619689417363569347117901737909704191754605873209195028853758986185622153212175412514901774520270235796078236248884246189477587641105928646099411723245426622522193230540919037680524235519125679715870117001058055877651038861847280257976054903569732561526167081339361799541336476559160368317896729073178384589680639671900977202194168647225871031411336429319536193471636533209717077448227988588565369208645296636077250268955505928362751121174096972998068410554359584866583291642136218231078990999448652468262416972035911852507045361090559n;
// //3072-> 0.5439
// // 5809605995369958062791915965639201402176612226902900533702900882779736177890990861472094774477339581147373410185646378328043729800750470098210924487866935059164371588168047540943981644516632755067501626434556398193186628990071248660819361205119793693985433297036118232914410171876807536457391277857011849897410207519105333355801121109356897459426271845471397952675959440793493071628394122780510124618488232602464649876850458861245784240929258426287699705312584509625419513463605155428017165714465363094021609290561084025893662561222573202082865797821865270991145082200656978177192827024538990239969175546190770645685893438011714430426409338676314743571154537142031573004276428701433036381801705308659830751190352946025482059931306571004727362479688415574702596946457770284148435989129632853918392117997472632693078113129886487399347796982772784615865232621289656944284216824611318709764535152507354116344703769998514148343807n;
// //4096-> 0.8837
// // 1044388881413152506679602719846529545831269060992135009022588756444338172022322690710444046669809783930111585737890362691860127079270495454517218673016928427459146001866885779762982229321192368303346235204368051010309155674155697460347176946394076535157284994895284821633700921811716738972451834979455897010306333468590751358365138782250372269117968985194322444535687415522007151638638141456178420621277822674995027990278673458629544391736919766299005511505446177668154446234882665961680796576903199116089347634947187778906528008004756692571666922964122566174582776707332452371001272163776841229318324903125740713574141005124561965913888899753461735347970011693256316751660678950830027510255804846105583465055446615090444309583050775808509297040039680057435342253926566240898195863631588888936364129920059308455669454034010391478238784189888594672336242763795138176353222845524644040094258962433613354036104643881925238489224010194193088911666165584229424668165441688927790460608264864204237717002054744337988941974661214699689706521543006262604535890998125752275942608772174376107314217749233048217904944409836238235772306749874396760463376480215133461333478395682746608242585133953883882226786118030184028136755970045385534758453247n;
// //6144 -> 1.0553 ->
// // 33751521821438561184518523159967412330064897805741846548173890474429429901326672445203235101919165483964194359460994881062089387893762814044257438204432573941083014827006090258925875161018096327732335800595831915976014208822304007327848132734933297885803213675261564962603340457220776826322500058091310967253976619973988033663666385188155212656268079501726223369693427999804134467810120772356498596945532366527400517575471969335854905274504119509592366013711954148258884879224599915203456315881034776553083676995718335598586395591169999570824515035017543533352697525287753332500527176569576894926734950469293596134095086603716860086302051544539652689091299099784588919052383463057789440565460681441902442399956419060521629604697347879024654313800186078316526964529288062740879011035175920059192178561473199006205896719435014765345518490882366607110905303449152556221163232127426440691921134648766635695850239231304591744215610985029636895406718880766308249227315984267542266259489684372223916445411015900506239419267909716320331208988978180868987431623710347617992356201449023892203230133009421463914291201346063125219636964261683591541014344239275340735690997732222069758773963390876360546515755280517042160525487302898122311669799679447530453600399342697032714458549591285939453949034981248114322322367238645042515984447890788917823576330019151696568654314153058547592091366014550143819685170068343700104677609041166369760080933413605498962382077778845599834907475953430787446201384567328530675275792962354883770806900827183685718353469574731680520621944540947734619035177180057973022652571032196598229259194875709994709721793154158686515748507274224181316948797104601068212015232921691482496346854413698719750190601102705274481050543239815130686073601076304512284549218459846046082253596762433827419060089029417044871218316020923109988915707117567n;
// var generator = 2n;
const hexString = `FFFFFFFF FFFFFFFF C90FDAA2 2168C234 C4C6628B 80DC1CD1
      29024E08 8A67CC74 020BBEA6 3B139B22 514A0879 8E3404DD
      EF9519B3 CD3A431B 302B0A6D F25F1437 4FE1356D 6D51C245
      E485B576 625E7EC6 F44C42E9 A637ED6B 0BFF5CB6 F406B7ED
      EE386BFB 5A899FA5 AE9F2411 7C4B1FE6 49286651 ECE45B3D
      C2007CB8 A163BF05 98DA4836 1C55D39A 69163FA8 FD24CF5F
      83655D23 DCA3AD96 1C62F356 208552BB 9ED52907 7096966D
      670C354E 4ABC9804 F1746C08 CA18217C 32905E46 2E36CE3B
      E39E772C 180E8603 9B2783A2 EC07A28F B5C55DF0 6F4C52C9
      DE2BCBF6 95581718 3995497C EA956AE5 15D22618 98FA0510
      15728E5A 8AAAC42D AD33170D 04507A33 A85521AB DF1CBA64
      ECFB8504 58DBEF0A 8AEA7157 5D060C7D B3970F85 A6E1E4C7
      ABF5AE8C DB0933D7 1E8C94E0 4A25619D CEE3D226 1AD2EE6B
      F12FFA06 D98A0864 D8760273 3EC86A64 521F2B18 177B200C
      BBE11757 7A615D6C 770988C0 BAD946E2 08E24FA0 74E5AB31
      43DB5BFC E0FD108E 4B82D120 A93AD2CA FFFFFFFF FFFFFFFF`;


const hexWithoutWhitespace = hexString.replace(/\s/g, "");

// const buffer2 = Buffer.from(hexWithoutWhitespace, 'hex');

// // Perform addition of the two buffers
// const sumBuffer = Buffer.alloc(Math.max(buffer1.length, buffer2.length) + 1);
// let carry = 0;
// for (let i = sumBuffer.length - 1; i >= 0; i--) {
//   const byte1 = buffer1[i] || 0;
//   const byte2 = buffer2[i] || 0;
//   const sum = byte1 + byte2 + carry;
//   sumBuffer[i] = sum & 0xFF;
//   carry = sum >> 8;
// }

// console.log('Sum:', sumBuffer.toString('hex'));

// const productBuffer = Buffer.alloc(buffer1.length + buffer2.length);
// for (let i = buffer1.length - 1; i >= 0; i--) {
//   let carry = 0;
//   for (let j = buffer2.length - 1; j >= 0; j--) {
//     const product = buffer1[i] * buffer2[j] + productBuffer[i + j + 1] + carry;
//     productBuffer[i + j + 1] = product & 0xFF;
//     carry = product >> 8;
//   }
//   productBuffer[i] = carry;
// }

// console.log('Product:', productBuffer.toString('hex'));

// // Perform exponentiation of the base buffer using the exponent buffer
// let resultBuffer = Buffer.from('01', 'hex'); // Initialize result buffer with 1
// for (let i = 0; i < buffer1.length; i++) {
//   const byte = buffer1[i];
//   for (let j = 7; j >= 0; j--) {
//     resultBuffer = multiplyBuffers(resultBuffer, resultBuffer); // Square the result buffer
//     if ((byte & (1 << j)) !== 0) {
//       resultBuffer = multiplyBuffers(resultBuffer, buffer2); // Multiply by the base buffer if the exponent bit is set
//     }
//   }
// }

// console.log('Result:', resultBuffer.toString('hex'));

// // Helper function to perform multiplication of two buffers
// function multiplyBuffers(buffer1, buffer2) {
//   const productBuffer = Buffer.alloc(buffer1.length + buffer2.length);
//   for (let i = buffer1.length - 1; i >= 0; i--) {
//     let carry = 0;
//     for (let j = buffer2.length - 1; j >= 0; j--) {
//       const product = buffer1[i] * buffer2[j] + productBuffer[i + j + 1] + carry;
//       productBuffer[i + j + 1] = product & 0xFF;
//       carry = product >> 8;
//     }
//     productBuffer[i] = carry;
//   }
//   return productBuffer;
// }

// const binaryRepresentation = BigInt(primeN).toString(2);

//2*2^1
// const Bob2 =crypto.createDiffieHellman(buffer2)
// Bob2.generateKeys()
//
// var startTime = performance.now()
// const Alice2= crypto.createDiffieHellman(buffer2)
// Alice2.generateKeys()
// Alice2.computeSecret(Bob2.getPublicKey())
// console.log(performance.now() - startTime)

function getRandomNbitBigIntAsync(bits) {
  // Generate random bytes with the length of the range
  const buf = crypto.randomBytes(Math.ceil(bits / 8));
  const bi = new BigInteger(buf.toString("hex"), 16);
  // Trim the result and then ensure that the highest bit is set
  return trimBigInt(bi, bits).setBit(bits - 1);
}
let primeN2 = new BigInteger(hexWithoutWhitespace, 16);
function trimBigInt(bi, bits) {
  const trimLength = bi.bitLength() - bits;
  return trimLength > 0 ? bi.shiftRight(trimLength) : bi;
}

function getRandomBigIntAsync(min, max) {
  const range = max.subtract(min).subtract(BigInteger.ONE);
  let bi;
  do {
    // Generate random bytes with the length of the range
    const buf = crypto.randomBytes(Math.ceil(range.bitLength() / 8));
    // Offset the result by the minimum value
    bi = new BigInteger(buf.toString("hex"), 16).add(min);
  } while (bi.compareTo(max) >= 0);

  // Return the result which satisfies the given range
  return bi;
}
let gen = new BigInteger("2");
let range = primeN2.subtract(BigInteger.ONE);


 var startTime = performance.now()
let AlicePri = getRandomBigIntAsync(gen, range);//normal
//2^priv % primnub
let AlicePub = gen.modPow(AlicePri, primeN2);
const shared = getRandomBigIntAsync(gen,range);
encryptAsync(shared.toString());
console.log(performance.now()-startTime);
//AlicePub = gen^priv % primnub,primeN2)
let BobPri = getRandomBigIntAsync(gen, range);
let BobPub = gen.modPow(BobPri, primeN2);
// console.log(AlicePub.toString())

//shared -> ratchet *
function stringToHex(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  let hex = "";

  for (let i = 0; i < data.length; i++) {
    const byte = data[i].toString(16).padStart(2, "0");
    hex += byte;
  }

  return hex;
}

function encryptAsync(m, k) {
  const tmpKey = getRandomBigIntAsync(
    BigInteger.ONE,
    primeN2.subtract(BigInteger.ONE)
  );
  const hexString = new BigInteger(stringToHex(m), 16);
  //2^k %primnumb
  const a = gen.modPow(tmpKey, primeN2);

  //(pub^k %primnumb *m) %primnumb
  const b = AlicePub.modPow(tmpKey, primeN2)
    .multiply(hexString)
    .remainder(primeN2);
  return { a, b };
}
function decryptAsync(m) {
  const p = primeN2;
  const r = getRandomBigIntAsync(gen, primeN2.subtract(BigInteger.ONE));

  const aBlind = gen.modPow(r, primeN2).multiply(m.a).remainder(primeN2);
  const ax = aBlind.modPow(AlicePri, primeN2);

  const plaintextBlind = ax
      .modInverse(primeN2)
      .multiply(m.b)
      .remainder(primeN2);
  const plaintext = AlicePub.modPow(r, primeN2)
      .multiply(plaintextBlind)
      .remainder(primeN2);
  const decoder = new TextDecoder();
  const plainer = decoder.decode(new Uint8Array(plaintext.toByteArray()));
  console.log(plainer);
  return plaintext;
}

// let m = encryptAsync("hello");
// console.log("encrypted");
// decryptAsync(m);
// console.log((2n^25505n) % 26000n)


//2^2n)
//2^6144
/** Generates BigInts between low (inclusive) and high (exclusive) */
// function generateRandomBigInt(lowBigInt, highBigInt) {
//   if (lowBigInt >= highBigInt) {
//     throw new Error("lowBigInt must be smaller than highBigInt");
//   }
//
//   const difference = highBigInt - lowBigInt;
//   const differenceLength = difference.toString().length;
//   let multiplier = "";
//   while (multiplier.length < differenceLength) {
//     multiplier += Math.random().toString().split(".")[1];
//   }
//   multiplier = multiplier.slice(0, differenceLength);
//   const divisor = "1" + "0".repeat(differenceLength);
//
//   const randomDifference = (difference * BigInt(multiplier)) / BigInt(divisor);
//
//   return lowBigInt + randomDifference;
// } //Master Math

// let p = crypto.createDiffieHellmanGroup('modp16');
// p.generateKeys()
// let Akeys = p.getPublicKey();

// console.log(Akeys)

// let aPriv = generateRandomBigInt(generator, primeN - 2n);//9999999999999999999999999999999
// let Apub = (generator ** aPriv) % primeN;

// let bPriv = generateRandomBigInt(generator, primeN - 2n);
// let Bpub = (generator **bPriv) % primeN;

// let Ashared = (Bpub ** aPriv) % primeN; //public other ^ private mine % PN
// let Bshared = (Apub **bPriv) % primeN;

// const string_to_char_code = ([...string]) => {
//   const array = string.map((char) => {
//   return char.charCodeAt(0);
// });
// return array;//[12,12,12]vfvf
// }

// function keyenc (message,key){   //[12,212]=4000*v

//   const enc = message.map(char=>{
//     return (BigInt(char)*key);})
//   return enc; //[4000,4000,4000]
// }

// let k = generateRandomBigInt(1000n,6300n)
// let r = generator ** k;
// let first = (Bpub ** k )
// let text = 'hello';

// let t=(keyenc(string_to_char_code(text),first))

// function dec(r,t,priv){
//     let ar = keyenc(t,r)
//     let dec = ar.map(char=>{
//         return (1n/char **priv)

//     })
//     return dec
// }

// console.log(dec(r,t,bPriv))

// // console.time("Run Time");')

// var endTime = performance.now()
// console.log('Time',endTime - startTime)
// // console.timeEnd("Run Time");

// console.log('Alice:',Ashared)
// console.log('BOB: ',Bshared)

// let AlocalMsgNum = 0;
// let AremoteMsgNum = 0;

// let BlocalMsgNum = 0;
// let BremoteMsgNum = 0;
// // Current ratchet key
// let ratchetKey;
// //11sk  ->1
// function deriveKey(key, msgNum) {
//   return crypto.createHmac("sha256", key).update(String(msgNum)).digest();
// }

//   function encrypt(msg) {
//     const iv = crypto.randomBytes(16);
//     const cipher = crypto.createCipheriv("aes-256-cbc", ratchetKey, iv);
//     return (
//       iv.toString("base64") +
//       cipher.update(msg, "utf8", "base64") +
//       cipher.final("base64")
//       );
//     }

//     function decrypt(enc) {
//       const iv = Buffer.from(enc.slice(0, 24), "base64");
//       const cipher = crypto.createDecipheriv("aes-256-cbc", ratchetKey, iv);
//       return cipher.update(enc.slice(24), "base64", "utf8") + cipher.final("utf8");
//     }

//     // //Alice  On sending a message

//     for(var i = 0; i <100;i++) {

//       ratchetKey = deriveKey(Ashared.toString(), AlocalMsgNum);
//       // console.log('Ratchet Key',ratchetKey)
//       let ciphertext = encrypt('YSjGpg7rM4PdcKsW1ldCNgb0EjM25eMYUR2wnyCpyM0MOBNnKHMFXk4Hr8ycs4FCCUjlUB9z24ZXeQzz1FJKZcTbhj0wYCL2ykuRC3ctURLy9NJ0RH9QA4RFz41ufg3H6mWDqffuuFvgZmdouufd2tSQgEOATHdQGOjioHRnvmOGz1hiMG7gPRl1duRn2W6cdHkFRpkg7N4AcacfNXfEcOphbIYohkUEu1af4tebpAenPe4MIKQfdzG2SvVli09KyX7EXa58jkzMAESIH2hnyce32uYN2RpW3b5ASqMWM3mOszACviIQcnFUm2ZnPLYmhlFW2uCStnMmH4xYjzAkT9fOcxBykSRKJAQGWnUnGgBYWyLx8RJ5Ie5AAvCSqer52TQLLfRRR5xgtGQruhu1HvtWXx0cwuIsTOBumlI0grRRQvrIesUX3fCqZOagBftWsPThbSLPpzwYcz6FlLESueYzQV4crYicFLC7NcBGveYXYB2icawRDK3ml2d3b8tDrckwfl8aNHFiRwZYSHw8TGMKeU85KXRDLlzeu0uy81lIXAro4G4Ir3aeYelTwS1LvyuA8VjiguLvvHKrZ7m9LVM1TleN4G8xQlYk2LRMSpjSZ3rTI3TVvpEBrWjEwVu9dFbi89PUEFD2Vyr0wwCGPOzQf1bc24eIbHcP4TQ8YLX0O39atvQ5suutVKJ6ovGFLJ9TwJKueeaDITsZblBaFwlipWP5ji280bXghaEpZ2gtGOHd9YsG88YoNp6UTQCNWh6fVBuQW1023xjCAkeXgDXolM1yCaqxZjydc7tl8khc4WpsLkPz1p15mSAjKZydEie0s1TnCAb02LQLb6T55qjReX9fSA2LOgCAIAFFVcCgFh94MCqNX9WA55jr2x3fttINoWm0bgHP5jvh7LSUWqcICnoAJL3ZCSgOIYyAapiapcDDozc8LyJoka5Ou4L9nhfxS9I3xTU8U0M49fJojCSITpA1cxkw5p6e69bq1b4PDGGtpX6sgeeyhWVssO55');
// // console.log('encrypted',ciphertext);
//       AlocalMsgNum++;

// // ratchetKey = deriveKey(Ashared, AlocalMsgNum);
// // console.log('AlocalMsgNUM',AlocalMsgNum);
// // On receiving a message
// var startTime = performance.now()
// ratchetKey = deriveKey(Bshared.toString(), BremoteMsgNum);
// let plaintext = decrypt(ciphertext);
// // console.log('DECRYPTED',plaintext)
// BremoteMsgNum++;
// var endTime = performance.now()
// console.log('Time',endTime - startTime)
// // // ratchetKey = deriveKey(rootKey, BremoteMsgNum);
// }
// f4a1920972549cc3daf4733a85e2719201d3743a067dba9f1fdb2fd6f59595e0

// iv = crypto.randomBytes(16);
// var message='Hello';
// var key = crypto.randomBytes(32);
// const u = new Uint8Array(key);
// var r = crypto.getRandomValues(u)
// let i=0
// r.forEach(element => {
//     console.log(i++);

// });

// console.log("message => ", message);
// var cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
// // console.log(cipher);
// var encrypted = cipher.update(message,'utf-8','hex');
// encrypted+= cipher.final('hex')
// console.log("encrypted =>",encrypted);
// var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
// var decrypted = decipher.update(encrypted,'hex','utf-8');
// decrypted+= decipher.final('utf-8')

// console.log("decrypted =>",decrypted);

// const crypto = require('crypto');

// // Alice generates identity and pre-key pairs
// const aliceIdentityKeyPair = crypto.generateKeyPairSync('x25519');
// const alicePreKeyPair = crypto.generateKeyPairSync('x25519');

// // Bob generates identity and pre-key pairs
// const bobIdentityKeyPair = crypto.generateKeyPairSync('x25519');
// const bobPreKeyPair = crypto.generateKeyPairSync('x25519');

// // Alice wants to send a message to Bob
// const aliceEphemeralKeyPair = crypto.generateKeyPairSync('x25519');

// // Alice generates a shared secret with Bob's pre-key and her ephemeral key
// const aliceSharedSecret = crypto.diffieHellman({
//     privateKey: aliceEphemeralKeyPair.privateKey,
//     publicKey: bobPreKeyPair.publicKey
// });

// // Alice encrypts the message using the shared secret
// const message = 'Hello Bob!';
// const cipher = crypto.createCipheriv('aes-256-gcm', aliceSharedSecret, crypto.randomBytes(12));
// let encryptedMessage = cipher.update(message, 'utf8', 'hex');
// encryptedMessage += cipher.final('hex');

// // Alice sends the encrypted message and her ephemeral public key to Bob
// const messagePackage = {
//     encryptedMessage: encryptedMessage,
//     ephemeralPublicKey: aliceEphemeralKeyPair.publicKey
// };

// // Bob receives the message and generates a shared secret
// const bobEphemeralKeyPair = crypto.generateKeyPairSync('x25519');
// const bobSharedSecret = crypto.diffieHellman({
//     privateKey: bobEphemeralKeyPair.privateKey,
//     publicKey: aliceEphemeralPublicKey
// });

// // Bob decrypts the message using the shared secret
// const decipher = crypto.createDecipheriv('aes-256-gcm', bobSharedSecret, cipher.getIV());
// let decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf8');
// decryptedMessage += decipher.final('utf8');
// console.log('Received message from Alice:', decryptedMessage);

// // Bob generates a new ephemeral key pair and sends his new public key to Alice
// const messagePackage2 = {
//     newEphemeralPublicKey: bobEphemeralKeyPair.publicKey
// };

// // Bob generates a new shared secret with Alice's ephemeral public key and his new ephemeral private key
// const bobNewSharedSecret = crypto.diffieHellman({
//     privateKey: bobEphemeralKeyPair.privateKey,
//     publicKey: aliceEphemeralPublicKey
// });

// // Bob can now reply to Alice using the new shared secret
// const message2 = 'Hi Alice!';
// const cipher2 = crypto.createCipheriv('aes-256-gcm', bobNewSharedSecret, crypto.randomBytes(12));
// let encryptedMessage2 = cipher2.update(message2, 'utf8', 'hex');
// encryptedMessage2 += cipher2.final('hex');

// // Bob sends the encrypted message to Alice
// const messagePackage3 = {
//     encryptedMessage: encryptedMessage2
// };

// // Alice receives the message and generates a new shared secret
// const aliceNewSharedSecret = crypto.diffieHellman({
//     privateKey: aliceEphemeralKeyPair.privateKey,
//     publicKey: bobNewEphemeralPublicKey
// });

// // Alice decrypts the message using the new shared secret
// const decipher2 = crypto.createDecipheriv('aes-256-gcm', aliceNewSharedSecret, cipher2.getIV());
// let decryptedMessage2 = decipher2.update(encryptedMessage2, 'hex', 'utf8');
// decryptedMessage2 += decipher2.final('utf8');
// console.log('Received message from Bob:', decryptedMessage2);
