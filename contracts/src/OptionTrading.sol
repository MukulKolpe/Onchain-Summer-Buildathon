// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;
import "./ExchangeToken.sol";
import {AggregatorV3Interface} from "foundry-chainlink-toolkit/src/interfaces/feeds/AggregatorV3Interface.sol";
// import {IERC20} from "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";

contract OptionsTrading {

    struct OptionContract {
        uint256 contractId;
        address owner;
        address buyer;
        uint256 expiryTime;

        uint256 strikePrice;
        uint256 contractType; // 1 -> CALL option , 2-> PUT option
        uint256 marginValue;
        uint256 premiumValue;
        uint256 units;
        address assetAddress;
    }

    address owner;
    address exchangeTokenAdd;  // ERC20 token in which the premium is paid to the contract seller (can be usdc,usdt,dai,etc.)
    ExchangeToken exchangeToken;
    // uint256 public staticAssetPrice = 3;
    uint256 public totalOptions = 0; // total number of options contracts
    mapping(uint256 => OptionContract) public optionIdtoContract;
    mapping(address => mapping(uint256 => uint256)) public userAddtoOptionoptionIdtoMarginVal;
    mapping(uint256 => bool)public optionIdtoStatus; // true for call/put right excercised by buyer
    mapping(string => address)public assetSymboltoAddress;
    //AggregatorV3Interface internal staticdDataFeed;

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


    constructor(address _exchangeTokenAdd) {
        owner = msg.sender;
        exchangeTokenAdd = _exchangeTokenAdd;
        exchangeToken = ExchangeToken(_exchangeTokenAdd);
        mapAddresses();
    }

    function getChainlinkDataFeedLatestAnswer(AggregatorV3Interface _dataFeed) public view returns (int) {
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

    function getChainlinkDataFeedLatestAnswerStatic(address _assetAddress) public view returns (int,string memory,uint8) {
        AggregatorV3Interface staticdDataFeed = AggregatorV3Interface(
            _assetAddress
        );
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = staticdDataFeed.latestRoundData();
        string memory ansDesc = staticdDataFeed.description();
        uint8 decimals = staticdDataFeed.decimals();
        return (answer,ansDesc,decimals);
    }


    function listOptionOnExchange(address _owner,uint256 _expityTime,uint256 _strikePrice,uint256 _contractType,uint256 _premiumValue,uint256 _units,string memory _assetSymbol) public {
        // calculate margin Value
        address _assetAddress = assetSymboltoAddress[_assetSymbol];
        uint256 _marginValue = calculateMargin(_units,_assetAddress);
        require(exchangeToken.balanceOf(msg.sender) >= _marginValue,"Buyer does not have enough margin value");
        
        // if buyer has more than margin value then transfer the margin value to this contract
        exchangeToken.approve(address(this), _marginValue);
        exchangeToken.transferFrom(msg.sender, address(this), _marginValue);

        // reflect in mappings
        totalOptions++;
        OptionContract memory optContract = OptionContract(totalOptions,_owner,_owner,_expityTime,_strikePrice*10**6,_contractType,_marginValue,_premiumValue*10**6,_units,_assetAddress);
        optionIdtoContract[totalOptions] = optContract;
    }
    
    function buyOption(uint256 _optionId) public {
        // transfer exchnage token to seller equal to premium
        address optionOwner = optionIdtoContract[_optionId].owner;
        uint256 optionPremium = optionIdtoContract[_optionId].premiumValue;
        exchangeToken.approve(optionOwner, optionPremium);
        exchangeToken.transferFrom(msg.sender, optionOwner, optionPremium);

        // reflect in mappings
        optionIdtoContract[_optionId].buyer = msg.sender;

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
        uint256 _assetPrice = uint256 (getChainlinkDataFeedLatestAnswer(dataFeed));
        uint256 finalMargin = (_assetPrice * _assetUnits*(10**10)) + ((10**9) * (_assetPrice * _assetUnits));
        finalMargin = finalMargin / (10**12);
        return finalMargin;
    }

    // function excerciseRight(uint256 _optionId) public {
    //     require(msg.sender == optionIdtoContract[_optionId].buyer,"Only buyer can excercise the right");
    //     require(block.timestamp <= optionIdtoContract[_optionId].expiryTime,"Right to buy/sell can be excercised only before the expiry time");
    //     uint256 currMarketPrice = 2* (10**18);
    //     require(optionIdtoContract[_optionId].strikePrice > currMarketPrice,"Profit must be greater than zero");
    //     uint256 profit = (optionIdtoContract[_optionId].strikePrice - currMarketPrice) * optionIdtoContract[_optionId].units;
    //     uint256 ownerBalance = exchangeToken.balanceOf(optionIdtoContract[_optionId].owner);
    //     require(ownerBalance >= profit,"Owner balance should be greater than than the profit caused");
    //     if(ownerBalance >= profit){
    //         exchangeToken.approve(optionIdtoContract[_optionId].buyer, profit);
    //         exchangeToken.transferFrom(optionIdtoContract[_optionId].owner, optionIdtoContract[_optionId].owner, profit);
    //     }
    //     else{
    //         // excercise the margin value option
    //     }
    // }

    // function excerciseMarginValueOption(uint256 _optionId,uint256 _profit) public {
    //     address optOwner = optionIdtoContract[_optionId].owner;
    //     address buyer = optionIdtoContract[_optionId].buyer;
    //     require(userAddtoOptionoptionIdtoMarginVal[optOwner][_optionId] >= _profit,"Margin value is not greater than profit");
    //     exchangeToken.transfer(buyer, _profit);
    // }

    // ----- CALL OPTION FUNCTIONS ------

    // if the return value from this function is +ve -> buyer has profited and if -ve -> seller has profited(= premium)
    function calculateCallProfit(uint256 _optionId) public view returns (uint256){
        uint256 strikePrice = optionIdtoContract[_optionId].strikePrice;
        uint256 units = optionIdtoContract[_optionId].units;
        address _assetAddress = optionIdtoContract[_optionId].assetAddress;
        AggregatorV3Interface dataFeed;
        dataFeed = AggregatorV3Interface(
            _assetAddress
        );
        uint256 _assetPrice = uint256 (getChainlinkDataFeedLatestAnswer(dataFeed));
        _assetPrice = _assetPrice * (10**10);
        _assetPrice = _assetPrice / (10**12);
        if((_assetPrice) > strikePrice){
            uint256 profit = ((_assetPrice) - strikePrice) * units;
            return profit;
        }
        else{
            return 0;
        }
    }

    // this function is to be called by buyer if he wants to excercise his option to call
    function excerciseCallRight(uint256 _optionId) public {
        require(optionIdtoStatus[_optionId] == false,"Buyer has already exercised the call right");
        uint256 profit = calculateCallProfit(_optionId);
        address buyer = optionIdtoContract[_optionId].buyer;
        address optionOwner = optionIdtoContract[_optionId].owner;
        if(profit > 0){
            uint256 marginVal = optionIdtoContract[_optionId].marginValue;
            exchangeToken.approve(buyer, profit);
            exchangeToken.transferFrom(address(this), buyer, profit);
            marginVal -= profit;
            exchangeToken.approve(optionOwner, marginVal);
            exchangeToken.transferFrom(address(this), optionOwner, marginVal);
            optionIdtoStatus[_optionId] = true;
        }
    }

    // ---- PUT Option functions ----
    function calculatePutProfit(uint256 _optionId) public view returns(uint256) {
        uint256 strikePrice = optionIdtoContract[_optionId].strikePrice;
        uint256 units = optionIdtoContract[_optionId].units;
        address _assetAddress = optionIdtoContract[_optionId].assetAddress;
        AggregatorV3Interface dataFeed;
        dataFeed = AggregatorV3Interface(
            _assetAddress
        );
        uint256 _assetPrice = uint256 (getChainlinkDataFeedLatestAnswer(dataFeed));
        _assetPrice = _assetPrice * (10**10);
        _assetPrice = _assetPrice / (10**12);
        if((_assetPrice) < strikePrice){
            uint256 profit = (strikePrice - (_assetPrice)) * units;
            return profit;
        }
        else{
            return 0;
        }
    }

    // this function is to be called by buyer if he wants to excercise his option to call
    function excercisePutRight(uint256 _optionId) public {
        require(optionIdtoStatus[_optionId] == false,"Buyer has already exercised the call right");
        uint256 profit = calculatePutProfit(_optionId);
        address buyer = optionIdtoContract[_optionId].buyer;
        address optionOwner = optionIdtoContract[_optionId].owner;
        if(profit > 0){
            uint256 marginVal = optionIdtoContract[_optionId].marginValue;
            exchangeToken.approve(buyer, profit);
            exchangeToken.transferFrom(address(this), buyer, profit);
            marginVal -= profit;
            exchangeToken.approve(optionOwner, marginVal);
            exchangeToken.transferFrom(address(this), optionOwner, marginVal);
            optionIdtoStatus[_optionId] = true;
        }
    }


    // function changeStaticAssetPrice(uint256 _newPrice) public {
    //     require(msg.sender == owner,"Only owner can change the asset price");
    //     staticAssetPrice = _newPrice;
    // }


}