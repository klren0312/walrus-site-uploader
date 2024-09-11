import { U256, Deserializer } from '@aptos-labs/ts-sdk'
import { bcs } from '@mysten/bcs'
import { Base64 } from 'js-base64'
import { PACKAGEID } from '../const'
import { Transaction } from '@mysten/sui/transactions'
import { Buffer } from 'buffer'

export interface FileContent {
  name: string
  path: string
  content: string
  blobId?: string
  upload_waiting?: boolean
}

export function get_blob(base64_blob: string): string {
  return bcs.u256().fromHex(
    U256.deserialize(new Deserializer(Base64.toUint8Array(base64_blob)))
      .bcsToHex()
      .toString(),
  )
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

export function getMimeType(filename: string) {
  const ext = filename
    .slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
    .toLowerCase()
  return (
    mimeTypes[`.${ext}` as keyof typeof mimeTypes] || 'application/octet-stream'
  )
}

export function build_txn({
  data,
  owner,
}: {
  data: {
    name: string
    blobId: string
  }[]
  owner: string
}): Transaction {
  const txb = new Transaction()
  const site = txb.moveCall({
    package: PACKAGEID,
    module: 'site',
    function: 'new_site',
    arguments: [txb.pure.string('MyFirst')],
  })

  for (const v of data) {
    const html = txb.moveCall({
      package: PACKAGEID,
      module: 'site',
      function: 'new_resource',
      arguments: [
        txb.pure.string(`/${v.name}`),
        txb.pure.string(getMimeType(v.name)),
        txb.pure.string('plaintext'),
        txb.pure.u256(get_blob(v.blobId)),
      ],
    })
    txb.moveCall({
      package: PACKAGEID,
      module: 'site',
      function: 'add_resource',
      arguments: [site, html],
    })
  }

  txb.transferObjects([site], txb.pure.address(owner))
  return txb
}

export function idToBase36(id: string): string {
  const BASE36 = '0123456789abcdefghijklmnopqrstuvwxyz'
  const base = BASE36.length
  const source = Buffer.from(id.replace('0x', ''), 'hex')
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
