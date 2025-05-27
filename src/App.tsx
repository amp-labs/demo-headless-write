import "@amp-labs/react/styles"; // Import the styles for the Ampersand SDK (ConnectProvider

import {
  AmpersandProvider,
  ConnectProvider,
  InstallationProvider,
  useConnection,
} from "@amp-labs/react";

import { FieldMappingTable } from "./components/FieldMappingTable/FieldMappingTable";
import { CenteredContainer } from "./components/ui/centered-container";

const apiKey = import.meta.env.VITE_AMP_API_KEY;
const projectId = import.meta.env.VITE_AMP_PROJECT_ID;
const integration = import.meta.env.VITE_AMP_INTEGRATION;

const PARAMS = {
  integration,
  provider: "salesforce",
  consumerRef: "consumer-test-1",
  groupRef: "group-test-1",
};

if (!apiKey) {
  console.error("VITE_AMP_API_KEY is not set in environment variables");
}

if (!projectId) {
  console.error("VITE_AMP_PROJECT_ID is not set in environment variables");
}

function InstallIntegration() {
  const { connection } = useConnection();

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
              console.log("Connection successful:", connection);
            }}
            onDisconnectSuccess={(connection) => {
              console.log("Disconnection successful:", connection);
            }}
          />
        </div>
      </CenteredContainer>
    );
  }

  // show installation table if connection is established
  if (connection) {
    return (
      <CenteredContainer>
        <FieldMappingTable />
      </CenteredContainer>
    );
  }
}

function App() {
  return (
    // Provider for the Ampersand SDK
    <AmpersandProvider options={{ apiKey: apiKey, projectId: projectId }}>
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
  );
}

export default App;
