import { Transaction } from '@mysten/sui/transactions'
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from '@mysten/dapp-kit'
import mime from 'mime'
import { get_blobId } from '../utils'

export default function Upload({
  data,
}: {
  data: {
    name: string
    blobId: string
    content: string
  }[]
}) {
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const account = useCurrentAccount()
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
      console.log(site, newRange, resource)
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
        },
      }
    )
  }

  return (
    <>
      <button onClick={doUpload}>
        上传
      </button>
    </>
  )
}
