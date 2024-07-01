import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  Icon,
  Heading,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import {
  HamburgerIcon,
  CloseIcon,
  AddIcon,
  WarningTwoIcon,
} from "@chakra-ui/icons";
import { color } from "@coinbase/onchainkit/theme";
// import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
// import { ethers } from "ethers";
import { Link } from "@chakra-ui/next-js";
import { useAccount } from "wagmi";
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

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const account = useAccount();

  return (
    <>
      <Box bg={useColorModeValue("white", "gray.800")} px={10}>
        <Flex
          h={16}
          alignItems="center"
          justifyContent="space-between"
          mx="auto"
        >
          <IconButton
            size={"md"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack
            spacing={8}
            alignItems={"center"}
            fontSize="26px"
            fontWeight="0"
            ml="2"
            color="brand.00"
          >
            <Link href="/" mt={1}>
              {/* <Image
                src="/assets/logo.png"
                alt="Logo"
                width={94}
                height={150}
              /> */}
              OptiFlow
            </Link>
          </HStack>
          <Flex alignItems={"center"}>
            <div style={{ display: "flex" }}>
              {account.isConnected && (
                <>
                  <HStack
                    as={"nav"}
                    spacing={4}
                    display={{ base: "none", md: "flex" }}
                    marginRight={4}
                  >
                    <Link href="/create-option">
                      <Button w="full" variant="ghost">
                        Create Option
                      </Button>
                    </Link>
                  </HStack>

                  <HStack
                    as={"nav"}
                    spacing={4}
                    display={{ base: "none", md: "flex" }}
                    marginRight={4}
                  >
                    <Link href="/explore">
                      <Button w="full" variant="ghost">
                        Explore
                      </Button>
                    </Link>
                  </HStack>

                  <HStack
                    as={"nav"}
                    spacing={4}
                    display={{ base: "none", md: "flex" }}
                    marginRight={4}
                  >
                    <Link href="/profile">
                      <Button w="full" variant="ghost">
                        Profile
                      </Button>
                    </Link>
                  </HStack>
                </>
              )}

              <HStack
                as={"nav"}
                spacing={4}
                display={{ base: "none", md: "flex" }}
                marginRight={4}
              >
                <Link href="/connect">
                  <Button w="full" variant="ghost">
                    Connect other EOA
                  </Button>
                </Link>
              </HStack>
              <HStack>
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
                    <WalletDropdownLink href="/profile">
                      Profile
                    </WalletDropdownLink>
                    <WalletDropdownDisconnect />
                  </WalletDropdown>
                </Wallet>
              </HStack>
            </div>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            {account.isConnected && (
              <>
                <Stack as={"nav"} spacing={4}>
                  <Link href="/create-option">
                    <Button w="full" variant="ghost">
                      Create Option
                    </Button>
                  </Link>
                </Stack>
                <Stack as={"nav"} spacing={4}>
                  <Link href="/explore">
                    <Button w="full" variant="ghost">
                      Explore
                    </Button>
                  </Link>
                </Stack>

                <Stack as={"nav"} spacing={4}>
                  <Link href="/profile">
                    <Button w="full" variant="ghost">
                      Profile
                    </Button>
                  </Link>
                </Stack>
              </>
            )}
          </Box>
        ) : null}
      </Box>
    </>
  );
}
