// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;
import {AggregatorV3Interface} from "foundry-chainlink-toolkit/src/interfaces/feeds/AggregatorV3Interface.sol";

interface IOracle {
    function getChainlinkDataFeedLatestAnswer(AggregatorV3Interface _dataFeed) external view returns (int);
    function getAssetAddress(string memory _assetSymbol) external view returns (address);
}