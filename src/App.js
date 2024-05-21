import './App.css'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Typography from "@mui/material/Typography"
import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi"
import { useMemo, useState, useEffect, useRef, useReducer } from "react"
import { createConfig, http, WagmiProvider } from "wagmi"
import { ronin, saigon, mainnet } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

//=======================================================================================================================

const config = createConfig({
  chains: [ronin, saigon, mainnet],
  transports: {
    [ronin.id]: http(),
    [saigon.id]: http(),
    [mainnet.id]: http(),
  },
})

const queryClient = new QueryClient()

//=======================================================================================================================

function WalletComponent() {
  const stateName = 'WalletComponent'
  const localState = JSON.parse(localStorage.getItem(stateName) ?? '{}')    
  
  const [ isConnecting, setIsConnecting ] = useState(false)
  const useRoninWallet = useRef(Boolean(localState.useRoninWallet ?? true))
  const { isConnected, address } = useAccount()
  const { connectors, connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()

  const [, forceUpdate] = useReducer(x => x + 1, 0)

  useEffect(() => {
    localStorage.setItem(stateName, JSON.stringify({ useRoninWallet: useRoninWallet.current }))
  })

  const connector = useMemo(
    () => connectors.find((connector) => ((connector.name === "Ronin Wallet") === useRoninWallet.current)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connectors, useRoninWallet.current]
  )

  async function toggleConnection () {
    setIsConnecting(true)
    if (isConnected) {
      await disconnectAsync({ connector })
    } else {
      await connectAsync({ connector })
    }
    setIsConnecting(false)
  }

  const handleCheckBox = (event) => {
    useRoninWallet.current = event.target.checked
    forceUpdate()
  }

  return (
    <div>
      <Typography variant="p5">Use Ronin Wallet?</Typography>
      <Checkbox checked={ Boolean(useRoninWallet.current) } onChange={ handleCheckBox } />
      <pre className="Json">        
        <code>{ JSON.stringify({ 
          wallet: connector?.name,
          isConnected,           
          chainId: useChainId(),
          address,
        }, null, 4) }</code>
      </pre><br/>
      <Button variant='contained' onClick={ toggleConnection } disabled={ isConnecting }>{ isConnected ? "Disconnect" : "Connect" }</Button>            
    </div>
  )
}

//=======================================================================================================================

function OtherComponent() {
  return (
    <div>
      <p>This is another component</p>      
    </div>
  )
}

//=======================================================================================================================

function App() {
  const [ componentIndex, setComponentIndex ] = useState(0)
  
  async function switchComponent () {
    setComponentIndex((componentIndex + 1) % 2)
  }

  function ComponentSwitcher() {
    return componentIndex === 0 ? <WalletComponent/> : <OtherComponent/>
  }
  
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="App">
        <header className="App-header">
          <ComponentSwitcher/>
          <br/><br/>
          <Button variant='contained' onClick={ switchComponent }>{ "Switch Component" }</Button>
        </header>
      </div>
      </QueryClientProvider>      
    </WagmiProvider>    
  )
}

export default App
