import React, { useEffect } from 'react';
import { FileUploader } from './FileUploader';
import styles from '../styles/Components.module.css';
import { Dropdown, Menu, Tabs } from 'antd';
import EncryptedFilesList from './EncryptedFilesList';
import PublicFilesList from './PublicFilesList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faCog } from '@fortawesome/free-solid-svg-icons';
import { MixnetHook } from '../hooks/Mixnet.hook';

const { TabPane } = Tabs;

export function Homepage(): JSX.Element {
  const {  connectionInitialised, connectWebsocket } = MixnetHook();

  useEffect(() => {
    connectWebsocket();
  }, [])

  const menu = (
    <Menu>
      <Menu.Item>
        Remove local data
      </Menu.Item>
      <Menu.Item>
        About
      </Menu.Item>
    </Menu>
  )

  return <>
    <div className={styles.homepageWrapper}>
      <div>
        <div className={styles.statusText}>
          Status&nbsp;&nbsp; {connectionInitialised}
          {connectionInitialised &&
            <FontAwesomeIcon className={styles.greenColor} icon={faCircle} />
          }
          {!connectionInitialised &&
            <FontAwesomeIcon className={styles.redColor} icon={faCircle} />
          }
        </div>
        <div className={styles.settingsIcon}>
          <Dropdown overlay={menu} placement="bottomRight">
            <FontAwesomeIcon icon={faCog} />
          </Dropdown>
        </div>
      </div>
      <img src="logo192.png" height="80" alt="Mixnet logo" />
      <br />
      <p>&nbsp;</p>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Upload" key="1">
          <FileUploader />
        </TabPane>
        <TabPane tab="Encrypted files" key="2">
          <EncryptedFilesList />
        </TabPane>
        <TabPane tab="Public files" key="3">
          <PublicFilesList />
        </TabPane>
      </Tabs>
    </div>
  </>
}