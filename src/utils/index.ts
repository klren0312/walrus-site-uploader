import { Deserializer, U256 } from '@aptos-labs/ts-sdk'
import { bcs } from '@mysten/bcs'
import { Base64 } from 'js-base64'

/**
 * blobid转u256
 * @param blobId
 * @returns u256
 */
export const get_blobId = (blobId: string) => {
  const number = U256.deserialize(new Deserializer(Base64.toUint8Array(blobId)))
  return bcs.u256().fromHex(number.bcsToHex().toString())
}

/**
 * 文件转256
 * @param file 文件
 * @returns 文件转u256
 */
export const get_file_hash = async (file: File) => {
  // 读取文件内容为 ArrayBuffer
  const arrayBuffer = await file.arrayBuffer()

  // 使用 Web Crypto API 计算哈希
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)

  // 将哈希值转换为十六进制字符串
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return bcs.u256().fromHex(hashArray.map(byte => byte.toString(16).padStart(2, '0')).join(''))
}

/**
 * 
 * @param str objectid 0xf4295211a0e122e2cee6d1a31d3557d8a5878b0d5aa278c298b86bc6dfdad70d
 * @returns base64编码 632r7wi80x67dwpwnb6ujznedzjcivr0jik0g6hzuz5peijaq5
 */
export const addressToBase36 = (str: string) => {
  // https://sdk.mystenlabs.com/bcs#transforms
  const hex = BigInt(str)
  return hex.toString(36)
}
