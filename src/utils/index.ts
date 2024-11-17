import { Deserializer, U256 } from "@aptos-labs/ts-sdk";
import { bcs } from "@mysten/bcs";
import { Base64 } from "js-base64";


export const get_blobId = (blobId: string) => {
  const number = U256.deserialize(new Deserializer(Base64.toUint8Array(blobId)));
  console.log(blobId)
  return bcs.u256().fromHex(number.bcsToHex().toString());
}

export const get_file_hash = async (file: File) => {
  // 读取文件内容为 ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // 使用 Web Crypto API 计算哈希
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);

  // 将哈希值转换为十六进制字符串
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return bcs.u256().fromHex(hashArray.map(byte => byte.toString(16).padStart(2, '0')).join(''))
}
