import md5 from 'md5';

export default function CryptoOps() {

  const IV_VALUE = '4nVyzFUSBQSeMp1Q'; // 128 bits - 16 bytes

  function encryptArray(arrayBuffer: Uint8Array, password: string) : Promise<ArrayBuffer> {
    const textEncoder = new TextEncoder()
    let iv = textEncoder.encode(IV_VALUE);
    // will make the md5 sum of the password to have it of fixed size (256 bits - 32 bytes)
    const password_md5 = md5(password)
    const key: Uint8Array = textEncoder.encode(password_md5);

    return crypto.subtle.importKey(  "raw",  key.buffer,  'AES-CTR' , false,  ["encrypt", "decrypt"]).then((cryptoKey: CryptoKey) => {
      return window.crypto.subtle.encrypt(
        {
          name: "AES-CTR",
          counter: iv,
          length: 128
        },
        cryptoKey,
        arrayBuffer
      );
    });
    
  }
  
  function decryptArray(arrayBuffer: Uint8Array, password: string) : Promise<ArrayBuffer> {
    const textEncoder = new TextEncoder()
    let iv = textEncoder.encode(IV_VALUE);
    // will make the md5 sum of the password to have it of fixed size (256 bits - 32 bytes)
    const password_md5 = md5(password)
    const key: Uint8Array = textEncoder.encode(password_md5);

    return crypto.subtle.importKey(  "raw",  key.buffer,  'AES-CTR' , false,  ["encrypt", "decrypt"]).then((cryptoKey: CryptoKey) => {
      return window.crypto.subtle.decrypt(
        {
          name: "AES-CTR",
          counter: iv,
          length: 128
        },
        cryptoKey,
        arrayBuffer
      );
    });
  }

  return {
    encryptArray,
    decryptArray
  }
}