// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ExchangeToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("EXGToken", "EXG") {
        _mint(msg.sender, initialSupply);
    }
}