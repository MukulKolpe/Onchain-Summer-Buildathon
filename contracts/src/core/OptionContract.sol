// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;
import "../ExchangeToken.sol";
import "../interfaces/IOracle.sol";

contract OptionContract{

    address public owner;
    address public buyer;
    uint256 public expiryTime;
    uint256 public strikePrice;
    uint256 public contractType;
    uint256 public marginValue;
    uint256 public premiumValue;
    uint256 public units;
    address public assetAddress;
    address public exchangeTokenAddress;
    ExchangeToken public exchangeToken;
    IOracle public oracle;
    bool public status;

    constructor(
        address _owner,
        address _buyer,
        uint256 _expiryTime,
        uint256 _strikePrice,
        uint256 _contractType,
        uint256 _marginValue,
        uint256 _premiumValue,
        uint256 _units,
        address _assetAddress,
        address _exchangeTokenAddress,
        IOracle _oracle
    ) {
        owner = _owner;
        buyer = _buyer;
        expiryTime = _expiryTime;
        strikePrice = _strikePrice;
        contractType = _contractType;
        marginValue = _marginValue;
        premiumValue = _premiumValue;
        units = _units;
        assetAddress = _assetAddress;
        exchangeTokenAddress = _exchangeTokenAddress;
        exchangeToken = ExchangeToken(_exchangeTokenAddress);
        oracle = _oracle;
    }

    // ----- BUY OPTION FUNCTIONS ------

    function buyOption() public {
        // transfer exchnage token to seller equal to premium value
        exchangeToken.approve(owner, premiumValue);
        require(exchangeToken.allowance(msg.sender, owner) >= premiumValue, "Low allowance");
        require(exchangeToken.transferFrom(msg.sender, owner, premiumValue), "Transfer failed");
        buyer = msg.sender;
    }


    // ----- CALL OPTION FUNCTIONS ------

    // if the return value from this function is +ve -> buyer has profited and if -ve -> seller has profited(= premium)

    function calculateCallProfit() public view returns (uint256){
        AggregatorV3Interface dataFeed;
        dataFeed = AggregatorV3Interface(
           assetAddress
        );
        uint256 _assetPrice = uint256 (oracle.getChainlinkDataFeedLatestAnswer(dataFeed));
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
    function excerciseCallRight() public {
        require(status == false,"Buyer has already exercised the call right");
        uint256 profit = calculateCallProfit();      
        if(profit > 0){
            exchangeToken.approve(buyer, profit);
            require(exchangeToken.allowance(address(this), buyer) >= profit, "Low allowance");
            require(exchangeToken.transferFrom(address(this), buyer, profit), "Transfer failed");
            marginValue -= profit;
            exchangeToken.approve(owner, marginValue);
            require(exchangeToken.allowance(address(this),owner) >= marginValue, "Low allowance for option owner");
            require(exchangeToken.transferFrom(address(this),owner, marginValue), "Transfer failed for option owner");
            status = true;
        }
    }

     // ---- PUT Option functions ----

    // if the return value from this function is +ve -> buyer has profited and if -ve -> seller has profited(= premium)
    function calculatePutProfit() public view returns(uint256) {
        AggregatorV3Interface dataFeed;
        dataFeed = AggregatorV3Interface(
            assetAddress
        );
        uint256 _assetPrice = uint256 (oracle.getChainlinkDataFeedLatestAnswer(dataFeed));
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
    function excercisePutRight() public {
        require(status == false,"Buyer has already exercised the call right");
        uint256 profit = calculatePutProfit();
        if(profit > 0){
            exchangeToken.approve(buyer, profit);
            require(exchangeToken.allowance(address(this), buyer) >= profit, "Low allowance for buyer");
            require(exchangeToken.transferFrom(address(this), buyer, profit), "Transfer failed for buyer");
            marginValue -= profit;
            exchangeToken.approve(owner,marginValue);
            require(exchangeToken.allowance(address(this),owner) >= marginValue, "Low allowance for option owner");   
            exchangeToken.transferFrom(address(this),owner,marginValue);
            status = true;
        }
    }
}