import React, { useEffect, useRef, useState } from 'react'
import { get_file_hash } from '../utils'
import { FileDetail, UploadWalrusResponse } from '../type'
import Upload from './Upload'

const FileUploader = () => {
  const [fileDetails, setFileDetails] = useState<FileDetail[]>([])
  const [isPrepare, setIsPrepare] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadSum, setUploadSum] = useState(0)
  const sum = useRef(0)
  const [data, setData] = useState<
    {
      name: string
      blobId: string
      content: string
    }[]
  >([])
  useEffect(() => {
    if (fileInputRef.current) {
      (fileInputRef.current as any).webkitdirectory = true
    }
  }, [fileInputRef])
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files || []

    setFileDetails([])

    if (files.length === 0) {
      alert('没有选择文件')
      return
    }
    const list = Array.from(files)

    setIsPrepare(true)

    list.forEach((file) => {
      const reader = new FileReader()
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        const detail: FileDetail = {
          name: `${file.webkitRelativePath.split('/').slice(1).join('/')}`,
          content: e.target?.result || '',
          status: false
        }
        setFileDetails((prev) => [
          ...prev,
          detail
        ])
        // 上传文件到walrus存储
        const resJson: UploadWalrusResponse = await fetch(
          'https://publisher.walrus-testnet.walrus.space/v1/store',
          {
            method: 'PUT',
            body: detail.content,
          }
        ).then(res => res.json())
        sum.current += 1
        setUploadSum(sum.current)
        console.log(resJson, sum.current)
        if (sum.current === list.length) {
          setIsPrepare(false)
        }
        let blobId = ''
        // 新创建和更新返回到结构体不一样
        if (resJson.alreadyCertified) {
          blobId = resJson.alreadyCertified.blobId
        } else if (resJson.newlyCreated) {
          blobId = resJson.newlyCreated.blobObject.blobId
        }
        // 计算文件的u256
        const contentHash = await get_file_hash(file)
        setData((prev) => [
          ...prev,
          {
            name: detail.name,
            blobId,
            content: contentHash
          },
        ])
        console.log({
          name: detail.name,
          blobId,
          content: contentHash
        })
      }
      console.log('read ')
      reader.readAsText(file)
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
        <progress id="file" max="100" value={uploadSum / fileDetails.length * 100}>{uploadSum / fileDetails.length * 100}%</progress> :
        <Upload data={data} />
      }
    </div>
  )
}

export default FileUploader
