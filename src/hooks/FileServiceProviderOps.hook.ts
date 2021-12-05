
export class Operations {
  static WRITE_ENCRYPTED_FILE = 0x01;
}

export function FileServiceProviderOps() {
  
  const addOperationToBuffer = (operation: number, arrayBuffer: ArrayBuffer) : ArrayBuffer => {
    let bufferWithOperation = new ArrayBuffer(1 + arrayBuffer.byteLength);
    let viewWithOperation = new Uint8Array(bufferWithOperation); 
    viewWithOperation[0] = operation;
    viewWithOperation.set(new Uint8Array(arrayBuffer), 1);
    return viewWithOperation.buffer;
  }

  return {
    addOperationToBuffer: addOperationToBuffer
  }
}