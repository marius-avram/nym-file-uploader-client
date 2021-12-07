import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, List, message, Modal, Row } from 'antd';
import styles from '../styles/Components.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTrashAlt, faUpload } from '@fortawesome/free-solid-svg-icons';
import { LocalStorageOps } from '../hooks/LocalStorageOps';
import { MixnetHook } from '../hooks/Mixnet.hook';
import { FileServiceProviderOps, Operations } from '../hooks/FileServiceProviderOps.hook';
import CryptoOps from '../hooks/CryptoOps.hook';

export default function EncryptedFilesList() {
  const { addOperationToBuffer } = FileServiceProviderOps();
  const { decryptArray } = CryptoOps();
  const { binaryResponse, sendBinaryMessageToMixNet, waitForBinaryReply, setOnBinaryMessageFromMixNet } = MixnetHook();
  const { updatedCount: fileListUpdatedCount, getSavedFiles, removeMd5Sum } = LocalStorageOps();

  const [items, setItems] = useState<Array<string>>();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [itemToBeDeleted, setItemToBeDeleted] = useState<string>('');

  /// Every time the local storage changes we reload the items from the state of this component
  useEffect(() => {
    const filesMetadata = getSavedFiles();
    const localItems = [];
    for (const [md5sum, datestr] of Object.entries(filesMetadata)) {
      localItems.push(md5sum + " created @ " + datestr);
    }
    setItems(localItems);
  }, []);

  // Handler for receiving a file binary content
  useEffect(() => {
    handleReceivingFile();
  }, [binaryResponse])

  const createDownloadLink = useCallback((arrayBuffer: ArrayBuffer) => {
    const fileBlob = new  Blob([new Uint8Array(arrayBuffer)]);
    const downloadContainer = document.getElementById('downloadContainer');
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(fileBlob);
    a.href = url;
    a.text = "Press here to save it locally";
    a.download = 'received_filename';
    if (downloadContainer?.firstChild != null) {
      downloadContainer.removeChild(downloadContainer.childNodes[0]);
    }
    downloadContainer?.appendChild(a);
  }, []);

  const handleReceivingFile = useCallback(() => {
    if (binaryResponse != null) {
      decryptArray(new Uint8Array(binaryResponse), "superprotective").then((decryptedArray: ArrayBuffer) => {
        const successMessage = "File downloaded, click the link to store it locally";
        message.success(successMessage);
        createDownloadLink(decryptedArray);
        // Set handler to not do anything for the moment
        setOnBinaryMessageFromMixNet(() => {});
      });
    }
  }, [binaryResponse, decryptArray, createDownloadLink]);

  const getMd5FromItem = useCallback((item: string) => {
    return item.split(" ")[0];
  }, []);

  const initDownloadFile = useCallback((item: string) => {
    console.debug("initDownloadFile");
    const md5sum = getMd5FromItem(item);
    const textEncoder = new TextEncoder();
    const arrayBuffer = textEncoder.encode(md5sum);
    const arrayBufferWithOp = addOperationToBuffer(Operations.READ_ENCRYPTED_FILE, arrayBuffer);
    // Initialise response handler
    waitForBinaryReply();
    sendBinaryMessageToMixNet(arrayBufferWithOp);
  }, [getMd5FromItem, waitForBinaryReply, sendBinaryMessageToMixNet]);

  const openDeleteModal = useCallback((item : string) => {
    const md5sum = getMd5FromItem(item);
    setItemToBeDeleted(md5sum);
    setIsModalVisible(true);
  }, [setItemToBeDeleted, setIsModalVisible])

  const handleModalCancel = useCallback(() => {
    console.log("cancel");
    setIsModalVisible(false);
  }, [setIsModalVisible]);

  const removeItem = useCallback(() => {
    console.debug("delete from local storage");
    removeMd5Sum(itemToBeDeleted);
  }, [itemToBeDeleted])

  return <>
    <div className={styles.listWrapper}>
      <List
        bordered
        dataSource={items}
        renderItem={ item => 
          <List.Item key={getMd5FromItem(item)}>
            <Row className={styles.listItemRow}>
              <Col span={20}>
                <span className={styles.listItemText}>{item}</span>
              </Col>
              <Col span={4}>
                <span>
                  <Button className={styles.customButton} onClick={() => initDownloadFile(item)}>
                    <FontAwesomeIcon className={`${styles.mediumIconSize} ${styles.greenColor}`} icon={faDownload} />
                  </Button>
                  <Button className={styles.customButton} onClick={() => openDeleteModal(item)}>
                    <FontAwesomeIcon className={`${styles.mediumIconSize} ${styles.redColor}`} icon={faTrashAlt} />
                  </Button>
                </span>
              </Col>
            </Row>
          </List.Item>
        }
      />
      <Modal title="Basic Modal" visible={isModalVisible} onOk={removeItem} onCancel={handleModalCancel}>
        Are you sure you want to delete {itemToBeDeleted} ?
      </Modal>
    </div>
    <div className={styles.customFooter}>
      <span id="downloadContainer">Download the files from the NYM service provider</span>
    </div>
  </>
}