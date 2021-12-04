import React from 'react';
import { FileUploader } from './FIleUploader';
import styles from '../styles/Components.module.css';

export function Homepage(): JSX.Element {
    return (
        <div className={styles.homepageWrapper}>
            <img src="logo192.png" height="80" alt="Mixnet logo" />
            <br />
            <p>&nbsp;</p>
            <FileUploader />
        </div>
    )
}