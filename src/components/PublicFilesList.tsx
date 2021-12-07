import React from 'react';
import { Row, Col } from 'antd';
import styles from '../styles/Components.module.css';

export default function PublicFilesList() {
  return <>
    <div className={`${styles.listWrapper} ${styles.greyBorderTop}`}>
      <Row>
        <Col>
          <p className={styles.padding12}>Work in progress...</p>
        </Col>
      </Row>
    </div>
  </>;
}