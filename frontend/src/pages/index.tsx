"use client";
import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";

import {
  Button,
  Flex,
  Heading,
  Image,
  Stack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
  const account = useAccount();

  const registerRedirect = () => {
    router.push("/connect");
  };

  const exploreContracts = () => {
    router.push("/explore");
  };

  return (
    <>
      <Stack minH={"100vh"} direction={{ base: "column", md: "row" }}>
        <Flex
          flexDir={{ base: "column", md: "row" }}
          alignItems={"center"}
          justifyContent={"center"}
          flex={1}
          px={{ base: 4, md: 20, lg: 28 }}
          ml={{ base: 0, md: 0, lg: 20 }}
        >
          <Flex p={8} flex={1} align={"center"} justify={"center"}>
            <Stack spacing={6} w={"full"} maxW={"lg"}>
              <Heading fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}>
                <Text
                  as={"span"}
                  position={"relative"}
                  _after={{
                    content: "''",
                    width: "full",
                    height: useBreakpointValue({ base: "20%", md: "30%" }),
                    position: "absolute",
                    bottom: 1,
                    left: 0,
                    bg: "blue.500",
                    zIndex: -1,
                  }}
                >
                  Strategic Options.
                </Text>
                <br />{" "}
                <Text color={"blue.500"} as={"span"}>
                  Smart Profits.
                </Text>{" "}
              </Heading>
              <Text fontSize={{ base: "md", lg: "lg" }} color={"gray.500"}>
                Simplify your trading journey with our intuitive options trading
                platform.
              </Text>
              <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                <Button
                  rounded={"full"}
                  bg={"blue.500"}
                  color={"white"}
                  _hover={{
                    bg: "blue.600",
                  }}
                  width={{ base: "full", md: "auto" }}
                  onClick={registerRedirect}
                >
                  Start Now!
                </Button>

                <Button
                  width={{ base: "full", md: "auto" }}
                  rounded={"full"}
                  onClick={exploreContracts}
                >
                  Explore Option Contracts
                </Button>
              </Stack>
            </Stack>
          </Flex>
          <Flex flex={1}>
            <Image
              alt={"Login Image"}
              objectFit={"cover"}
              srcSet="/assets/option-trading.png"
              width={{ base: 300, md: 450, lg: 550 }}
              // height={450}
            />
          </Flex>
        </Flex>
      </Stack>
    </>
  );
}
