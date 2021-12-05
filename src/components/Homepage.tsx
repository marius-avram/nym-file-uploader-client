import React from 'react';
import { FileUploader } from './FileUploader';
import styles from '../styles/Components.module.css';
import { Tabs } from 'antd';

const { TabPane } = Tabs;

export function Homepage(): JSX.Element {
    const tabChange = function () {

    }
    return (
        <div className={styles.homepageWrapper}>
            <img src="logo192.png" height="80" alt="Mixnet logo" />
            <br />
            <p>&nbsp;</p>
            <Tabs defaultActiveKey="1" onChange={tabChange}>
              <TabPane tab="Upload" key="1">
                <FileUploader />
              </TabPane>
              <TabPane tab="Encrypted files" key="2">
                Encrypted files
              </TabPane>
              <TabPane tab="Public files" key="3">
                Public files
              </TabPane>
            </Tabs>

        </div>
    )
}