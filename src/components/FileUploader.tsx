import React, { useEffect } from 'react';
import styles from '../styles/Components.module.css';
import { Row, Col, Upload, Switch, Input } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faUpload } from '@fortawesome/free-solid-svg-icons'
import { UploadRequestOption } from 'rc-upload/lib/interface';
import { MixnetHook } from '../hooks/Mixnet.hook';
import { FileServiceProviderOps, Operations } from '../hooks/FileServiceProviderOps.hook';
import CryptoOps from '../hooks/CryptoOps.hook';

const { Dragger } = Upload;

export function FileUploader() {
  const { addOperationToBuffer } = FileServiceProviderOps();
  const { encryptArray } = CryptoOps()
  const { connection, sendSelfAddressRequest, sendBinaryMessageToMixNet} = MixnetHook();

  useEffect(() => {
    if (connection != null) {
      sendSelfAddressRequest();
    }
  }, [connection, sendSelfAddressRequest]);

  const props = {
    multiple: false,
    customRequest: (options: UploadRequestOption) => {
        const { onSuccess, onError, file, onProgress } = options;

        (file as Blob)
          .arrayBuffer()
          .then((arrayBuffer : ArrayBuffer) => {
              encryptArray(new Uint8Array(arrayBuffer), "superprotective");
                const arrayBufferWithOp = addOperationToBuffer(Operations.WRITE_ENCRYPTED_FILE, arrayBuffer);
                sendBinaryMessageToMixNet(arrayBufferWithOp);
              //})
          });
    },
    onDrop(e: React.DragEvent<HTMLDivElement>) {
      console.debug('Dropped files', e.dataTransfer.files);
    },
  };

  const onEncryptionChange = () => {
    console.log("toggled button");
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
    </div>
   
  </>
}