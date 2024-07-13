// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;
import "./OptionContract.sol";
import "../ExchangeToken.sol";
import "../interfaces/IOracle.sol";
import {AggregatorV3Interface} from "foundry-chainlink-toolkit/src/interfaces/feeds/AggregatorV3Interface.sol";

contract OptionFactory {

    OptionContract[] public optionContracts;
    IOracle public oracle;
    ExchangeToken public exchangeToken;

    constructor(address _oracleAddress,address _exchangeTokenAddress) {
        oracle = IOracle(_oracleAddress);
        exchangeToken = ExchangeToken(_exchangeTokenAddress);
    }


    function createOptionContract(
        address _owner,
        address _buyer,
        uint256 _expiryTime,
        uint256 _strikePrice,
        uint256 _contractType,
        uint256 _premiumValue,
        uint256 _units,
        string memory _assetSymbol
    ) public {
        require(_expiryTime > block.timestamp, "Expiry time should be in the future");
        require(_contractType == 1 || _contractType == 2, "Invalid contract type");

        address _assetAddress = oracle.getAssetAddress(_assetSymbol);
        require(_assetAddress != address(0), "Invalid asset symbol");

        uint256 _marginValue = calculateMargin(_units,_assetAddress);
        require(exchangeToken.balanceOf(msg.sender) >= _marginValue,"Buyer does not have enough margin value");

        exchangeToken.approve(address(this), _marginValue);
        require(exchangeToken.allowance(msg.sender, address(this)) >= _marginValue, "Low allowance");

        require(exchangeToken.transferFrom(msg.sender, address(this), _marginValue), "Transfer failed");

        OptionContract newOptionContract = new OptionContract(
            _owner,
            _buyer,
            _expiryTime,
            _strikePrice,
            _contractType,
            _marginValue,
            _premiumValue,
            _units,
            _assetAddress,
            address(exchangeToken),
            oracle
        );
        optionContracts.push(newOptionContract);
    }

     function calculateMargin(uint256 _assetUnits,address _assetAddress) public view returns (uint256) {
        // take current price if the asset from chainlink price feeds and store it in a variable 'price'
        // multiply price * units + additional 10% of the product of (price * units)

        // use _assetAddress to get its price from chainlink pricefeeds in actual contract
        
        // margin value = (price of asset * number of units) + ((10/100) * (price of asset * number of units)) -> 10% more than possible loss that can incur
        
        AggregatorV3Interface dataFeed;
        dataFeed = AggregatorV3Interface(
            _assetAddress
        );
        uint256 _assetPrice = uint256 (oracle.getChainlinkDataFeedLatestAnswer(dataFeed));
        uint256 finalMargin = (_assetPrice * _assetUnits*(10**10)) + ((10**9) * (_assetPrice * _assetUnits));
        finalMargin = finalMargin / (10**12);
        return finalMargin;
    }


    function getOptionContractsCount() public view returns (uint256) {
        return optionContracts.length;
    }
}