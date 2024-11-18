import { render } from 'preact'
import { App } from './app.tsx'
import './assets/index.css'
import '@mysten/dapp-kit/dist/index.css'
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { networkConfig } from './utils/networkConfig.ts'
const queryClient = new QueryClient()

render(
    <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
            <WalletProvider autoConnect>
                <App />
            </WalletProvider>
        </SuiClientProvider>
    </QueryClientProvider>,
    document.getElementById('app')!
)
