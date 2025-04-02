// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BGT is ERC20 {

    constructor() ERC20("BGT", "BGT") {}

    function unboostedBalanceOf(address account) external view returns (uint256) {
        return 0;
    }

}

contract RewardVault {

    address public vaultToken;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor(address _vaultToken) {
        vaultToken = _vaultToken;
    }

    function stake(uint256 amount) external {
        balanceOf[msg.sender] += amount;
        totalSupply += amount;
    }

    function getReward(address account, address recipient) external returns (uint256) {
        return 0;
    }

}

contract BerachainRewardVaultFactory {
    
    constructor() {}

    function createRewardVault(address vaultToken) external returns (address) {
        return address(new RewardVault(vaultToken));
    }

}