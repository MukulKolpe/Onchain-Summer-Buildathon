// @ts-nocheck comment
import React, { useState } from "react";
import {
  Box,
  Button,
  Heading,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Select,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import tokenabi from "../../../abi/erc20abi.json";
import optionabi from "../../../abi/optiontrading.json";
import { ethers } from "ethers";

const CreateOptionForm = () => {
  const toast = useToast();
  const [tokenAmt, setTokenAmt] = useState(0);
  const [strikePrice, setStrikePrice] = useState(0);
  const [premiumPrice, setPremiumPrice] = useState(0);
  const [token, setToken] = useState("");
  const [contractExpiration, setContractExpiration] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const account = useAccount();

  const convertToEpoch = (dateString: any) => {
    const epochValue = new Date(dateString + "T00:00:00Z").getTime() / 1000;
    console.log(epochValue * 1000);
    return epochValue * 1000;
  };

  const approval = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_TOKEN_ADDRESS,
      tokenabi,
      signer
    );

    const tx = await contract.approve(
      process.env.NEXT_PUBLIC_OPTION_TRADING,
      tokenAmt * 2 * 10 ** 6
    );

    await tx.wait(1);
    setIsApproved(true);

    toast({
      title: "Approval Successful",
      description: "You have successfully approved the contract",
      status: "success",
      duration: 9000,
      isClosable: true,
    });
  };

  const createOption = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_OPTION_TRADING,
      optionabi,
      signer
    );

    const address = account.addresses[0];

    const tx = await contract.listOptionOnExchange(
      address,
      contractExpiration,
      strikePrice,
      2,
      premiumPrice,
      tokenAmt,
      token + "_USD"
    );

    await tx.wait(1);

    toast({
      title: "Option Created",
      description: "You have successfully created the option",
      status: "success",
      duration: 9000,
      isClosable: true,
    });
  };

  return (
    <>
      <Box
        borderWidth="1px"
        rounded="lg"
        shadow="1px 1px 3px rgba(0,0,0,0.3)"
        maxWidth={800}
        p={6}
        m="10px auto"
        as="form"
      >
        <SimpleGrid columns={1} spacing={6}>
          <Heading w="100%" textAlign={"center"} fontWeight="normal" mb="2%">
            Create Option on Exchange
          </Heading>
          <FormControl mt="2%">
            <FormLabel
              htmlFor="token"
              fontSize="sm"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: "gray.50",
              }}
            >
              Select Token
            </FormLabel>
            <Select
              id="token"
              name="token"
              autoComplete="token"
              placeholder="Select option"
              focusBorderColor="brand.400"
              shadow="sm"
              size="sm"
              w="full"
              rounded="md"
              onChange={(e) => setToken(e.target.value)}
            >
              <option>BTC</option>
              <option>USDC</option>
              <option>USDT</option>
              <option>LINK</option>
            </Select>
          </FormControl>
          <FormControl mr="2%">
            <FormLabel htmlFor="token-amount" fontWeight={"normal"}>
              Amount of Tokens
            </FormLabel>
            <Input
              id="loan-amount"
              placeholder="Enter token amount"
              autoComplete="token-amount"
              onChange={(e) => setTokenAmt(e.target.value as any)}
            />
          </FormControl>
          <FormControl mr="2%">
            <FormLabel htmlFor="strike-price" fontWeight={"normal"}>
              Strike Price
            </FormLabel>
            <Input
              id="strike-price"
              placeholder="Enter Strike Price"
              onChange={(e) => setStrikePrice(e.target.value as any)}
            />
          </FormControl>
          <FormControl mr="2%">
            <FormLabel htmlFor="premium-price" fontWeight={"normal"}>
              Premium Price
            </FormLabel>
            <Input
              id="premium-price"
              placeholder="Enter premium price"
              onChange={(e) => setPremiumPrice(e.target.value as any)}
            />
          </FormControl>
          <FormControl mr="5%">
            <FormLabel htmlFor="datetime-local" fontWeight={"normal"}>
              Contract Expiration Date
            </FormLabel>
            <Input
              placeholder="Select Date and Time"
              size="md"
              type="date"
              id="datetime-local"
              onChange={(e) => {
                setContractExpiration(convertToEpoch(e.target.value) as any);
              }}
            />
          </FormControl>
          <Button colorScheme="teal" variant="solid" onClick={approval}>
            {isApproved ? "Approved Successfully!" : "Approve Contract"}
          </Button>
          {isApproved && (
            <Button colorScheme="teal" variant="solid" onClick={createOption}>
              Create Option
            </Button>
          )}
        </SimpleGrid>
      </Box>
    </>
  );
};

export default CreateOptionForm;
