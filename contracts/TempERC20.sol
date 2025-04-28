// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TempERC20 {
    IERC20 public token;
    // Dummy function to ensure IERC20 is fully referenced
    function check(address owner, address spender) external view returns (uint256) {
        return token.allowance(owner, spender);
    }
} 