import { useState } from 'react'

import { ConnectProvider, AmpersandProvider,  InstallationProvider, useConnection, useInstallation } from '@amp-labs/react'
import '@amp-labs/react/styles'; // Import the styles for the Ampersand SDK (ConnectProvider

import { InstallDialog } from './components/install-dialog'
import { CenteredContainer } from './components/ui/centered-container'
import { Button } from './components/ui/button'

import { FieldMappingTable } from './components/FieldMappingTable/FieldMappingTable';

const SHOW_INSTALLATION_TABLE = true

const apiKey = import.meta.env.VITE_AMP_API_KEY
const projectId = import.meta.env.VITE_AMP_PROJECT_ID
const integration = import.meta.env.VITE_AMP_INTEGRATION

const PARAMS = {
  integration,
  provider: 'salesforce',
  consumerRef: 'consumer-test-1',
  groupRef: 'group-test-1',
}

if (!apiKey) {
  console.error('VITE_AMP_API_KEY is not set in environment variables')
}

if (!projectId) {
  console.error('VITE_AMP_PROJECT_ID is not set in environment variables')
}

function InstallIntegration() {
  const { connection } = useConnection()
  const { installation } = useInstallation()
  const [isDialogOpen, setIsDialogOpen] = useState(true)

  // If the connection is not established, show the ConnectProvider component 
  if (!connection) {
    return (
      <CenteredContainer>
        <div className="min-w-screen">
          <ConnectProvider
            provider={PARAMS.provider}
            consumerRef={PARAMS.consumerRef}
            groupRef={PARAMS.groupRef}
            onConnectSuccess={(connection) => {
              console.log('Connection successful:', connection)
            }}
            onDisconnectSuccess={(connection) => {
              console.log('Disconnection successful:', connection)
            }}
          />
        </div>
      </CenteredContainer>
    )
  }

  // show installation table if connection is established
  if (connection && SHOW_INSTALLATION_TABLE) {
    return (
      <CenteredContainer>
        <FieldMappingTable />
      </CenteredContainer>
    )
  }

  // If the connection is established, show the InstallDialog component
  return (
    <CenteredContainer>
      <div className="flex flex-col items-center gap-4">
        <InstallDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          connectionId={connection?.id}
          provider={PARAMS.provider}
          installation={installation}
        />
        <p className="text-2xl font-bold mb-4 w-100">Click to see your installation details</p>
        <Button
          variant="outline"
          onClick={() => setIsDialogOpen(true)}
        >
          Open Integration Status
        </Button>
      </div>
    </CenteredContainer>
  )
}

function App() {
  return (
    // Provider for the Ampersand SDK
    <AmpersandProvider options={{ apiKey: apiKey, projectId: projectId, }}>
      {/* Provider for the installation specific headless library */}
      <InstallationProvider
        integration={PARAMS.integration}
        consumerRef={PARAMS.consumerRef}
        groupRef={PARAMS.groupRef}
      >
        {/* Builder Custom Installation Component */}
        <InstallIntegration />
      </InstallationProvider>
    </AmpersandProvider>
  )
}

export default App
