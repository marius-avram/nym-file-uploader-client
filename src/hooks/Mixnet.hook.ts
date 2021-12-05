import { useCallback, useEffect, useState } from "react";
import { Config } from "../config/Config";
import AddressConverter from "./AddressConverter.hook";


export function MixnetHook() {
  const { fromStringToBase58 } = AddressConverter();

  const SEND_REQUEST_TAG = 0x00;
  const SELF_ADDRESS_REQUEST_TAG = 0x02
  const WITH_REPLY_SURB = 0x01;

  const [connection, setConnection] = useState<WebSocket>();

  const connectWebsocket = useCallback(() => {
    if (connection === undefined) {
      var server = new WebSocket(Config.nymClientUrl);
      server.onopen = function () {
          console.debug("Connection to Websocket initialised");
          setConnection(server);
      };
      server.onerror = function (err) {
          console.error("Failed to establish connection with Websocket " + err)
      };
    }
  }, [connection]);

  // This has a effect that if imported in too many places it will initialise multiple socket connections
  useEffect(() => {
    connectWebsocket();
  }, [connectWebsocket])

  // utility function to convert number to byte array, big-endian order
  const numberToBytesArray = (n: number, maxLength: number) : Uint8Array => {
    if (!n) return new Uint8Array(0)
    const a = []
    a.unshift(n & 255)
    while (n >= 256) {
      n = n >>> 8
      a.unshift(n & 255)
    }
    while (a.length < maxLength) {
      a.unshift(0);
    }
    return new Uint8Array(a);
  }

  const buildSendBinaryRequest = useCallback((content: ArrayBuffer) => {
    const messageArray = new Uint8Array(content);
    const messageLength = messageArray.length;
    
    const requestTagArray = Uint8Array.from([SEND_REQUEST_TAG]);
    const replySurbArray = Uint8Array.from([WITH_REPLY_SURB]);
    const addressArray = fromStringToBase58(Config.fileServiceProviderAddress);
    // message length can be maximum 64 bits unsigned int
    const messageLengthArray = numberToBytesArray(messageLength, 8);

    let request = new Uint8Array(requestTagArray.length + replySurbArray.length + addressArray.length + messageLengthArray.length + messageLength);
    request[0] = SEND_REQUEST_TAG;
    request[1] = WITH_REPLY_SURB;
    request.set(addressArray, 2);
    request.set(messageLengthArray, 2 + addressArray.length);
    request.set(messageArray, 2 + addressArray.length + messageLengthArray.length)
    return request;
  }, [fromStringToBase58]);

  const buildSelfAddressRequest = useCallback(() => {
    return Uint8Array.from([SELF_ADDRESS_REQUEST_TAG]);
  }, []);

  const sendSelfAddressRequest = useCallback(() => {
    if (connection != null) {
      const request = buildSelfAddressRequest();
      connection.send(request)
    }
  }, [buildSelfAddressRequest, connection])

  const sendBinaryMessageToMixNet = useCallback((arrayBuffer: ArrayBuffer) => {
    if (connection != null) {
      const request = buildSendBinaryRequest(arrayBuffer);
      connection.send(request)
    }
  }, [buildSendBinaryRequest, connection]);


  return {
    connection: connection,
    sendSelfAddressRequest: sendSelfAddressRequest,
    sendBinaryMessageToMixNet: sendBinaryMessageToMixNet
  }
}