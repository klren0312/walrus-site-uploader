import { Transaction } from '@mysten/sui/transactions'
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClientContext,
} from '@mysten/dapp-kit'
import mime from 'mime'
import { addressToBase36, get_blobId } from '../utils'
import { useState } from 'preact/hooks'

export default function Upload({
  data,
}: {
  data: {
    name: string
    blobId: string
    content: string
  }[]
}) {
  const [url, setUrl] = useState('')
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const account = useCurrentAccount()
  const context = useSuiClientContext()
  /**
   * 通过交易hash获取site的objectId
   * @param digest 交易hash
   */
  const getWalrusUrl = async (digest: string) => {
    const client = context.client
    const res = await client.getTransactionBlock({
      digest,
      options: {
        showBalanceChanges: true,
        /** Whether to show transaction effects. Default to be False */
        showEffects: true,
        /** Whether to show transaction events. Default to be False */
        showEvents: true,
        /** Whether to show transaction input data. Default to be False */
        showInput: true,
        /** Whether to show object_changes. Default to be False */
        showObjectChanges: true,
        /** Whether to show raw transaction effects. Default to be False */
        showRawEffects: true,
        /** Whether to show bcs-encoded transaction input data */
        showRawInput: true,
      }
    })
    const objectId = res.effects?.created?.find(item => (item.owner as { AddressOwner: string }).AddressOwner === account?.address)?.reference.objectId
    if (objectId) {
      const base36 = addressToBase36(objectId)
      const url = `https://${base36}.walrus.site`
      setUrl(url)
    }
  }
  /**
   * new_site 新页面标题
   * new_range_option 创建range, 0, 1
   * new_resource 路径, blobid, 文件hash,
   * add_header, content-encoding, identity
   * add_header, content-type, 文件mime类型
   * add_resource, 第二个参数是最后一个的序号
   */
  const doUpload = async () => {
    if (!account?.address) {
      return
    }
    const txb = new Transaction()
    const site = txb.moveCall({
      package:
        '0xc5bebae319fc9d2a9dc858b7484cdbd6ef219decf4662dc81a11dc69bb7a5fa7',
      module: 'site',
      function: 'new_site',
      arguments: [txb.pure.string('test page')],
    })

    data.forEach(item => {
      // 先调用new_range_option
      const newRange = txb.moveCall({
        package: '0xc5bebae319fc9d2a9dc858b7484cdbd6ef219decf4662dc81a11dc69bb7a5fa7',
        module: 'site',
        function: 'new_range_option',
        arguments: [
          txb.pure.vector('u64', []),
          txb.pure.vector('u64', [])
        ]
      })
      // 再调用 new_resource
      const resource = txb.moveCall({
        package:
          '0xc5bebae319fc9d2a9dc858b7484cdbd6ef219decf4662dc81a11dc69bb7a5fa7',
        module: 'site',
        function: 'new_resource',
        arguments: [
          txb.pure.string(`/${item.name}`),
          txb.pure.u256(get_blobId(item.blobId)),
          txb.pure.u256(item.content),
          newRange
        ],
      })
      // 再调用 add_header content-encoding: identity
      txb.moveCall({
        package:
          '0xc5bebae319fc9d2a9dc858b7484cdbd6ef219decf4662dc81a11dc69bb7a5fa7',
        module: 'site',
        function: 'add_header',
        arguments: [
          resource,
          txb.pure.string('content-encoding'),
          txb.pure.string('identity'),
        ],
      })
      // 再调用 add_header mime
      txb.moveCall({
        package:
          '0xc5bebae319fc9d2a9dc858b7484cdbd6ef219decf4662dc81a11dc69bb7a5fa7',
        module: 'site',
        function: 'add_header',
        arguments: [
          resource,
          txb.pure.string('content-type'),
          txb.pure.string(mime.getType(item.name) || ''),
        ],
      })
      txb.moveCall({
        package: '0xc5bebae319fc9d2a9dc858b7484cdbd6ef219decf4662dc81a11dc69bb7a5fa7',
        module: 'site',
        function:'add_resource',
        arguments:[
          site,
          resource
        ]
      })
    })

    txb.transferObjects([site], txb.pure.address(account.address))

    signAndExecuteTransaction(
      {
        transaction: txb,
      },
      {
        onSuccess: (result) => {
          console.log('executed transaction', result)
          getWalrusUrl(result.digest)
        },
      }
    )
  }

  return (
    <>
      <button onClick={doUpload}>
        上传
      </button>
      {
        url ?
        <a href={url} target="__blank">{url}</a> :
        ''
      }
    </>
  )
}
