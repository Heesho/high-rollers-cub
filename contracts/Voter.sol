// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IPlugin {
    function setGauge(address _gauge) external;
    function setBribe(address _bribe) external;
}

contract RewardToken is ERC20 {

    constructor() ERC20("BeroCallOption", "oBERO") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}

contract Gauge {

    address public immutable OTOKEN;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor(address otoken_) {
        OTOKEN = otoken_;
    }

    function _deposit(address account, uint256 amount) external {
        balanceOf[account] += amount;
        totalSupply += amount;
    }

    function _withdraw(address account, uint256 amount) external {
        balanceOf[account] -= amount;
        totalSupply -= amount;
    }

    function earned(address account, address token) external pure returns (uint256) {
        return 10e18;
    }

    function getRewardForDuration(address token) external pure returns (uint256) {
        return 100e18;
    }

    function getReward(address account) external {
        RewardToken(OTOKEN).mint(account, 10e18);
    }

}

contract Bribe {
    using SafeERC20 for IERC20;

    function notifyRewardAmount(address token, uint256 amount) external {
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    }

}

contract Voter {

    address public immutable OTOKEN;
    address public immutable GAUGE;
    address public immutable BRIBE;
    
    constructor() {
        OTOKEN = address(new RewardToken());
        GAUGE = address(new Gauge(OTOKEN));
        BRIBE = address(new Bribe());
    }

    function setPlugin(address plugin_) external {
        IPlugin(plugin_).setGauge(GAUGE);
        IPlugin(plugin_).setBribe(BRIBE);
    }

    function getReward(address account) external {
        Gauge(GAUGE).getReward(account);
    }

}