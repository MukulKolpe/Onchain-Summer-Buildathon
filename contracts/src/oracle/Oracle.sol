// SPDX-License-Identifier: MIT

pragma solidity >=0.8.2 <0.9.0;
import {AggregatorV3Interface} from "foundry-chainlink-toolkit/src/interfaces/feeds/AggregatorV3Interface.sol";

contract Oracle {

     mapping(string => address)public assetSymboltoAddress;
     address public owner;

    constructor() {
        owner = msg.sender;
        mapAddresses(); // Initialize the asset mappings
    }

     function mapAddresses() public {
        require (msg.sender == owner,"Only owner can change the asset mappings");
        assetSymboltoAddress["BTC_USD"] = 0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298;
        assetSymboltoAddress["CBETH_USD"] = 0x3c65e28D357a37589e1C7C86044a9f44dDC17134;
        assetSymboltoAddress["DAI_USD"] = 0xD1092a65338d049DB68D7Be6bD89d17a0929945e;
        assetSymboltoAddress["ETH_USD"] = 0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1;
        assetSymboltoAddress["LINK_ETH"] = 0x56a43EB56Da12C0dc1D972ACb089c06a5dEF8e69;
        assetSymboltoAddress["LINK_USD"] = 0xb113F5A928BCfF189C998ab20d753a47F9dE5A61;
        assetSymboltoAddress["USDC_USD"] = 0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165;
        assetSymboltoAddress["USDT_USD"] = 0x3ec8593F930EA45ea58c968260e6e9FF53FC934f;
    }

    function setAssetAddress(string memory _assetSymbol, address _assetAddress) public {
        require (msg.sender == owner,"Only owner can change the asset mappings");
        assetSymboltoAddress[_assetSymbol] = _assetAddress;
    }

    function getAssetAddress(string memory _assetSymbol) external view returns (address) {
        return assetSymboltoAddress[_assetSymbol];
    }

    function getChainlinkDataFeedLatestAnswer(AggregatorV3Interface _dataFeed) external view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = _dataFeed.latestRoundData();
        return answer;
    }
}