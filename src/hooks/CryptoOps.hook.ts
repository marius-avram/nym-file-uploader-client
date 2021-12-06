const themis = require('wasm-themis');

export default function CryptoOps() {

    function getThemisSecureCell(password: Uint8Array) {
      themis.initialized.then(() => {
        console.log("cacao");
      });
    }

    function encryptArray(arrayBuffer: Uint8Array, password: string) {
      const textEncoder = new TextEncoder()
      const passwordArray: Uint8Array = textEncoder.encode(password);
      getThemisSecureCell(passwordArray);

      //return encryptLib.encryptUint8Array(arrayBuffer, passwordArray)
    }

    function decryptArray(arrayBuffer: Uint8Array, password: string) {
      const textEncoder = new TextEncoder()
      const passwordArray: Uint8Array = textEncoder.encode(password);
      //return encryptLib.decryptUint8Array(arrayBuffer, passwordArray);
    }
    
    return {
        encryptArray,
        decryptArray
    }
}