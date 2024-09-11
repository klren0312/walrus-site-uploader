// src/components/FileUpload.js
import React, { useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Input,
  Link,
  Spinner,
  Text,
  VStack,
  useSteps,
  useToast,
} from '@chakra-ui/react'
import { build_txn, FileContent, idToBase36 } from './utils'
import { steps, UploadStepper } from './stepper'
import {
  ConnectModal,
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from '@mysten/dapp-kit'
import { PACKAGEID } from './const'

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}
const FileUpload = () => {
  const [files, setFiles] = useState<FileContent[] | null>(null)
  const toast = useToast()
  const input = useRef<HTMLInputElement>(null)
  const account = useCurrentAccount()
  const [open, setOpen] = useState(false)
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const client = useSuiClient()
  const [digest, setDigest] = useState('')
  const [url, setUrl] = useState('')

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  })

  useEffect(() => {
    if (!input.current) {
      return
    }
    input.current.setAttribute('webkitdirectory', '')
  }, [input])

  useEffect(() => {
    if (
      files &&
      files?.length > 0 &&
      files?.filter((file) => file.blobId).length === files?.length
    ) {
      setActiveStep(2)
    }
  }, [files])

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event?.currentTarget?.files || [])
    const data: FileContent[] = []
    for (const file of files) {
      const content = await readFileAsText(file)
      data.push({
        name: file.name,
        path: `${file.webkitRelativePath.split('/').slice(1).join('/')}`,
        content: content,
      })
    }
    console.log(data)
    setFiles(data)
    setActiveStep(1)
  }

  const handleUpload_walrus = async ({ data }: { data: FileContent[] }) => {
    if (!data) {
      return
    }

    for (const e of data) {
      setFiles((prev) => {
        return prev!.map((file) => {
          if (file.path === e.path) {
            return {
              ...file,
              upload_waiting: true,
            }
          }
          return file
        })
      })

      const response = await fetch(
        'https://publisher-devnet.walrus.space/v1/store',
        {
          method: 'PUT',
          body: e.content,
        },
      )
      const json = await response.json()

      console.log(json?.alreadyCertified?.blobId)

      setFiles((prev) => {
        return prev!.map((file) => {
          if (file.path === e.path) {
            return {
              ...file,
              blobId: json?.alreadyCertified?.blobId,
              upload_waiting: false,
            }
          }
          return file
        })
      })
    }
  }

  const handleUpload = async ({ data }: { data: FileContent[] }) => {
    const files = data.map((file) => {
      return {
        name: file.path,
        blobId: file.blobId!,
      }
    })
    signAndExecuteTransaction(
      {
        transaction: build_txn({
          data: files,
          owner: account?.address || '',
        }),
        chain: 'sui:testnet',
      },
      {
        onSuccess: async (result) => {
          console.log('executed transaction', result)
          const transaction = await client.waitForTransaction({
            digest: result.digest,
            options: {
              showObjectChanges: true,
            },
          })
          const object = transaction.objectChanges?.find((change) => {
            if ('objectType' in change) {
              return change.objectType == `${PACKAGEID}::site::Site`
            }
            return false
          })
          setDigest(result.digest)
          if (object)
            setUrl(
              `https://${idToBase36('objectId' in object ? object.objectId : '')}.walrus.site/`,
            )
          setActiveStep(3)
        },
      },
    )
  }

  return (
    <VStack spacing={4} align="stretch" width={'800px'}>
      <Flex
        justifyContent={'center'}
        alignItems={'center'}
        borderWidth="1px"
        borderRadius="md"
        p="4"
        cursor="pointer"
        _hover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
        bg="transparent"
        onClick={() => input.current?.click()}
        height="200px"
      >
        <Input
          type="file"
          onChange={handleFileChange}
          ref={input}
          border="none"
          bg="transparent"
          display="none"
        />
        <Text
          onClick={() => input.current?.click()}
          cursor="pointer"
          textAlign="center"
          width="100%"
        >
          Click to upload the site folder
        </Text>
      </Flex>
      <UploadStepper activeStep={activeStep} setActiveStep={setActiveStep} />
      {activeStep != 0 && (
        <Button
          colorScheme="teal"
          onClick={async () => {
            if (activeStep === 1) {
              handleUpload_walrus({ data: files || [] })
            } else if (activeStep === 2) {
              if (account?.address) {
                handleUpload({ data: files || [] })
              } else {
                setOpen(true)
              }
            } else if (activeStep === 3) {
              await navigator.clipboard.writeText(url)
              toast({
                title: 'Copied',
                description: `${url} is copied to clipboard`,
                status: 'success',
                duration: 2000,
                isClosable: true,
              })
            }
          }}
        >
          {`${activeStep == 1 ? 'Upload to Walrus' : activeStep == 2 ? (account?.address ? 'Upload to Chain' : 'Connect Wallet') : activeStep == 3 ? `${url ? url : 'Finish'}` : 'Wait for selection'}`}
        </Button>
      )}
      <Text> {digest} </Text>
      {url && (
        <Link href={url} target="_blank">
          {' '}
          {url}
        </Link>
      )}
      <ConnectModal
        trigger={<></>}
        open={open}
        onOpenChange={(isOpen) => setOpen(isOpen)}
      />
      <Card width="100%">
        <CardHeader>
          <Heading size={'lg'}>Selected Files</Heading>
        </CardHeader>
        <CardBody>
          {files &&
            files.map((file) => {
              return (
                <Box key={file.path} height={'40px'}>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text>{file.path}</Text>
                    {file.blobId ? (
                      file.blobId
                    ) : file.upload_waiting ? (
                      <Spinner />
                    ) : (
                      'Waiting for upload'
                    )}
                  </Flex>
                </Box>
              )
            })}
        </CardBody>
      </Card>
    </VStack>
  )
}

export default FileUpload
