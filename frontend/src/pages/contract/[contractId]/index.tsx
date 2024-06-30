import React from "react";
import { useRouter } from "next/router";

const index = () => {
  const router = useRouter();
  return <div>{router.query.contractId}</div>;
};

export default index;
