//@ts-nocheck comment
import React, { useEffect, useMemo, useState } from "react";
import { fetchStockData } from "../../utils/services";
import { formatStockData } from "../../utils/graphutils";
import ReactApexChart from "react-apexcharts";
import { candleStickOptions } from "../../utils/constants";

const LiveChart = ({ symbol }) => {
  const [stockData, setStockData] = useState({});
  const [signal, setSignal] = useState(false);

  useEffect(() => {
    fetchStockData(symbol).then((data) => setStockData(data));
  }, []);

  const handleSignal = async () => {
    setSignal(!signal);
  };

  const seriesData = useMemo(() => formatStockData(stockData), [stockData]);
  return (
    <div>
      <ReactApexChart
        series={[
          {
            data: seriesData,
          },
        ]}
        options={candleStickOptions}
        type="candlestick"
      />
    </div>
  );
};

export default LiveChart;
