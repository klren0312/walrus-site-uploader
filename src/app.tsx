import "./app.css";
import React, { useEffect, useRef, useState } from "react";
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { get_blobId, get_file_hash } from './utils'
import { Buffer } from "buffer";
window.Buffer = Buffer;

import { Base64, toBase64 } from "js-base64";
import { FileDetail, UploadWalrusResponse } from "./type";
import { bcs, toB64 } from "@mysten/bcs";


function idToBase36(id: Uint8Array) {
  const BASE36 = "0123456789abcdefghijklmnopqrstuvwxyz";
  const base = BASE36.length;
  const source = id; // Assuming `id` is a byte array or a Uint8Array
  const size = source.length * 2;
  let encoding = new Array(size).fill(0);
  let high = size - 1;

  for (const digit of source) {
    let carry = digit;
    let it = size - 1;
    while (it > high || carry !== 0) {
      carry += 256 * encoding[it];
      encoding[it] = carry % base;
      carry = Math.floor(carry / base);
      it -= 1;
    }
    high = it;
  }

  const skip = encoding.findIndex((value) => value !== 0);
  const string = encoding
    .slice(skip)
    .map((c) => BASE36[c])
    .join("");

  return string;
}
const mimeTypes: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".xml": "application/xml",
  ".csv": "text/csv",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".zip": "application/zip",
  ".tar": "application/x-tar",
  ".gz": "application/gzip",
  ".bz2": "application/x-bzip2",
  ".xz": "application/x-xz",
  ".rar": "application/x-rar-compressed",
  ".7z": "application/x-7z-compressed",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".avi": "video/x-msvideo",
  ".mkv": "video/x-matroska",
  ".mov": "video/quicktime",
  ".flv": "video/x-flv",
  ".mpeg": "video/mpeg",
  ".mpg": "video/mpeg",
  ".ts": "video/mp2t",
};

function getMimeType(filename: string) {
  const ext = filename
    .slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
    .toLowerCase();
  return mimeTypes[`.${ext}`] || "application/octet-stream"; // 默认 MIME 类型
}

console.log(Base64.toUint8Array("YVqV9kD_xwGWyI3eCZiscNfoVc8zsd9-81x5iDz_b7o"));

console.log(
  "get_blobId ",
  get_blobId("TaEhjh2mR_S7t_bWbXXyxFQ9MeRRRSURM713zX7WdTc")
);

const id = new Uint8Array(
  Buffer.from(
    "0xaf4eafdac7039b742b5ee59d702428df36670b94164c3c388b74c5dca0f0e41e".replace(
      "0x",
      ""
    ),
    "hex"
  )
);
console.log(idToBase36(id));
console.log(
  Buffer.from(
    "c100d0cb55401738f9783890e7679d97a6aab5856a67c009c6f72e711de4c669",
    "hex"
  )
);
export function App() {
  return (
    <>
      <ConnectButton />
      <FileUploader />
    </>
  );
}
function Upload({
  data,
}: {
  data: {
    name: string;
    blobId: string;
    content: string;
  }[];
}) {
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();

  return (
    <>
      <button
        onClick={async () => {
          let txb = new Transaction();
          let site = txb.moveCall({
            package:
              "0xc5bebae319fc9d2a9dc858b7484cdbd6ef219decf4662dc81a11dc69bb7a5fa7",
            module: "site",
            function: "new_site",
            arguments: [txb.pure.string("test page")],
          });

          for (const v of data) {
            let html = txb.moveCall({
              package:
                "0xc5bebae319fc9d2a9dc858b7484cdbd6ef219decf4662dc81a11dc69bb7a5fa7",
              module: "site",
              function: "new_resource",
              arguments: [
                txb.pure.string(`/${v.name}`),
                txb.pure.u256(get_blobId(v.blobId)),
              ],
            });
            txb.moveCall({
              package:
                "0xc5bebae319fc9d2a9dc858b7484cdbd6ef219decf4662dc81a11dc69bb7a5fa7",
              module: "site",
              function: "add_resource",
              arguments: [site, html],
            });
          }

          if (account?.address) {
            txb.transferObjects([site], txb.pure.address(account.address));
          }

          await signAndExecuteTransaction(
            {
              transaction: txb,
              chain: "sui:testnet",
            },
            {
              onSuccess: (result) => {
                console.log("executed transaction", result);
              },
            }
          );
        }}
      >
        上传
      </button>
    </>
  );
}

const FileUploader = () => {
  const [fileDetails, setFileDetails] = useState<FileDetail[]>([]);
  const [isPrepare, setIsPrepare] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadSum, setUploadSum] = useState(0)
  const sum = useRef(0);
  const [data, setData] = useState<
    {
      name: string;
      blobId: string;
      content: string;
    }[]
  >([]);
  useEffect(() => {
    if (fileInputRef.current) {
      (fileInputRef.current as any).webkitdirectory = true;
    }
  }, [fileInputRef]);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files || [];

    setFileDetails([]);

    if (files.length === 0) {
      alert('没有选择文件');
      return;
    }
    const list = Array.from(files);

    setIsPrepare(true);

    list.forEach((file) => {
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        const detail: FileDetail = {
          name: `${file.webkitRelativePath.split("/").slice(1).join("/")}`,
          content: e.target?.result || '',
          status: false
        }
        setFileDetails((prev) => [
          ...prev,
          detail
        ])
        
        const resJson: UploadWalrusResponse = await fetch(
          "https://publisher.walrus-testnet.walrus.space/v1/store",
          {
            method: "PUT",
            body: detail.content,
          }
        ).then(res => res.json());
        sum.current += 1
        setUploadSum(sum.current)
        console.log(resJson, sum.current);
        if (sum.current === list.length) {
          setIsPrepare(false);
        }
        let blobId = ''
        // 新创建和更新返回到结构体不一样
        if (resJson.alreadyCertified) {
          blobId = resJson.alreadyCertified.blobId
        } else if (resJson.newlyCreated) {
          blobId = resJson.newlyCreated.blobObject.blobId
        }
        const contentHash = await get_file_hash(file)
        setData((prev) => [
          ...prev,
          {
            name: detail.name,
            blobId,
            content: contentHash
          },
        ]);
      };
      console.log("read ");
      reader.readAsText(file);
    });
  };

  return (
    <div>
      <h1>文件夹上传应用</h1>
      <p>选择一个文件夹上传：</p>
      <label className="button">
        点击选择文件夹
        <input
          className="hide"
          type="file"
          onChange={handleFileChange}
          multiple
          ref={fileInputRef}
        />
      </label>
      
      <div className="file-list">
        {
          fileDetails.map((item) => {
            return (
              <div className="flex">
                <div>{ item.name }</div>
              </div>
            )
          })
        }
      </div>
      {
        isPrepare ?
        <progress id="file" max="100" value={uploadSum / fileDetails.length}>{uploadSum / fileDetails.length}%</progress> :
        <Upload data={data} />
      }
    </div>
  );
};

export default FileUploader;
