import React from 'react';
import styles from '../styles/Components.module.css';
import Dragger from 'antd/lib/upload/Dragger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faUpload } from '@fortawesome/free-solid-svg-icons'

export function FileUploader() {
    return <>
        <Dragger>
            <p>
                <FontAwesomeIcon className={styles.bigIconSize} icon={faUpload} />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
                Support for a single upload
            </p>
        </Dragger>
    </>
}