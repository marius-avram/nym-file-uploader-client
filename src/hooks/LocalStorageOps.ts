import Moment from 'moment';
import { useCallback, useState } from 'react';

export function LocalStorageOps() {
  // This should be in a context provider
  const [updatedCount, setUpdatedCount] = useState<number>(0);
  const FILES_METADATA = "files";

  const saveMd5Sum = useCallback((md5sum : string) => {
    let filesMetadataJSON : { [id: string]: string } = getSavedFiles();
    console.debug("Saving metadata locally" + md5sum);
    // Will save the date too, just to make the user aware when it uploaded the file
    filesMetadataJSON[md5sum] = Moment().format('MMMM Do YYYY, h:mm:ss a');
    localStorage.setItem(FILES_METADATA, JSON.stringify(filesMetadataJSON));
    setUpdatedCount(updatedCount + 1)
  // eslint-disable-next-line
  }, [setUpdatedCount]);

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
    setUpdatedCount(updatedCount + 1);
  }, []);

  const removeMd5Sum = useCallback((md5sum : string) => {
    let filesMetadataJSON : { [id: string]: string } = getSavedFiles();
    if (md5sum in filesMetadataJSON) {
      delete filesMetadataJSON[md5sum];
    }
    localStorage.setItem(FILES_METADATA, JSON.stringify(filesMetadataJSON));
    setUpdatedCount(updatedCount + 1)
  }, [setUpdatedCount]);

  return {
    updatedCount,
    saveMd5Sum,
    getSavedFiles,
    removeLocalStorageMetadata,
    removeMd5Sum
  }
}