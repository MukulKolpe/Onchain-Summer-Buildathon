import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import optionabi from "../../../abi/optiontrading.json";
import {
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Box,
  Heading,
  VStack,
  HStack,
} from "@chakra-ui/react";

const Explore = () => {
  const [options, setOptions] = useState<any[]>([]);

  useEffect(() => {
    const getOptions = async () => {
      const rpc = "https://sepolia.base.org";
      const provider = new ethers.providers.JsonRpcProvider(rpc);
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_OPTION_TRADING!,
        optionabi,
        provider
      );

      const x = await contract.totalOptions();
      let cacheOptions: any[] = [];

      for (let i = 1; i <= x; i++) {
        const option = await contract.optionIdtoContract(i);
        cacheOptions.push(option);
      }
      setOptions(cacheOptions);
    };

    getOptions();
  }, []);

  console.log(options);

  return (
    <Box display="flex" justifyContent="center" minHeight="100vh" p={4}>
      <VStack spacing={6} width="100%" maxW="6xl">
        <Heading as="h1" size="xl" mb={6}>
          All Option Contracts
        </Heading>
        <TableContainer
          boxShadow="lg"
          rounded="md"
          p={6}
          borderRadius="md"
          width="100%"
        >
          <Table variant="striped" colorScheme="teal">
            <Thead>
              <Tr>
                <Th>Option Id</Th>
                <Th>Asset Name</Th>
                <Th>Units</Th>
                <Th>Expiry (in Days)</Th>
                <Th>Bid</Th>
              </Tr>
            </Thead>
            <Tbody>
              {options.map((item) => {
                const millisecdiff = item.expiryTime.toNumber() - Date.now();
                const days = Math.floor(millisecdiff / (1000 * 60 * 60 * 24));
                return (
                  <Tr key={item.optionId}>
                    <Td>{item[0].toString()}</Td>
                    <Td>USDC</Td>
                    <Td>{item.units.toString()}</Td>
                    <Td>{days} Left</Td>
                    <Td>
                      <Button colorScheme="teal">Bid</Button>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>
    </Box>
  );
};

export default Explore;
