// @ts-nocheck comment
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { headers } from "next/headers";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { cookieToInitialState } from "wagmi";
import Navbar from "@/components/Navbar";

import { getConfig } from "@/utils/wagmi";
import { Providers } from "@/utils/providers";

const colors = {
  brand: {
    50: "#ecefff",
    100: "#cbceeb",
    200: "#a9aed6",
    300: "#888ec5",
    400: "#666db3",
    500: "#4d5499",
    600: "#3c4178",
    700: "#2a2f57",
    800: "#181c37",
    900: "#080819",
  },
};
const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({ colors, config });

export default function App({ Component, pageProps }: AppProps) {
  const initialState = cookieToInitialState(getConfig());
  return (
    <ChakraProvider theme={theme}>
      <Providers initialState={initialState}>
        <Navbar />
        <Component {...pageProps} />{" "}
      </Providers>
    </ChakraProvider>
  );
}
