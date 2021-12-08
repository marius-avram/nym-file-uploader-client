import React, { useCallback, useEffect, useState } from 'react';
import styles from '../styles/Components.module.css';
import { Row, Col, Upload, Switch, Input, message, Button } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faUpload } from '@fortawesome/free-solid-svg-icons'
import { UploadRequestOption } from 'rc-upload/lib/interface';
import { MixnetHook } from '../hooks/Mixnet.hook';
import { FileServiceProviderOps, Operations } from '../hooks/FileServiceProviderOps.hook';
import CryptoOps from '../hooks/CryptoOps.hook';
import md5 from 'md5';
import { LocalStorageOps } from '../hooks/LocalStorageOps';

const { Dragger } = Upload;

export function FileUploader() {
  const { addOperationToBuffer } = FileServiceProviderOps();
  const { encryptArray, decryptArray } = CryptoOps()
  const { saveMd5Sum } = LocalStorageOps();
  const { binaryResponse, sendSelfAddressRequest, sendBinaryMessageToMixNet, waitForBinaryReply } = MixnetHook();

  useEffect(() => {
    if (window.CONNECTION != null) {
      sendSelfAddressRequest();
    }
  }, [window.CONNECTION, sendSelfAddressRequest]);

  // Handler for receiving a file binary content
  useEffect(() => {
    handleReceivingReponse();
  }, [binaryResponse]);

  const createDownloadLink = useCallback((arrayBuffer: ArrayBuffer) => {
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
  }, []);

  const handleReceivingReponse = useCallback(() => {
    if (binaryResponse != null) {
      const decoder = new TextDecoder();
      const response = decoder.decode(binaryResponse);
      if (response == "OK") {
        const successMessage = "File saved on service provider. Response is '" + response + "'";
        message.success(successMessage);
      }
      else {
        const errorMessage = "Something wrong happend";
        message.error(errorMessage);
      }
    }
  }, [binaryResponse, decryptArray, createDownloadLink])


  const customRequestUploader = useCallback((options: UploadRequestOption) => {
    const { onSuccess, file } = options;
    // Initialise response handler
    waitForBinaryReply();
    // Send message with the encrypted file
    (file as Blob)
      .arrayBuffer()
      .then((arrayBuffer : ArrayBuffer) => {
        encryptArray(new Uint8Array(arrayBuffer), "superprotective").then((encryptedArray: ArrayBuffer) => {
          const fileMd5Sum = md5(new Uint8Array(encryptedArray));
          saveMd5Sum(fileMd5Sum);
          const arrayBufferWithOp = addOperationToBuffer(Operations.WRITE_ENCRYPTED_FILE, encryptedArray);
          console.debug("sending message");
          sendBinaryMessageToMixNet(arrayBufferWithOp);
          onSuccess!("Sent to mixnet");
        }).catch((error: any) => {
          console.error("Failed to send file");
          console.error(error);
        });
      });
  // eslint-disable-next-line
  }, [waitForBinaryReply, addOperationToBuffer, encryptArray, sendBinaryMessageToMixNet])

  const props = {
    multiple: false,
    customRequest: customRequestUploader,
    onDrop(e: React.DragEvent<HTMLDivElement>) {
      console.debug('Dropped files', e.dataTransfer.files);
    },
    showUploadList: {
      showDownloadIcon: false,
      showRemoveIcon: false
    }
  };

  const onEncryptionChange = () => {
    console.log("toggled encryption button");
  }

  return <>
    <div>
      <Row className={`${styles.toggleWrapper} ${styles.greyBorderTop}`}>
          <Col span={4}>
            <h4>Store encrypted file</h4>
          </Col>
          <Col span={10}>
            <Switch defaultChecked disabled onChange={onEncryptionChange} />
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
          <Button className={styles.bigCustomButton}>
            <FontAwesomeIcon className={styles.bigIconSize} icon={faUpload} />
          </Button>
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">
            Support for a single upload
        </p>
      </Dragger>
    </div>
   
  </>
}