import './app.css'
import React, { useEffect, useRef, useState } from 'react'
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { bcs } from '@mysten/bcs'
import { Deserializer, U256 } from '@aptos-labs/ts-sdk'
import { Buffer } from 'buffer'
window.Buffer = Buffer

import { Base64 } from 'js-base64'
function idToBase36(id: Uint8Array) {
  const BASE36 = '0123456789abcdefghijklmnopqrstuvwxyz'
  const base = BASE36.length
  const source = id // Assuming `id` is a byte array or a Uint8Array
  const size = source.length * 2
  const encoding = new Array(size).fill(0)
  let high = size - 1

  for (const digit of source) {
    let carry = digit
    let it = size - 1
    while (it > high || carry !== 0) {
      carry += 256 * encoding[it]
      encoding[it] = carry % base
      carry = Math.floor(carry / base)
      it -= 1
    }
    high = it
  }

  const skip = encoding.findIndex((value) => value !== 0)
  const string = encoding
    .slice(skip)
    .map((c) => BASE36[c])
    .join('')

  return string
}
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.csv': 'text/csv',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.zip': 'application/zip',
  '.tar': 'application/x-tar',
  '.gz': 'application/gzip',
  '.bz2': 'application/x-bzip2',
  '.xz': 'application/x-xz',
  '.rar': 'application/x-rar-compressed',
  '.7z': 'application/x-7z-compressed',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx':
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.avi': 'video/x-msvideo',
  '.mkv': 'video/x-matroska',
  '.mov': 'video/quicktime',
  '.flv': 'video/x-flv',
  '.mpeg': 'video/mpeg',
  '.mpg': 'video/mpeg',
  '.ts': 'video/mp2t',
}

function getMimeType(filename: string) {
  const ext = filename
    .slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
    .toLowerCase()

  // @ts-ignore
  return mimeTypes[`.${ext}`] || 'application/octet-stream' // 默认 MIME 类型
}

console.log(Base64.toUint8Array('YVqV9kD_xwGWyI3eCZiscNfoVc8zsd9-81x5iDz_b7o'))
function get_blobId(blobId: string) {
  const number = U256.deserialize(new Deserializer(Base64.toUint8Array(blobId)))

  // return Array.from(Uint8Array.from( ))
  // .map(byte => byte.toString(16).padStart(2, '0'))
  // .join('');
  return bcs.u256().fromHex(number.bcsToHex().toString())
}
console.log(
  'get_blobId ',
  get_blobId('2YLU3Usb-WoJAgoNSZUNAFnmyo8cfV8hJYt2YdHL2Hs'),
)

const id = new Uint8Array(
  Buffer.from(
    '0xaf4eafdac7039b742b5ee59d702428df36670b94164c3c388b74c5dca0f0e41e'.replace(
      '0x',
      '',
    ),
    'hex',
  ),
)
console.log(idToBase36(id))
console.log(
  Buffer.from(
    'c100d0cb55401738f9783890e7679d97a6aab5856a67c009c6f72e711de4c669',
    'hex',
  ),
)
export function App() {
  return (
    <>
      <ConnectButton />
      <FileUploader />
    </>
  )
}
function Upload({
  data,
}: {
  data: {
    name: string
    blobId: string
  }[]
}) {
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const account = useCurrentAccount()

  return (
    <>
      <button
        onClick={async () => {
          const txb = new Transaction()
          const site = txb.moveCall({
            package:
              '0x514cf7ce2df33b9e2ca69e75bc9645ef38aca67b6f2852992a34e35e9f907f58',
            module: 'site',
            function: 'new_site',
            arguments: [txb.pure.string('MyFirst')],
          })

          for (const v of data) {
            const html = txb.moveCall({
              package:
                '0x514cf7ce2df33b9e2ca69e75bc9645ef38aca67b6f2852992a34e35e9f907f58',
              module: 'site',
              function: 'new_resource',
              arguments: [
                txb.pure.string(`/${v.name}`),
                txb.pure.string(getMimeType(v.name)),
                txb.pure.string('plaintext'),
                txb.pure.u256(get_blobId(v.blobId)),
              ],
            })
            txb.moveCall({
              package:
                '0x514cf7ce2df33b9e2ca69e75bc9645ef38aca67b6f2852992a34e35e9f907f58',
              module: 'site',
              function: 'add_resource',
              arguments: [site, html],
            })
          }

          if (account?.address) {
            txb.transferObjects([site], txb.pure.address(account.address))
          }

          await signAndExecuteTransaction(
            {
              transaction: txb,
              chain: 'sui:testnet',
            },
            {
              onSuccess: (result) => {
                console.log('executed transaction', result)
              },
            },
          )
        }}
      >
        upload
      </button>
    </>
  )
}

const FileUploader = () => {
  const [_fileDetails, setFileDetails] = useState<String>("")
  const [_status, setStatus] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [data, setData] = useState<
    {
      name: string
      blobId: string
    }[]
  >([])
  useEffect(() => {
    if (fileInputRef.current) {
      ;(fileInputRef.current as any).webkitdirectory = true
    }
  }, [fileInputRef])
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files || []

    console.log(event.currentTarget)
    const details: { name: string; content: string | ArrayBuffer }[] = []
    let filesLoaded = 0

    if (files.length === 0) {
      setStatus('没有选择文件')
      return
    }
    Array.from(files).forEach((file) => {
      const reader = new FileReader()

      reader.onload = async (e: ProgressEvent<FileReader>) => {
        details.push({
          name: `${file.webkitRelativePath.split('/').slice(1).join('/')}`,
          content: e?.target?.result || '',
        })

        filesLoaded++
        if (filesLoaded === files.length) {
          const jsonOutput = JSON.stringify(details, null, 2)
          setFileDetails(jsonOutput)
          console.log(jsonOutput)

          for (const e of details) {
            console.log(e)
            const response = await fetch(
              'https://publisher.walrus-testnet.walrus.space/v1/store',
              {
                method: 'PUT',
                body: e.content,
              },
            )
            const json = await response.json()

            console.log(json?.alreadyCertified?.blobId)
            setData((prev) => [
              ...prev,
              {
                name: e.name,
                blobId: json?.alreadyCertified?.blobId,
              },
            ])
          }
        }
      }
      console.log('read ')
      reader.readAsText(file)
    })
  }

  // const handleFileInput = (event) => {
  //   const fileList = event.target.files
  //   const fileArray = Array.from(fileList)

  //   // Function to extract file information with relative path
  //   const extractFiles = (files) => {
  //     return files.map((file) => {
  //       const pathParts = file.webkitRelativePath.split('/')
  //       const name = pathParts[pathParts.length - 1]
  //       const relativePath = pathParts.slice(0, -1).join('/')

  //       return {
  //         name: `${relativePath}/${name}`,
  //         type: 'file',
  //         content: file,
  //       }
  //     })
  //   }

  //   // Read file contents
  //   const readFiles = async (files) => {
  //     const filesWithContent = await Promise.all(
  //       files.map(async (file) => {
  //         const text = await file.text()
  //         return { ...file, content: text }
  //       }),
  //     )
  //     return filesWithContent
  //   }

  //   const filesWithPath = extractFiles(fileArray)

  //   // Read file contents and update state
  //   readFiles(filesWithPath).then((filesWithContent) => {
  //     console.log(filesWithContent)
  //   })
  // }

  return (
    <div>
      <h1>文件夹上传应用</h1>
      <p>选择一个文件夹上传：</p>
      <input
        type="file"
        onChange={handleFileChange}
        multiple
        ref={fileInputRef}
      />
      <div>{/* <pre>{fileDetails}</pre> */}</div>
      <Upload data={data} />
    </div>
  )
}

export default FileUploader
