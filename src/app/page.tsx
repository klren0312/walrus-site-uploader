'use client'
import FileUpload from './upload'
import { Box, Flex, Text } from '@chakra-ui/react'

export default function Home() {
  return (
    <>
      <Flex
        justify="center"
        align="center"
        height={'100%'}
        flexDirection={'column'}
        gap={'2rem'}
      >
        <FileUpload />
        <Box textAlign="center">
          <Text fontSize="sm" color="gray.500">
            Created by EllenP2P
          </Text>
          <Text fontSize="sm" color="gray.500">
            Email: EllenP2P@gmail.com
          </Text>
        </Box>
      </Flex>
    </>
  )
}
