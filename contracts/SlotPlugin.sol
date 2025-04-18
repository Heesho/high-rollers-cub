// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import { IEntropyConsumer } from "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";
import { IEntropy } from "@pythnetwork/entropy-sdk-solidity/IEntropy.sol";

interface IGauge {
    function _deposit(address account, uint256 amount) external;
    function getReward(address account) external;
    function balanceOf(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);
}

interface IBribe {
    function notifyRewardAmount(address token, uint amount) external;
}

interface IVoter {
    function OTOKEN() external view returns (address);
}

interface IBerachainRewardVaultFactory {
    function createRewardVault(address _vaultToken) external returns (address);
}

interface IRewardVault {
    function stake(uint256 amount) external;
    function getReward(address account, address recipient) external returns (uint256);
}

interface IBGT {
    function unboostedBalanceOf(address account) external view returns (uint256);
    function redeem(address receiver, uint256 amount) external;
}

interface IWBERA {
    function deposit() external payable;
}

contract VaultToken is ERC20, Ownable {

    constructor() ERC20("HighRollersCub", "HighRollersCub") {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}

contract SlotPlugin is ReentrancyGuard, Ownable, IEntropyConsumer {
    using SafeERC20 for IERC20;

    /*----------  CONSTANTS  --------------------------------------------*/

    string public constant PROTOCOL = "CubHub";
    string public constant NAME = "HighRollersCub";

    uint256 public constant DURATION = 7 days;
    uint256 public constant DEPOSIT_AMOUNT = 1 ether;
    uint256 public constant BASIS_POINTS = 10000; // 100% = 10000

    address public constant BGT = 0x656b95E550C07a9ffe548bd4085c72418Ceb1dba;

    /*----------  STATE VARIABLES  --------------------------------------*/

    IERC20 private immutable token;
    address private immutable OTOKEN;
    address private immutable voter;
    address private gauge;
    address private bribe;

    address private vaultToken;
    address private rewardVault;

    address[] private assetTokens;
    address[] private bribeTokens;

    address public treasury;
    address public developer;
    address public incentives;
    bool public activeBribes = true;
    bool public activeIncentives = false;

    struct RewardTier {
        uint256 threshold;     // Upper threshold for this tier (in basis points)
        uint256 rewardPercent; // Reward percentage in basis points (1% = 100)
    }

    IEntropy public entropy;
    uint256 public playPrice = 0.01 ether;
    bool public initialized = false;

    mapping(uint64 => address) public pendingPlays;
    RewardTier[10] public rewardTiers;

    /*----------  ERRORS ------------------------------------------------*/

    error Plugin__NotAuthorizedVoter();
    error Plugin__InvalidZeroAddress();
    error Plugin__NotAuthorizedDeveloper();
    error Plugin__NotInitialized();
    error Plugin__InsufficientCost();
    error Plugin__InsufficientFee();
    error Plugin__InvalidSequence();
    error Plugin__InvalidThresholds();
    error Plugin__AlreadyInitialized();

    /*----------  EVENTS ------------------------------------------------*/

    event Plugin__Played(address indexed account, uint256 cost, uint256 reward);
    event Plugin__ClaimedAndDistributed(uint256 bribeAmount, uint256 incentivesAmount, uint256 developerAmount, uint256 treasuryAmount);
    event Plugin__ActiveBribesSet(bool activeBribes);
    event Plugin__ActiveIncentivesSet(bool activeIncentives);
    event Plugin__TreasurySet(address treasury);
    event Plugin__DeveloperSet(address developer);
    event Plugin__IncentivesSet(address incentives);
    event Plugin__Initialized();
    event Plugin__SpinRequest(uint64 sequenceNumber, address player);
    event Plugin__SpinResult(address indexed player, uint64 sequenceNumber, uint256 randomValue, uint256 rewardPercent, uint256 oTokenReward, uint256 tokenReward);
    event Plugin__PlayPriceSet(uint256 playPrice);
    event Plugin__RewardTiersSet(uint256[10] thresholds, uint256[10] rewardPercents);

    /*----------  MODIFIERS  --------------------------------------------*/

    modifier onlyVoter() {
        if (msg.sender != voter) revert Plugin__NotAuthorizedVoter();
        _;
    }

    /*----------  FUNCTIONS  --------------------------------------------*/

    constructor(
        address _token, // WBERA
        address _voter,
        address[] memory _assetTokens, // [WBERA]
        address[] memory _bribeTokens, // [WBERA]
        address _treasury,
        address _developer,
        address _vaultFactory,
        address _entropy
    ) {
        token = IERC20(_token);
        voter = _voter;
        assetTokens = _assetTokens;
        bribeTokens = _bribeTokens;
        treasury = _treasury;
        developer = _developer;
        incentives = _treasury;
        entropy = IEntropy(_entropy);

        OTOKEN = IVoter(_voter).OTOKEN();
        vaultToken = address(new VaultToken());
        rewardVault = IBerachainRewardVaultFactory(_vaultFactory).createRewardVault(address(vaultToken));

        rewardTiers[0] = RewardTier({threshold: 100, rewardPercent: 3000});    // 0-1%:    30% reward
        rewardTiers[1] = RewardTier({threshold: 300, rewardPercent: 1500});    // 1-3%:    15% reward
        rewardTiers[2] = RewardTier({threshold: 800, rewardPercent: 500});     // 3-8%:    5% reward
        rewardTiers[3] = RewardTier({threshold: 5000, rewardPercent: 50});     // 8-50%:   0.5% reward
        rewardTiers[4] = RewardTier({threshold: 6000, rewardPercent: 25});     // 50-60%:  0.25% reward
        rewardTiers[5] = RewardTier({threshold: 7000, rewardPercent: 10});     // 60-70%:  0.1% reward
        rewardTiers[6] = RewardTier({threshold: 8000, rewardPercent: 5});      // 70-80%:  0.05% reward
        rewardTiers[7] = RewardTier({threshold: 9000, rewardPercent: 2});      // 80-90%:  0.02% reward
        rewardTiers[8] = RewardTier({threshold: 9500, rewardPercent: 1});      // 90-95%:  0.01% reward
        rewardTiers[9] = RewardTier({threshold: 10000, rewardPercent: 0});     // 95-100%: no reward
    }

    function claimAndDistribute() external nonReentrant {
        uint256 balance = address(this).balance;
        if (balance > DURATION) {
            uint256 bribeAmount = balance * 40 / 100;
            uint256 incentivesAmount = balance * 40 / 100;
            uint256 developerAmount = balance * 10 / 100;
            uint256 treasuryAmount = balance - bribeAmount - incentivesAmount - developerAmount;

            IWBERA(address(token)).deposit{value: balance}();
            
            token.safeTransfer(developer, developerAmount);
            token.safeTransfer(treasury, treasuryAmount);

            uint256 totalIncentiveAmount = bribeAmount + incentivesAmount;
            if (activeBribes) {
                if (activeIncentives) {
                    token.safeTransfer(incentives, incentivesAmount);
                    token.safeApprove(bribe, 0);
                    token.safeApprove(bribe, bribeAmount);
                    IBribe(bribe).notifyRewardAmount(address(token), bribeAmount);
                    emit Plugin__ClaimedAndDistributed(bribeAmount, incentivesAmount, developerAmount, treasuryAmount);
                } else {
                    token.safeApprove(bribe, 0);
                    token.safeApprove(bribe, totalIncentiveAmount);
                    IBribe(bribe).notifyRewardAmount(address(token), totalIncentiveAmount);
                    emit Plugin__ClaimedAndDistributed(totalIncentiveAmount, 0, developerAmount, treasuryAmount);
                }
            } else {
                token.safeTransfer(incentives, totalIncentiveAmount);
                emit Plugin__ClaimedAndDistributed(0, totalIncentiveAmount, developerAmount, treasuryAmount);
            }
        }
    }

    function play() external payable nonReentrant {
        if (!initialized) revert Plugin__NotInitialized();
        if (msg.value < playPrice) revert Plugin__InsufficientCost();

        bytes32 userRandomNumber = keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender));

        if (address(entropy) != address(0)) {
            address entropyProvider = entropy.getDefaultProvider();
            uint256 fee = entropy.getFee(entropyProvider);
            if (msg.value < playPrice + fee) revert Plugin__InsufficientFee();
            uint64 sequenceNumber = entropy.requestWithCallback{value: fee}(entropyProvider, userRandomNumber);
            pendingPlays[sequenceNumber] = msg.sender;
            emit Plugin__SpinRequest(sequenceNumber, msg.sender);
        } else {
            mockCallback(msg.sender, userRandomNumber);
            emit Plugin__SpinRequest(0, msg.sender);
        }

        IGauge(gauge).getReward(address(this));
        uint256 bgtReward = IRewardVault(rewardVault).getReward(address(this), address(this));
        if (bgtReward > 0) {
            IBGT(BGT).redeem(address(this), bgtReward);
            IWBERA(address(token)).deposit{value: bgtReward}();
        }
    }

    function initialize() external {
        if (initialized) revert Plugin__AlreadyInitialized();
        initialized = true;

        IGauge(gauge)._deposit(address(this), DEPOSIT_AMOUNT);

        VaultToken(vaultToken).mint(address(this), DEPOSIT_AMOUNT);
        IERC20(vaultToken).safeApprove(rewardVault, 0);
        IERC20(vaultToken).safeApprove(rewardVault, DEPOSIT_AMOUNT);
        IRewardVault(rewardVault).stake(DEPOSIT_AMOUNT);

        emit Plugin__Initialized();
    }

    receive() external payable {}

    /*----------  RESTRICTED FUNCTIONS  ---------------------------------*/

    function entropyCallback(
        uint64 sequenceNumber,
        address,
        bytes32 randomNumber
    ) internal override {
        address player = pendingPlays[sequenceNumber];
        if (player == address(0)) revert Plugin__InvalidSequence();

        uint256 randomValue = uint256(randomNumber) % BASIS_POINTS;
        uint256 oTokenBalance = IERC20(OTOKEN).balanceOf(address(this));
        uint256 tokenBalance = IERC20(address(token)).balanceOf(address(this));
        uint256 rewardPercent;

        if (randomValue < rewardTiers[0].threshold) {
            rewardPercent = rewardTiers[0].rewardPercent;
        } else if (randomValue < rewardTiers[1].threshold) {
            rewardPercent = rewardTiers[1].rewardPercent;
        } else if (randomValue < rewardTiers[2].threshold) {
            rewardPercent = rewardTiers[2].rewardPercent;
        } else if (randomValue < rewardTiers[3].threshold) {
            rewardPercent = rewardTiers[3].rewardPercent;
        } else if (randomValue < rewardTiers[4].threshold) {
            rewardPercent = rewardTiers[4].rewardPercent;
        } else if (randomValue < rewardTiers[5].threshold) {
            rewardPercent = rewardTiers[5].rewardPercent;
        } else if (randomValue < rewardTiers[6].threshold) {
            rewardPercent = rewardTiers[6].rewardPercent;
        } else if (randomValue < rewardTiers[7].threshold) {
            rewardPercent = rewardTiers[7].rewardPercent;
        } else if (randomValue < rewardTiers[8].threshold) {
            rewardPercent = rewardTiers[8].rewardPercent;
        } else {
            rewardPercent = rewardTiers[9].rewardPercent;
        }

        uint256 oTokenReward = (oTokenBalance * rewardPercent) / BASIS_POINTS;
        uint256 tokenReward = (tokenBalance * rewardPercent) / BASIS_POINTS;

        // Transfer reward if won
        if (oTokenReward > 0) {
            IERC20(OTOKEN).safeTransfer(player, oTokenReward);
        }
        if (tokenReward > 0) {
            IERC20(address(token)).safeTransfer(player, tokenReward);
        }

        delete pendingPlays[sequenceNumber];
        emit Plugin__SpinResult(player, sequenceNumber, randomValue, rewardPercent, oTokenReward, tokenReward);
    }

    function mockCallback(address account, bytes32 randomValue) internal {

        uint256 randomNumber = uint256(randomValue) % BASIS_POINTS;
        uint256 oTokenBalance = IERC20(OTOKEN).balanceOf(address(this));
        uint256 tokenBalance = IERC20(address(token)).balanceOf(address(this));
        uint256 rewardPercent;

        // O(1) reward calculation using if/else ladder
        if (randomNumber < rewardTiers[0].threshold) {
            rewardPercent = rewardTiers[0].rewardPercent;
        } else if (randomNumber < rewardTiers[1].threshold) {
            rewardPercent = rewardTiers[1].rewardPercent;
        } else if (randomNumber < rewardTiers[2].threshold) {
            rewardPercent = rewardTiers[2].rewardPercent;
        } else if (randomNumber < rewardTiers[3].threshold) {
            rewardPercent = rewardTiers[3].rewardPercent;
        } else if (randomNumber < rewardTiers[4].threshold) {
            rewardPercent = rewardTiers[4].rewardPercent;
        } else if (randomNumber < rewardTiers[5].threshold) {
            rewardPercent = rewardTiers[5].rewardPercent;
        } else if (randomNumber < rewardTiers[6].threshold) {
            rewardPercent = rewardTiers[6].rewardPercent;
        } else if (randomNumber < rewardTiers[7].threshold) {
            rewardPercent = rewardTiers[7].rewardPercent;
        } else if (randomNumber < rewardTiers[8].threshold) {
            rewardPercent = rewardTiers[8].rewardPercent;
        } else {
            rewardPercent = rewardTiers[9].rewardPercent;
        }

        uint256 oTokenReward = (oTokenBalance * rewardPercent) / BASIS_POINTS;
        uint256 tokenReward = (tokenBalance * rewardPercent) / BASIS_POINTS;

        // Transfer reward if won
        if (oTokenReward > 0) {
            IERC20(OTOKEN).safeTransfer(account, oTokenReward);
        }
        if (tokenReward > 0) {
            IERC20(address(token)).safeTransfer(account, tokenReward);
        }

        emit Plugin__SpinResult(account, 0, randomNumber, rewardPercent, oTokenReward, tokenReward);
    }

    function setPlayPrice(uint256 _playPrice) external onlyOwner {
        playPrice = _playPrice;
        emit Plugin__PlayPriceSet(playPrice);
    }

    function setRewardTiers(
        uint256[10] calldata thresholds,
        uint256[10] calldata rewardPercents
    ) external onlyOwner {
        // Validate thresholds are in ascending order and last one is BASIS_POINTS
        for (uint256 i = 1; i < 10; i++) {
            if (thresholds[i] <= thresholds[i-1]) revert Plugin__InvalidThresholds();
        }
        if (thresholds[9] != BASIS_POINTS) revert Plugin__InvalidThresholds();

        // Update all tiers
        for (uint256 i = 0; i < 10; i++) {
            rewardTiers[i] = RewardTier({
                threshold: thresholds[i],
                rewardPercent: rewardPercents[i]
            });
        }
        emit Plugin__RewardTiersSet(thresholds, rewardPercents);
    }

    function setActiveBribes(bool _activeBribes) external onlyOwner {
        activeBribes = _activeBribes;
        emit Plugin__ActiveBribesSet(activeBribes);
    }

    function setActiveIncentives(bool _activeIncentives) external onlyOwner {
        activeIncentives = _activeIncentives;
        emit Plugin__ActiveIncentivesSet(activeIncentives);
    }

    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert Plugin__InvalidZeroAddress();
        treasury = _treasury;
        emit Plugin__TreasurySet(treasury);
    }

    function setDeveloper(address _developer) external {
        if (msg.sender != developer) revert Plugin__NotAuthorizedDeveloper();
        if (_developer == address(0)) revert Plugin__InvalidZeroAddress();
        developer = _developer;
        emit Plugin__DeveloperSet(developer);
    }

    function setIncentives(address _incentives) external onlyOwner {
        if (_incentives == address(0)) revert Plugin__InvalidZeroAddress();
        incentives = _incentives;
        emit Plugin__IncentivesSet(incentives);
    }

    function setGauge(address _gauge) external onlyVoter {
        gauge = _gauge;
    }

    function setBribe(address _bribe) external onlyVoter {
        bribe = _bribe;
    }

    /*----------  VIEW FUNCTIONS  ---------------------------------------*/

    function balanceOf(address account) public view returns (uint256) {
        return IGauge(gauge).balanceOf(account);
    }

    function totalSupply() public view returns (uint256) {
        return IGauge(gauge).totalSupply();
    }

    function getToken() public view returns (address) {
        return address(token);
    }

    function getProtocol() public view virtual returns (string memory) {
        return PROTOCOL;
    }

    function getName() public view virtual returns (string memory) {
        return NAME;
    }

    function getVoter() public view returns (address) {
        return voter;
    }

    function getGauge() public view returns (address) {
        return gauge;
    }

    function getBribe() public view returns (address) {
        return bribe;
    }

    function getAssetTokens() public view returns (address[] memory) {
        return assetTokens;
    }

    function getBribeTokens() public view returns (address[] memory) {
        return bribeTokens;
    }

    function getVaultToken() public view returns (address) {
        return vaultToken;
    }

    function getRewardVault() public view returns (address) {
        return rewardVault;
    }

    function getEntropy() internal view override returns (address) {
        return address(entropy);
    }

}
