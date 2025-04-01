// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IMapPlugin {
    struct Pixel {
        address account;
        uint256 faction;
        string color;
    }
    struct Faction {
        address owner;
        uint256 balance;
        uint256 totalPlaced;
        bool isActive;
    }
    function placeFor(address account, uint256 faction, string calldata color, uint256[] calldata indexes) external;
    function getGauge() external view returns (address);
    function placePrice() external view returns (uint256);
    function getFaction(uint256 index) external view returns (Faction memory);
    function getPixel(uint256 index) external view returns (Pixel memory);
    function getPixels(uint256 startIndex, uint256 endIndex) external view returns (Pixel[] memory);
    function factionMax() external view returns (uint256);
    function index_Faction(uint256 index) external view returns (Faction memory);
    function account_Placed(address account) external view returns (uint256);
    function account_Faction_Balance(address account, uint256 faction) external view returns (uint256);
    function account_Faction_Placed(address account, uint256 faction) external view returns (uint256);
}

interface IGauge {
    function totalSupply() external view returns (uint256);
    function getRewardForDuration(address token) external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function earned(address account, address token) external view returns (uint256);
    function getReward(address account) external;
}

interface IWBERA {
    function deposit() external payable;
}

contract Multicall {
    using SafeERC20 for IERC20;

    address public immutable base;
    address public immutable plugin;
    address public immutable voter;
    address public immutable oBERO;

    struct AccountState {
        uint256 balance;
        uint256 placed;
        uint256[] factionBalance;
        uint256[] factionPlaced;
    }

    struct GaugeState {
        uint256 rewardPerToken;
        uint256 totalSupply;
        uint256 balance;
        uint256 earned;
        uint256 oBeroBalance;
    }

    constructor(address _base, address _plugin, address _voter, address _oBERO) {
        base = _base;
        plugin = _plugin;
        voter = _voter;
        oBERO = _oBERO;
    }

    function placeFor(address account, uint256 faction, string calldata color, uint256[] calldata indexes) external payable {
        IWBERA(base).deposit{value: msg.value}();
        IERC20(base).safeApprove(plugin, 0);
        IERC20(base).safeApprove(plugin, msg.value);
        IMapPlugin(plugin).placeFor(account, faction, color, indexes);
    }

    function getReward(address account) external {
        IGauge(IMapPlugin(plugin).getGauge()).getReward(account);
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}

    function getPlacePrice() external view returns (uint256) {
        return IMapPlugin(plugin).placePrice();
    }

    function getGauge(address account) external view returns (GaugeState memory gaugeState) {
        address gauge = IMapPlugin(plugin).getGauge();
        gaugeState.rewardPerToken = IGauge(gauge).totalSupply() == 0 ? 0 : (IGauge(gauge).getRewardForDuration(oBERO) * 1e18 / IGauge(gauge).totalSupply());
        gaugeState.totalSupply = IGauge(gauge).totalSupply();
        gaugeState.balance = IGauge(gauge).balanceOf(account);
        gaugeState.earned = IGauge(gauge).earned(account, oBERO);
        gaugeState.oBeroBalance = IERC20(oBERO).balanceOf(account);
    }

    function getAccountState(address account) external view returns (AccountState memory accountState) {
        address gauge = IMapPlugin(plugin).getGauge();
        accountState.balance = IGauge(gauge).balanceOf(account);
        accountState.placed = IMapPlugin(plugin).account_Placed(account);
        uint256 maxFactions = IMapPlugin(plugin).factionMax();
        accountState.factionBalance = new uint256[](maxFactions);
        accountState.factionPlaced = new uint256[](maxFactions);
        for (uint256 i = 0; i < maxFactions; i++) {
            accountState.factionBalance[i] = IMapPlugin(plugin).account_Faction_Balance(account, i);
            accountState.factionPlaced[i] = IMapPlugin(plugin).account_Faction_Placed(account, i);
        }
    }

    function getFactions() external view returns (IMapPlugin.Faction[] memory) {
        uint256 maxFactions = IMapPlugin(plugin).factionMax();
        IMapPlugin.Faction[] memory factions = new IMapPlugin.Faction[](maxFactions);
        for (uint256 i = 0; i < maxFactions; i++) {
            factions[i] = IMapPlugin(plugin).getFaction(i + 1);
        }
        return factions;
    }

    function getPixel(uint256 index) external view returns (IMapPlugin.Pixel memory) {
        return IMapPlugin(plugin).getPixel(index);
    }

    function getPixels(uint256 startIndex, uint256 endIndex) external view returns (IMapPlugin.Pixel[] memory) {
        return IMapPlugin(plugin).getPixels(startIndex, endIndex);
    }

}