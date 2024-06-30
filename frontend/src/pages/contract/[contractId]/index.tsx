//@ts-nocheck comment
import React, { useState } from "react";
// import LiveChart from "@/components/LiveChart/LiveChart";
import { Button } from "@chakra-ui/react";
import dynamic from "next/dynamic";
const LiveChart = dynamic(() => import("@/components/LiveChart/LiveChart"), {
  ssr: false,
});

const index = () => {
  return (
    <div>
      <h1>Stock Candlestick Chart</h1>
      <LiveChart symbol={"IBM"} />
    </div>
  );
};

export default index;
