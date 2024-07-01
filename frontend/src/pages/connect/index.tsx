import React from "react";
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
import { Flex, Center, Box, Image } from "@chakra-ui/react";

const Connect = () => {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const color = useColorModeValue("indigo", "indigo.600");

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-evenly"
        alignItems="center"
        height="80vh"
        flexDir={{ base: "column", md: "row" }}
      >
        <Box textDecoration="none" _hover={{ textDecoration: "none" }}>
          <Image
            borderRadius="lg"
            src="/assets/wallet.png"
            alt="Wallet Image"
            objectFit="contain"
            width={{ base: 330, md: 400 }}
            // width={275}
          />
        </Box>
        <Flex
          px={4}
          py={6}
          direction="column"
          width="30%"
          gap="6"
          marginTop="80px"
        >
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
              colorScheme={
                connector.name === "MetaMask"
                  ? "orange"
                  : connector.name === "Coinbase Wallet"
                    ? "blue"
                    : connector.name === "WalletConnect"
                      ? "teal"
                      : connector.name === "Injected"
                        ? "purple"
                        : "gray"
              }
              py={6}
              px={10}
            >
              {connector.name === "Coinbase Wallet"
                ? "Connect With Coinbase Wallet"
                : null}
              {connector.name === "WalletConnect"
                ? "Connect with WalletConnect"
                : null}
              {connector.name === "MetaMask" ? "Connect with MetaMask" : null}
              {connector.name === "Injected"
                ? "Connect with Injected Provider"
                : null}
            </Button>
          ))}
          <Flex direction="row" justifyContent="center" alignItems="center">
            <div>
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
              {/* <div>{status}</div>
              <div>{error?.message}</div> */}
            </div>
            <div>
              {account.status === "connected" && (
                <Button type="button" onClick={() => disconnect()}>
                  Disconnect
                </Button>
              )}
            </div>
          </Flex>
        </Flex>
        <Flex></Flex>
      </Box>
    </>
  );
};

export default Connect;
