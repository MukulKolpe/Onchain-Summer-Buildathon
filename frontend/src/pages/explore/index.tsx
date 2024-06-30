import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import optionabi from "../../../abi/optiontrading.json";

const Explore = () => {
  const [options, setOptions] = useState<any[]>([]);
  useEffect(() => {
    const getOptions = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_OPTION_TRADING!,
        optionabi,
        signer
      );

      const x = await contract.totalOptions();

      for (let i = 1; i <= x; i++) {
        const option = await contract.optionIdtoContract(i);
        setOptions((prev) => [...prev, option]);
      }
    };

    getOptions();
  }, []);

  console.log(options);
  return <div>Explore</div>;
};

export default Explore;
