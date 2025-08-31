// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.4.0
pragma solidity ^0.8.27;

import {ERC20} from "./libs/contracts/token/ERC20/ERC20.sol";

contract aavemock is ERC20 {
    ERC20 public USDC;

    constructor(address _usdc) ERC20("Aave usdc", "aUsdc") {
        USDC = ERC20(_usdc);
    }

    function supply(address , uint256 amount, address onBehalfOf, uint16 ) external {
        USDC.transferFrom(msg.sender,address(this),amount);
        mint(onBehalfOf, amount);
    }
    function withdraw(address , uint256 amount, address to) external returns (uint256) {
        _burn(msg.sender, amount);
        USDC.transfer(to,amount);
        return amount;
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}