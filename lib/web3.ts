import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { AppKitNetwork, sepolia } from '@reown/appkit/networks'

// 1. Get projectId
const projectId = 'YOUR-PROJECT-ID'

// 2. Set the networks
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [ sepolia]

// 3. Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks
})

// 4. Create modal
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'Pokedex Marketplace',
    description: 'Pokedex Marketplace App',
    url: 'https://pokedex-marketplace.com',
    icons: ['https://avatars.githubusercontent.com/u/179229932']
  }
})