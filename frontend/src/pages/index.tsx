"use client";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@chakra-ui/react";
import { Address } from "@coinbase/onchainkit/identity";
import "@coinbase/onchainkit/styles.css";

function Home() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <>
      <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          {account.addresses !== undefined && (
            <Address
              className="bg-white px-2 py-1"
              address={account.addresses[0]} // OnchainKit Working Component
            />
          )}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === "connected" && (
          <Button type="button" onClick={() => disconnect()}>
            Disconnect
          </Button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <Button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </Button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>
    </>
  );
}

export default Home;
