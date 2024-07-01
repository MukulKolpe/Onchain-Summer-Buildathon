"use client";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@chakra-ui/react";
import {
  Address,
  Avatar,
  Name,
  Badge,
  Identity,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import "@coinbase/onchainkit/styles.css";
import { color } from "@coinbase/onchainkit/theme";

import { useColorModeValue } from "@chakra-ui/color-mode";
import { Flex, Center } from "@chakra-ui/react";

function Home() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const color = useColorModeValue("indigo", "indigo.600");

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
        <Flex px={4} py={6} direction="column" width="30%" gap="6">
          {connectors.map((connector) => (
            <Button
              key={connector.uid}
              onClick={() => {
                connect({ connector });
                status === "connected" && connector.name === "Coinbase Wallet"
                  ? connector.disconnect()
                  : null;
              }}
              type="button"
              colorScheme={connector.name === "MetaMask" ? "orange" : "gray"}
              py={6}
              px={10}
            >
              {connector.name === "Injected"
                ? "Connect with MetaMask"
                : connector.name}
            </Button>
          ))}
        </Flex>

        <div>{status}</div>
        <div>{error?.message}</div>

        <Center>
          {/* // OnchainKit Working Components */}
          <Wallet>
            <ConnectWallet>
              <Avatar />
              <Name />
            </ConnectWallet>
            <WalletDropdown>
              <Identity
                hasCopyAddressOnClick
                schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
              >
                <Avatar />
                <Name>
                  <Badge />
                </Name>
                <Address className={color.foregroundMuted} />
                <EthBalance />
              </Identity>
              <WalletDropdownLink href="/profile">Profile</WalletDropdownLink>
              <WalletDropdownDisconnect />
            </WalletDropdown>
          </Wallet>
        </Center>
      </div>
    </>
  );
}

export default Home;
