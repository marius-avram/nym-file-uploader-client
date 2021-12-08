import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, List, message, Modal, Row } from 'antd';
import styles from '../styles/Components.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTrashAlt, faUpload } from '@fortawesome/free-solid-svg-icons';
import { LocalStorageOps } from '../hooks/LocalStorageOps';
import { MixnetHook } from '../hooks/Mixnet.hook';
import { FileServiceProviderOps, Operations } from '../hooks/FileServiceProviderOps.hook';
import CryptoOps from '../hooks/CryptoOps.hook';
import { useAppContext } from '../App.context';

export default function EncryptedFilesList() {
  const { state: appState } = useAppContext();
  const { addOperationToBuffer } = FileServiceProviderOps();
  const { decryptArray } = CryptoOps();
  const { binaryResponse, sendBinaryMessageToMixNet, waitForBinaryReply, setOnBinaryMessageFromMixNet } = MixnetHook();
  const { getSavedFiles, removeMd5Sum } = LocalStorageOps();

  const [items, setItems] = useState<Array<string>>();
  const [selectedFilename, setSelectedFilename] = useState<string>();
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [itemToBeDeleted, setItemToBeDeleted] = useState<string>('');

  /// Every time the local storage changes we reload the items from the state of this component
  useEffect(() => {
    console.debug("updated fileListUpdatCount");
    const filesMetadata = getSavedFiles();
    const localItems = [];
    for (const [md5sum, datestr] of Object.entries(filesMetadata)) {
      localItems.push(md5sum + " created @ " + datestr);
    }
    setItems(localItems);
  }, [appState.fileListUpdatedCount]);

  // Handler for receiving a file binary content
  useEffect(() => {
    handleReceivingFile();
  }, [binaryResponse])

  const createDownloadLink = useCallback((arrayBuffer: ArrayBuffer) => {
    const fileBlob = new  Blob([new Uint8Array(arrayBuffer)]);
    setDownloadUrl(window.URL.createObjectURL(fileBlob));
  }, [setDownloadUrl]);

  const disableDownloadLink = useCallback(() => {
    setDownloadUrl('');
    setSelectedFilename(undefined);
  }, [setDownloadUrl, setSelectedFilename]);

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
    setSelectedFilename(md5sum);
    const textEncoder = new TextEncoder();
    const arrayBuffer = textEncoder.encode(md5sum);
    const arrayBufferWithOp = addOperationToBuffer(Operations.READ_ENCRYPTED_FILE, arrayBuffer);
    // Initialise response handler
    waitForBinaryReply();
    sendBinaryMessageToMixNet(arrayBufferWithOp);
  }, [getMd5FromItem, setSelectedFilename, waitForBinaryReply, sendBinaryMessageToMixNet]);

  const openDeleteModal = useCallback((item : string) => {
    const md5sum = getMd5FromItem(item);
    setItemToBeDeleted(md5sum);
    setIsModalVisible(true);
  }, [setItemToBeDeleted, setIsModalVisible])

  const handleModalCancel = useCallback(() => {
    setIsModalVisible(false);
  }, [setIsModalVisible]);

  const removeItem = useCallback(() => {
    console.debug("delete from local storage");
    removeMd5Sum(itemToBeDeleted);
    console.debug("sending delete message to mixnet");
    const textEncoder = new TextEncoder();
    const arrayBuffer = textEncoder.encode(itemToBeDeleted);
    const arrayBufferWithOp = addOperationToBuffer(Operations.DELETE_ENCRYPTED_FILE, arrayBuffer);
    sendBinaryMessageToMixNet(arrayBufferWithOp);
    setIsModalVisible(false);
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
        {selectedFilename != undefined && downloadUrl != '' &&
          <a href={downloadUrl} download={selectedFilename} onClick={disableDownloadLink}>Press here to save it locally</a>
        }
        {selectedFilename == undefined && downloadUrl == '' &&
          <span>Download the files from the NYM service provider</span>
        }
    </div>
  </>
}