import './App.css'
import Button from '@mui/material/Button'
import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi"
import { useMemo, useState } from "react"
import { createConfig, http, WagmiProvider } from "wagmi"
import { ronin, saigon } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

//=======================================================================================================================

const config = createConfig({
  chains: [ronin, saigon],
  transports: {
    [ronin.id]: http(),
    [saigon.id]: http(),    
  },
})

const queryClient = new QueryClient()

//=======================================================================================================================

function Component() {
  const [ isConnecting, setIsConnecting ] = useState(false)  
  const { isConnected, address } = useAccount()
  const { connectors, connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()

  const connector = useMemo(
    () => connectors.find((connector) => connector.name === "Ronin Wallet"),
    [connectors]
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

  return (
    <div>
      <pre className="Json">
        <code>{ JSON.stringify({ 
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

function Component2() {
  return (
    <div>
      <p>This is another component</p>      
    </div>
  )
}

//=======================================================================================================================

function App() {
  const [ componentIndex, setComponentIndex ] = useState(0)
  
  async function toggleComponent () {
    setComponentIndex((componentIndex + 1) % 2)
  }

  function ComponentSwitcher() {
    return componentIndex === 0 ? <Component/> : <Component2/>
  }
  
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="App">
        <header className="App-header">
          <ComponentSwitcher/>
          <br/><br/>
          <Button variant='contained' onClick={ toggleComponent }>{ "Toggle Component" }</Button>
        </header>
      </div>
      </QueryClientProvider>      
    </WagmiProvider>    
  )
}

export default App
