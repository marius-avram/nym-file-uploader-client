import  * as base58  from 'bs58'; 

export default function AddressConverter() {
  const fromStringToBase58 = (address: string) : Uint8Array => {
    const tokens = address.split("@");
    const gatewayAddress = tokens[1];
    const clientTokens = tokens[0].split(".");
    const clientIdentity = clientTokens[0];
    const clientEncryptionKey = clientTokens[1];

    // All of them should be 32 bytes in length
    let base58CompleteAddress = new Uint8Array(96);
    base58CompleteAddress.set(new Uint8Array(base58.decode(clientIdentity)), 0);
    base58CompleteAddress.set(new Uint8Array(base58.decode(clientEncryptionKey)), 32)
    base58CompleteAddress.set(new Uint8Array(base58.decode(gatewayAddress)), 64)
    return base58CompleteAddress;
  }

  return {
    fromStringToBase58: fromStringToBase58
  }
}