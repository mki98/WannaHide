const crypto = require("crypto");

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

console.time("Run Time");

// const crypto = require("crypto");

var primeN =
  5809605995369958062791915965639201402176612226902900533702900882779736177890990861472094774477339581147373410185646378328043729800750470098210924487866935059164371588168047540943981644516632755067501626434556398193186628990071248660819361205119793693985433297036118232914410171876807536457391277857011849897410207519105333355801121109356897459426271845471397952675959440793493071628394122780510124618488232602464649876850458861245784240929258426287699705312584509625419513463605155428017165714465363094021609290561084025893662561222573202082865797821865270991145082200656978177192827024538990239969175546190770645685893438011714430426409338676314743571154537142031573004276428701433036381801705308659830751190352946025482059931306571004727362479688415574702596946457770284148435989129632853918392117997472632693078113129886487399347796982772784615865232621289656944284216824611318709764535152507354116344703769998514148343807n;
var generator = 2n;

/** Generates BigInts between low (inclusive) and high (exclusive) */
function generateRandomBigInt(lowBigInt, highBigInt) {
  if (lowBigInt >= highBigInt) {
    throw new Error("lowBigInt must be smaller than highBigInt");
  }

  const difference = highBigInt - lowBigInt;
  const differenceLength = difference.toString().length;
  let multiplier = "";
  while (multiplier.length < differenceLength) {
    multiplier += Math.random().toString().split(".")[1];
  }
  multiplier = multiplier.slice(0, differenceLength);
  const divisor = "1" + "0".repeat(differenceLength);

  const randomDifference = (difference * BigInt(multiplier)) / BigInt(divisor);

  return lowBigInt + randomDifference;
} //Master Math

// // let Apriv = generateRandomBigInt(generator, primeN - 2n);
// // let Apub = (generator ^ Apriv) % primeN;

// // let Bpriv = generateRandomBigInt(generator, primeN - 2n);
// // let Bpub = (generator ^ Bpriv) % primeN;

let a = generateRandomBigInt(generator, primeN - 2n);
let A = (generator ^ a) % primeN;

let b = generateRandomBigInt(generator, primeN - 2n);
let B = (generator ^ b) % primeN;

let Ashared = (B ^ a) % primeN; //public other ^ private mine % PN

let Bshared = (A ^ b) % primeN;

// console.log('Alice:',Ashared)
// console.log('BOB: ',Bshared)

let AlocalMsgNum = 0;
let AremoteMsgNum = 0;

let BlocalMsgNum = 0;
let BremoteMsgNum = 0;
// Current ratchet key
let ratchetKey;
//11sk  ->1
function deriveKey(key, msgNum) {
  return crypto.createHmac("sha256", key).update(String(msgNum)).digest();
}
console.log(deriveKey(
  "2586227719797456814289419216188962712157399470047149108741031771022060889805490616622061784904753264831983407114761272386832537449993124253287606593147760815887345502897149721123526663600219701546640231343938192651132243252019763101812379219270093088458899207672635160916038400362970920061635066702422740560940819580400310972171555040473166853852692580131180285397576386922123578216144342898828680105962999773242651374345492757793802759734460509498324839206387319497820756928451261165225767138377469958086823373915025156896450334319293847972485577139981381729039734900554377120389364453656028999479759375671668703830126415303200367550923666189702680582902011291977950116657321748497081320265659783732089857688724446447264973355093728684007071342041512378590879789948935847471624140716789818495178237824504829701228865065825284958226622509058589982582338813235831259772689659761460917942151436784654988291553165425832352382946"
,0).toString());
function encrypt(msg) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", ratchetKey, iv);
  return (
    iv.toString("base64") +
    cipher.update(msg, "utf8", "base64") +
    cipher.final("base64")
  );
}

function decrypt(enc) {
  const iv = Buffer.from(enc.slice(0, 24), "base64");
  const cipher = crypto.createDecipheriv("aes-256-cbc", ratchetKey, iv);
  return cipher.update(enc.slice(24), "base64", "utf8") + cipher.final("utf8");
}

// //Alice  On sending a message

// for(var i = 0; i <2;i++) {
// ratchetKey = deriveKey(Ashared.toString(), AlocalMsgNum);
// console.log('Ratchet Key',ratchetKey)
// let ciphertext = encrypt('Heelooooo');
// console.log('encrypted',ciphertext);
// AlocalMsgNum++;
// // ratchetKey = deriveKey(Ashared, AlocalMsgNum);
// console.log('AlocalMsgNUM',AlocalMsgNum);
// // On receiving a message
// ratchetKey = deriveKey(Bshared.toString(), BremoteMsgNum);
// let plaintext = decrypt(ciphertext);
// console.log('DECRYPTED',plaintext)
// BremoteMsgNum++;
// console.log('BREMOTE',BremoteMsgNum)

// // // ratchetKey = deriveKey(rootKey, BremoteMsgNum);
// }
// f4a1920972549cc3daf4733a85e2719201d3743a067dba9f1fdb2fd6f59595e0

console.timeEnd("Run Time");

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
