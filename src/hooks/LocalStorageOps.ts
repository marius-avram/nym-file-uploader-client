import Moment from 'moment';
import { useCallback, useState } from 'react';
import { useAppContext } from '../App.context';

export function LocalStorageOps() {
  const { state: appState, setFileListUpdatedCount } = useAppContext();
  const FILES_METADATA = "files";

  const saveMd5Sum = useCallback((md5sum : string) => {
    let filesMetadataJSON : { [id: string]: string } = getSavedFiles();
    console.debug("Saving metadata locally" + md5sum);
    // Will save the date too, just to make the user aware when it uploaded the file
    filesMetadataJSON[md5sum] = Moment().format('MMMM Do YYYY, h:mm:ss a');
    localStorage.setItem(FILES_METADATA, JSON.stringify(filesMetadataJSON));
    setFileListUpdatedCount(appState.fileListUpdatedCount + 1)
  // eslint-disable-next-line
  }, [appState.fileListUpdatedCount, setFileListUpdatedCount]);

  const getSavedFiles = useCallback(() => {
    let filesMetadataJSON : { [id: string]: string } = {};
    const filesMetadata = localStorage.getItem(FILES_METADATA)
    if (filesMetadata != null) {
      filesMetadataJSON = JSON.parse(filesMetadata);
    }
    return filesMetadataJSON;
  }, []);

  const removeLocalStorageMetadata = useCallback(() => {
    localStorage.removeItem(FILES_METADATA);
    setFileListUpdatedCount(appState.fileListUpdatedCount + 1)
  }, [appState.fileListUpdatedCount, setFileListUpdatedCount]);

  const removeMd5Sum = useCallback((md5sum : string) => {
    let filesMetadataJSON : { [id: string]: string } = getSavedFiles();
    if (md5sum in filesMetadataJSON) {
      delete filesMetadataJSON[md5sum];
    }
    localStorage.setItem(FILES_METADATA, JSON.stringify(filesMetadataJSON));
    setFileListUpdatedCount(appState.fileListUpdatedCount + 1);
  }, [appState.fileListUpdatedCount, setFileListUpdatedCount]);

  return {
    saveMd5Sum,
    getSavedFiles,
    removeLocalStorageMetadata,
    removeMd5Sum
  }
}