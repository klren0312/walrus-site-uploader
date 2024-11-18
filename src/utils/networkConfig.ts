import { getFullnodeUrl } from '@mysten/sui/client'
import { createNetworkConfig } from '@mysten/dapp-kit'
/**
sui-api.rpcpool.com
sui-rpc.testnet.lgns.net
rpc-sui-testnet.cosmostation.io
https://testnet.artifact.systems/sui
https://sui-testnet-rpc.bartestnet.com/
https://sui-testnet-rpc.allthatnode.com
https://sui-rpc-pt.testnet-pride.com/
https://sui-testnet-endpoint.blockvision.org/
https://rpc-testnet.suiscan.xyz/
https://sui-testnet.brightlystake.com/
https://sui-testnet-rpc-germany.allthatnode.com/
https://sui-testnet-rpc-korea.allthatnode.com/
PUBLIC: https://fullnode.testnet.sui.io
 */
const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl('devnet'),
    },
    testnet: {
      url: 'https://sui-testnet-endpoint.blockvision.org/',
    },
    mainnet: {
      url: getFullnodeUrl('mainnet'),
    },
  })

export { useNetworkVariable, useNetworkVariables, networkConfig }
