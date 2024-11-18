import './app.css'
import {
  ConnectButton,
} from '@mysten/dapp-kit'
import { Buffer } from 'buffer'
import FileUploader from './components/FileUploader'

window.Buffer = Buffer

export function App() {
  return (
    <>
      <ConnectButton />
      <FileUploader />
    </>
  )
}
