import React, { useEffect } from 'react';
import styles from '../styles/Components.module.css';
import { Row, Col, Upload, Switch, Input } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faUpload } from '@fortawesome/free-solid-svg-icons'
import { UploadRequestOption } from 'rc-upload/lib/interface';
import { MixnetHook } from '../hooks/Mixnet.hook';
import { FileServiceProviderOps, Operations } from '../hooks/FileServiceProviderOps.hook';
import CryptoOps from '../hooks/CryptoOps.hook';
import md5 from 'md5';

const { Dragger } = Upload;

export function FileUploader() {
  const { addOperationToBuffer } = FileServiceProviderOps();
  const { encryptArray, decryptArray } = CryptoOps()
  const { connection, binaryResponse, sendSelfAddressRequest, sendBinaryMessageToMixNet, waitForBinaryReply } = MixnetHook();

  useEffect(() => {
    if (connection != null) {
      sendSelfAddressRequest();
    }
  }, [connection, sendSelfAddressRequest]);

  // Handler for receiving a file binary content
  useEffect(() => {
    if (binaryResponse != null) {
      decryptArray(new Uint8Array(binaryResponse), "superprotective").then((decryptedArray: ArrayBuffer) => {
        createDownloadLink(decryptedArray)
      });
    }
  }, [binaryResponse, decryptArray])


  const createDownloadLink = (arrayBuffer: ArrayBuffer) => {
    const fileBlob = new  Blob([new Uint8Array(arrayBuffer)]);
    const downloadContainer = document.getElementById('downloadContainer');
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(fileBlob);
    a.href = url;
    a.text = "Download file here";
    a.download = 'received_filename';
    if (downloadContainer?.firstChild != null) {
      downloadContainer.removeChild(downloadContainer.childNodes[0])
    }
    downloadContainer?.appendChild(a);
  }

  const props = {
    multiple: false,
    customRequest: (options: UploadRequestOption) => {
      const { onSuccess, onError, file, onProgress } = options;
      // Initialise response handler
      waitForBinaryReply();
      // Send message with the encrypted file
      (file as Blob)
        .arrayBuffer()
        .then((arrayBuffer : ArrayBuffer) => {
          encryptArray(new Uint8Array(arrayBuffer), "superprotective").then((encryptedArray: ArrayBuffer) => {
            const fileMd5Sum = md5(new Uint8Array(encryptedArray));
            console.log("fileMd5Sum " + fileMd5Sum);
            const arrayBufferWithOp = addOperationToBuffer(Operations.WRITE_ENCRYPTED_FILE, encryptedArray);
            sendBinaryMessageToMixNet(arrayBufferWithOp);
          });
        });
    },
    onDrop(e: React.DragEvent<HTMLDivElement>) {
      console.debug('Dropped files', e.dataTransfer.files);
    },
  };

  const onEncryptionChange = () => {
    console.log("toggled encryption button");
  }

  return <>
    <div>
      <Row className={styles.toggleWrapper}>
          <Col span={4}>
            <h4>Store encrypted file</h4>
          </Col>
          <Col span={10}>
            <Switch defaultChecked onChange={onEncryptionChange} />
          </Col>
          <Col span={10} className={styles.pullTextRight}>
            <h5>*Depends if its a private or public file</h5>
          </Col>
      </Row>
      <Row className={styles.toggleWrapper}>
          <Col span={4}>
            <h4>Encryption key</h4>
          </Col>
          <Col span={20}>
            <Input.Password placeholder="Type encryption key" defaultValue="superprotective" />
          </Col>
      </Row>
      <Dragger {...props}>
        <p>
            <FontAwesomeIcon className={styles.bigIconSize} icon={faUpload} />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">
            Support for a single upload
        </p>
      </Dragger>
      <div id="downloadContainer"></div>
    </div>
   
  </>
}