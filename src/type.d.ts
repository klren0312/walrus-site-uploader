import { Buffer } from 'buffer'

// window添加属性
declare global {
  interface Window {
    Buffer: typeof Buffer
  }
}

interface UploadWalrusResponse {
  alreadyCertified: {
    blobId: string;
    eventOrObject: { Event: { txDigest: string; eventSeq: string } };
    endEpoch: number;
  }
  newlyCreated: {
    blobObject: {
      id: string;
      registeredEpoch: number;
      blobId: string;
      size: number;
      encodingType: string;
      certifiedEpoch: number;
      storage: {
        id: string;
        startEpoch: number;
        endEpoch: number;
        storageSize: number;
      };
      deletable: boolean;
    };
    resourceOperation: {
      RegisterFromScratch: { encoded_length: number; epochs_ahead: number };
    };
    cost: number;
  }
}



interface FileDetail {
  name: string
  content: string | ArrayBuffer
  status: boolean
}