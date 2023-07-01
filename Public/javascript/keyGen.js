export function getRandomBigInt(min, max) {
  const range = max.subtract(min).subtract(BigInteger.ONE);
  let bi;
  do {
    const randomBytes = new Uint8Array(Math.ceil(range.bitLength() / 8));
    const xi = window.crypto.getRandomValues(randomBytes);

    bi = new BigInteger(xi.toString(), 9).add(min);
  } while (bi.compareTo(max) >= 0);

  return bi;
}

const hexStringPrime = `FFFFFFFF FFFFFFFF C90FDAA2 2168C234 C4C6628B 80DC1CD1
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

const hexWithoutWhitespace = hexStringPrime.replace(/\s/g, "");

const primeN = new BigInteger(hexWithoutWhitespace, 16);
const generator = new BigInteger("2");

export class KeyPairs {
  constructor() {
    this.privateKey = getRandomBigInt(
      generator,
      primeN.subtract(BigInteger.ONE)
    );
    this.publicKey = generator.modPow(this.privateKey, primeN);
  }
}

export function generateSharedKey(otherPublicKey) {
  otherPublicKey = new BigInteger(otherPublicKey);
  const randomNum = getRandomBigInt(
    generator,
    new BigInteger(
      "63585284600436381658322863343765824713833556711531452417353425939091340218150436807075666095477334154189855192966556599508901427682071512914823578100312336395518425598215481350395770682044377017472480219386226844057707656174388034598534637082370272755997072701431723495561672684016434828934239757912453526679"
    )
  );
  const shared = Elgamal.prototype.encryptGamal(
    randomNum.toString(),
    otherPublicKey
  );

  return { shared, localShared: randomNum.toString() };
}

export class Elgamal {
  stringToHex(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    let hex = "";

    for (let i = 0; i < data.length; i++) {
      const byte = data[i].toString(16).padStart(2, "0");
      hex += byte;
    }

    return hex;
  }
  //public key of reciver
  encryptGamal(m, pubKey) {
    const tmpKey = getRandomBigInt(
      BigInteger.ONE,
      primeN.subtract(BigInteger.ONE)
    );
    const hexString = new BigInteger(this.stringToHex(m), 16);
    //2^k %primnumb
    const a = generator.modPow(tmpKey, primeN);

    //(pub^k %primnumb *m) %primnumb
    const b = pubKey
      .modPow(tmpKey, primeN)
      .multiply(hexString)
      .remainder(primeN);
    let bstr = b.toString();
    let astr = a.toString();
    return { astr, bstr };
  }

  //reciver only needs an object with a and b

  decryptGamal(m, privKey, pubKey) {
    m.a = new BigInteger(m.astr);
    m.b = new BigInteger(m.bstr);
    privKey = new BigInteger(privKey);
    pubKey = new BigInteger(pubKey);
    const r = getRandomBigInt(generator, primeN.subtract(BigInteger.ONE));

    const decoder = new TextDecoder();
    const aBlind = generator.modPow(r, primeN).multiply(m.a).remainder(primeN);
    const ax = aBlind.modPow(privKey, primeN);

    const plaintextBlind = ax
      .modInverse(primeN)
      .multiply(m.b)
      .remainder(primeN);
    const plaintext = pubKey
      .modPow(r, primeN)
      .multiply(plaintextBlind)
      .remainder(primeN);
    const plainer = decoder.decode(new Uint8Array(plaintext.toByteArray()));
    return plainer;
  }
}
