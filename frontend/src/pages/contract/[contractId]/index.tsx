//@ts-nocheck comment
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  chakra,
  Container,
  Stack,
  Text,
  Image,
  Flex,
  VStack,
  Button,
  Heading,
  SimpleGrid,
  StackDivider,
  useColorModeValue,
  VisuallyHidden,
  List,
  ListItem,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormLabel,
} from "@chakra-ui/react";
import { MdLocalShipping } from "react-icons/md";
import dynamic from "next/dynamic";
import optionabi from "../../../../abi/optiontrading.json";
import tokenabi from "../../../../abi/erc20abi.json";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
const LiveChart = dynamic(() => import("@/components/LiveChart/LiveChart"), {
  ssr: false,
});

const index = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [optionData, setOptionData] = useState();
  const [strikePr, setStrikePr] = useState(0.0);
  const [daysleft, setDaysLeft] = useState(0);
  const [contractType, setContractType] = useState("loading...");
  const [contractStatus, setContractStatus] = useState("loading...");
  const [isOwner, setIsOwner] = useState(false);
  const [isBuyer, setIsBuyer] = useState(false);
  const [biddingData, setBiddingData] = useState();
  const [acceptedBids, setAcceptedBids] = useState();
  const [profit, setProfit] = useState(0);
  const [bidPrice, setBidPrice] = useState(0);
  const [bidQuantity, setBidQuantity] = useState(0);
  const account = useAccount();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [counter, setCounter] = useState(0);
  const finalRef = React.useRef(null);
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    const getOption = async () => {
      if (counter < 2) {
        const optionId = router.query.contractId;
        const rpc = "https://sepolia.base.org";
        const provider = new ethers.providers.JsonRpcProvider(rpc);
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_OPTION_TRADING!,
          optionabi,
          provider
        );

        const res = await contract.optionIdtoContract(optionId);
        console.log(res);
        let tempStrike = res.strikePrice.toString();
        tempStrike = parseFloat(tempStrike, 2).toFixed(2);
        tempStrike /= 1000000.0;
        tempStrike = parseFloat(tempStrike, 2).toFixed(2);
        console.log(tempStrike);
        setOptionData(res);
        setStrikePr(tempStrike);
        let tempDays = await convertToDays(Number(res.expiryTime));
        console.log(tempDays);
        setDaysLeft(tempDays);

        let tempType = Number(res?.contractType);
        if (tempType === 1) {
          setContractType("CALL");
        } else {
          setContractType("PUT");
        }

        if (res?.owner === res?.buyer) {
          setContractStatus("Available for Bidding");
        } else {
          setContractStatus("Not available for bid");
        }

        setLoading(false);
      }
    };

    const convertToDays = async (timeLeft) => {
      console.log(timeLeft);
      timeLeft -= Date.now();
      if (timeLeft < 0) return 0;
      return timeLeft / (24 * 60 * 60 * 1000);
    };

    const getBiddingData = async () => {
      if (counter < 2) {
        const optionId = router.query.contractId;
        const res = await fetch(`/api/get-bids`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            optionId: optionId,
          }),
        });
        const data = await res.json();
        console.log(data);
        setBiddingData(data);
        setCounter(counter + 1);
      }
    };

    const getAcceptedBiddings = async () => {
      if (account && counter < 2) {
        const optionId = router.query.contractId;
        const res = await fetch(`/api/get-bids-byAdd`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            optionId: optionId,
            address: account.addresses[0],
          }),
        });
        const data = await res.json();
        console.log(data);
        setAcceptedBids(data);
        setCounter(counter + 1);
      }
    };

    if (router?.query?.contractId) {
      getOption();
      getBiddingData();
      getAcceptedBiddings();
    }
  }, [router, account]);

  useEffect(() => {
    const checkOwner = async () => {
      if (account) {
        // console.log(optionData?.owner);
        // console.log(account);
        if (
          account.addresses?.length > 0 &&
          account.addresses[0] === optionData?.owner
        ) {
          // console.log(account.addresses[0]);
          // console.log(optionData?.owner);
          setIsOwner(true);
        }
      }
    };
    const checkBuyer = async () => {
      if (account) {
        // console.log(optionData?.owner);
        // console.log(account);
        if (
          account.addresses?.length > 0 &&
          account.addresses[0] === optionData?.buyer
        ) {
          // console.log(account.addresses[0]);
          // console.log(optionData?.owner);
          setIsBuyer(true);
        }
      }
    };

    checkOwner();
  }, [account, optionData]);

  const calculateProfit = async () => {
    const optionId = router.query.contractId;
    const rpc = "https://sepolia.base.org";
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_OPTION_TRADING!,
      optionabi,
      provider
    );
    if (Number(optionData?.contractType) == 1) {
      const res = await contract.calculateCallProfit(optionId);
      console.log(res);
      setProfit(Number(res) / 1000000);
    } else {
      const res = await contract.calculatePutProfit(optionId);
      console.log(res);
      setProfit(Number(res) / 1000000);
    }

    setLoading(false);
  };

  const approval = async () => {
    writeContract({
      abi: tokenabi,
      address: process.env.NEXT_PUBLIC_TOKEN_ADDRESS,
      functionName: "approve",
      args: [process.env.NEXT_PUBLIC_OPTION_TRADING, optionData.premiumValue],
    });
  };

  const buyOption = async () => {
    console.log("button clicked");
    console.log(router.query.optionId);
    writeContract({
      abi: optionabi,
      address: process.env.NEXT_PUBLIC_OPTION_TRADING,
      functionName: "buyOption",
      args: [router.query.contractId],
    });
  };

  const handleModalSubmit = async () => {
    if (account?.addresses?.length > 0) {
      let reqPrice = parseInt(bidPrice);
      let reqQuantity = parseInt(bidQuantity);
      const optionId = router.query.contractId;
      const res = await fetch(`/api/propose-bid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          optionId: optionId,
          price: reqPrice,
          quantity: reqQuantity,
          address: account.addresses[0],
        }),
      });
      const data = await res.json();
      console.log(data);
      router.reload(window.location.pathname);
    }
  };

  return (
    <Container maxW={"7xl"}>
      <Modal finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Propose a Bid</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormLabel>Enter Quantity:</FormLabel>
            <Input
              type="text"
              placeholder="Enter quantity"
              onChange={(e) => setBidQuantity(e.target.value)}
            />
            <FormLabel mt={2}>Enter Price:</FormLabel>
            <Input
              type="text"
              placeholder="Enter price"
              onChange={(e) => setBidPrice(e.target.value)}
            />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => handleModalSubmit()} variant="ghost">
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <SimpleGrid
        columns={{ base: 1, lg: 2 }}
        spacing={{ base: 8, md: 10 }}
        py={{ base: 18, md: 24 }}
      >
        {" "}
        <Flex>
          <Box w={"100%"} h={{ base: "100%", sm: "400px", lg: "500px" }}>
            <LiveChart />
          </Box>
        </Flex>
        <Stack spacing={{ base: 6, md: 10 }}>
          <Box as={"header"}>
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: "2xl", sm: "4xl", lg: "5xl" }}
            >
              USDC
            </Heading>
            <Text
              color={useColorModeValue("gray.900", "gray.400")}
              fontWeight={300}
              fontSize={"2xl"}
            >
              Strike Price: {strikePr || 0.0}
            </Text>
          </Box>

          <Stack
            spacing={{ base: 4, sm: 6 }}
            direction={"column"}
            divider={
              <StackDivider
                borderColor={useColorModeValue("gray.200", "gray.600")}
              />
            }
          >
            <Box>
              <Text
                fontSize={{ base: "16px", lg: "18px" }}
                color={useColorModeValue("yellow.500", "yellow.300")}
                fontWeight={"500"}
                textTransform={"uppercase"}
                mb={"4"}
              >
                Contract Details
              </Text>

              <List spacing={2}>
                <ListItem>
                  <Text as={"span"} fontWeight={"bold"}>
                    Contract Expiry:
                  </Text>{" "}
                  {parseInt(daysleft) || 0} Days
                </ListItem>
                <ListItem>
                  <Text as={"span"} fontWeight={"bold"}>
                    Type:
                  </Text>{" "}
                  {contractType || "Loading..."}
                </ListItem>
                <ListItem>
                  <Text as={"span"} fontWeight={"bold"}>
                    Units:
                  </Text>{" "}
                  {Number(optionData?.units) || "loading..."}
                </ListItem>
                <ListItem>
                  <Text as={"span"} fontWeight={"bold"}>
                    Seller:
                  </Text>{" "}
                  {optionData?.owner || "loading..."}
                </ListItem>
                <ListItem>
                  <Text as={"span"} fontWeight={"bold"}>
                    Status:
                  </Text>{" "}
                  {contractStatus || "loading..."}
                </ListItem>
              </List>
            </Box>
          </Stack>

          <Button
            rounded={"none"}
            w={"full"}
            mt={8}
            size={"lg"}
            py={"7"}
            bg={useColorModeValue("gray.900", "gray.50")}
            color={useColorModeValue("white", "gray.900")}
            textTransform={"uppercase"}
            _hover={{
              transform: "translateY(2px)",
              boxShadow: "lg",
            }}
            onClick={onOpen}
          >
            Propose a Price
          </Button>

          <Stack
            direction="column"
            alignItems="center"
            justifyContent={"center"}
          >
            <Text>Seller will receive notification of your proposal</Text>
          </Stack>
        </Stack>
        <Flex justifyContent={"space-between"}>
          <TableContainer>
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: "xl", sm: "xl", lg: "xl" }}
            >
              Proposed Biddings:
            </Heading>
            <Table mt={8} size="sm">
              <Thead>
                <Tr>
                  <Th>Quantity</Th>
                  <Th>Price</Th>
                </Tr>
              </Thead>
              <Tbody>
                {biddingData &&
                  biddingData.map(({ id, price, quantity }) => (
                    <Tr h={"15px"} key={id}>
                      <Td>{quantity}</Td>
                      <Td>{price}</Td>
                      {isOwner ? <Button size={"xs"}>Accept</Button> : null}
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </TableContainer>
          <TableContainer>
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: "xl", sm: "xl", lg: "xl" }}
            >
              Your Accepted Biddings:
            </Heading>
            <Table mt={8} size="sm">
              <Thead>
                <Tr>
                  <Th>Quantity</Th>
                  <Th>Price</Th>
                </Tr>
              </Thead>
              <Tbody>
                {acceptedBids &&
                  acceptedBids.map(({ id, price, quantity }) => (
                    <Tr h={"15px"} key={id}>
                      <Td>{quantity}</Td>
                      <Td>{price}</Td>
                      {isOwner ? (
                        <Button
                          size={"xs"}
                          onClick={() => {
                            approval();
                          }}
                        >
                          {hash && isConfirmed ? "Approved!" : "Approve "}
                        </Button>
                      ) : null}
                      {hash && isConfirmed && (
                        <Button
                          ml={2}
                          size={"xs"}
                          onClick={() => buyOption(router.query.optionId)}
                        >
                          Buy
                        </Button>
                      )}
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Flex>
        <Button onClick={() => calculateProfit()}>Calculate Profit</Button>
        <Heading
          lineHeight={1.1}
          fontWeight={600}
          fontSize={{ base: "xl", sm: "xl", lg: "xl" }}
        >
          Calculated Profit: {profit}
        </Heading>
      </SimpleGrid>
    </Container>
  );
};

export default index;
