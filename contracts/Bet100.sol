// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Define IERC20Metadata if not using ^0.8.20 where it might be built-in or implicitly available
interface IERC20Metadata is IERC20 {
    function decimals() external view returns (uint8);
}

contract Bet100 is Ownable {
    IERC20 public immutable usdtToken;

    // Adjust BET_AMOUNT based on actual USDT decimals after deployment or fetch dynamically if needed
    uint256 public constant BET_AMOUNT = 0.1 ether; // Placeholder using 18 decimals
    uint256 public constant BETTING_DURATION = 1 days; // Corrected time unit (use 1 days for 24 hours)
    uint256 public constant COOLDOWN_DURATION = 1 hours; // Corrected time unit
    uint8 public constant PLATFORM_FEE_PERCENT = 1; // 1%

    uint256 public currentRoundId;
    uint256 public bettingEndTime;  // Convenience state variable for current round end time
    uint256 public cooldownEndTime; // Convenience state variable for current round cooldown end time

    struct Round {
        uint256 bettingEnd;
        uint256 cooldownEnd;
        uint8 winningNumber;
        uint256 totalPot;
        uint256 totalBets;
        uint256 playerCount;
        bool concluded;
        bool cancelled;
        uint256 platformFeeAmount;
        uint256 distributablePot;
        mapping(uint8 => uint256) totalBetsPerNumber;
        mapping(address => bool) players;
        mapping(address => uint256) claimedWinnings;
        mapping(address => uint256) refundedAmount;
    }

    mapping(uint256 => Round) public rounds;
    mapping(uint256 => mapping(uint8 => mapping(address => uint256))) public userBets; // roundId => number => user => bet count
    mapping(uint256 => mapping(address => uint256)) public userTotalStakeInRound; // roundId => user => total stake value

    // Add explicit getters for nested claimed/refunded mappings
    mapping(uint256 => mapping(address => uint256)) internal _claimedWinnings; // roundId => user => claimed amount
    mapping(uint256 => mapping(address => uint256)) internal _refundedAmount; // roundId => user => refunded amount

    event BetPlaced(uint256 indexed roundId, address indexed user, uint8 number, uint256 betCount);
    event WinnerDrawn(uint256 indexed roundId, uint8 winningNumber, uint256 totalPot, uint256 platformFee);
    event WinningsClaimed(uint256 indexed roundId, address indexed user, uint256 amount);
    event GameCancelled(uint256 indexed roundId);
    event BetRefunded(uint256 indexed roundId, address indexed user, uint8 number, uint256 amount);
    event RoundStarted(uint256 indexed roundId, uint256 bettingEndTime, uint256 cooldownEndTime);

    modifier inBettingPhase(uint256 _roundId) {
        require(_roundId == currentRoundId, "Bet100: Can only bet in current round");
        Round storage round = rounds[_roundId];
        require(block.timestamp < round.bettingEnd, "Bet100: Betting phase is over");
        require(!round.concluded, "Bet100: Round already concluded");
        require(!round.cancelled, "Bet100: Round cancelled");
        _;
    }

    modifier afterBettingPhase(uint256 _roundId) {
        require(_roundId == currentRoundId, "Bet100: Can only act on current round after betting");
        Round storage round = rounds[_roundId];
        require(block.timestamp >= round.bettingEnd, "Bet100: Betting phase not over yet");
        require(!round.concluded, "Bet100: Round already concluded");
        require(!round.cancelled, "Bet100: Round cancelled");
        _;
    }

    constructor(address _usdtTokenAddress, address initialOwner) Ownable(initialOwner) {
        require(_usdtTokenAddress != address(0), "Bet100: Invalid token address");
        usdtToken = IERC20(_usdtTokenAddress);
        _startNewRound(); // Start round 1
    }

    function _startNewRound() internal {
        currentRoundId++;
        rounds[currentRoundId].bettingEnd = block.timestamp + BETTING_DURATION;
        rounds[currentRoundId].cooldownEnd = rounds[currentRoundId].bettingEnd + COOLDOWN_DURATION;
        bettingEndTime = rounds[currentRoundId].bettingEnd; // Update global convenience vars
        cooldownEndTime = rounds[currentRoundId].cooldownEnd;
        emit RoundStarted(currentRoundId, bettingEndTime, cooldownEndTime);
    }

    function placeBet(uint8 _number) external inBettingPhase(currentRoundId) {
        require(_number >= 1 && _number <= 100, "Bet100: Number must be between 1 and 100");
        uint256 actualBetAmount = BET_AMOUNT; // Use constant
        usdtToken.transferFrom(msg.sender, address(this), actualBetAmount);

        Round storage round = rounds[currentRoundId];
        userBets[currentRoundId][_number][msg.sender]++;
        round.totalBetsPerNumber[_number]++;
        round.totalBets++;
        round.totalPot += actualBetAmount;
        userTotalStakeInRound[currentRoundId][msg.sender] += actualBetAmount;

        if (!round.players[msg.sender]) {
            round.players[msg.sender] = true;
            round.playerCount++;
        }
        emit BetPlaced(currentRoundId, msg.sender, _number, userBets[currentRoundId][_number][msg.sender]);
    }

    function drawWinner(uint8 _winningNumber) external onlyOwner afterBettingPhase(currentRoundId) {
        require(_winningNumber >= 1 && _winningNumber <= 100, "Bet100: Invalid winning number");
        uint256 roundIdToConclude = currentRoundId;
        Round storage round = rounds[roundIdToConclude];

        round.winningNumber = _winningNumber;
        round.concluded = true;
        uint256 pot = round.totalPot;
        round.platformFeeAmount = (pot * PLATFORM_FEE_PERCENT) / 100;
        round.distributablePot = pot - round.platformFeeAmount;
        emit WinnerDrawn(roundIdToConclude, _winningNumber, pot, round.platformFeeAmount);

        if (round.platformFeeAmount > 0) {
            usdtToken.transfer(owner(), round.platformFeeAmount);
        }
        _startNewRound();
    }

    function cancelGame(bool /* refundFee */) external onlyOwner {
        uint256 roundIdToCancel = currentRoundId;
        Round storage round = rounds[roundIdToCancel];
        require(block.timestamp < round.bettingEnd, "Bet100: Cannot cancel after betting ends");
        require(!round.concluded, "Bet100: Round already concluded");
        require(!round.cancelled, "Bet100: Round already cancelled");

        round.cancelled = true;
        emit GameCancelled(roundIdToCancel);
        _startNewRound();
    }

    function refundBet(address _user, uint256 _roundId, uint8 _number) external onlyOwner {
        require(_number >= 1 && _number <= 100, "Bet100: Invalid number");
        require(_user != address(0), "Bet100: Invalid user address");
        uint256 betCount = userBets[_roundId][_number][_user];
        require(betCount > 0, "Bet100: No bets found for this user/number/round");

        uint256 actualBetAmount = BET_AMOUNT; // Use constant
        uint256 amountToRefund = betCount * actualBetAmount;
        Round storage round = rounds[_roundId];

        userBets[_roundId][_number][_user] = 0;
        round.totalBetsPerNumber[_number] -= betCount;
        round.totalBets -= betCount;
        userTotalStakeInRound[_roundId][_user] -= amountToRefund;

        if (!round.concluded && !round.cancelled) {
            round.totalPot -= amountToRefund;
        }
        if (userTotalStakeInRound[_roundId][_user] == 0 && round.players[_user]) {
            round.players[_user] = false;
            round.playerCount--;
        }
        usdtToken.transfer(_user, amountToRefund);
        emit BetRefunded(_roundId, _user, _number, amountToRefund);
    }

    function claimWinnings(uint256 _roundId) external {
        Round storage round = rounds[_roundId];
        require(round.concluded, "Bet100: Round not concluded");
        require(!round.cancelled, "Bet100: Round was cancelled");
        require(_claimedWinnings[_roundId][msg.sender] == 0, "Bet100: Winnings already claimed");

        uint8 winningNumber = round.winningNumber;
        uint256 userBetCountOnWinningNumber = userBets[_roundId][winningNumber][msg.sender];
        require(userBetCountOnWinningNumber > 0, "Bet100: No winning bets found");

        uint256 totalWinningBets = round.totalBetsPerNumber[winningNumber];
        require(totalWinningBets > 0, "Bet100: No bets on winning number");

        uint256 userWinnings = (round.distributablePot * userBetCountOnWinningNumber) / totalWinningBets;
        require(userWinnings > 0, "Bet100: Calculated winnings are zero");

        _claimedWinnings[_roundId][msg.sender] = userWinnings;
        usdtToken.transfer(msg.sender, userWinnings);
        emit WinningsClaimed(_roundId, msg.sender, userWinnings);
    }

    function claimRefund(uint256 _roundId) external {
        Round storage round = rounds[_roundId];
        require(round.cancelled, "Bet100: Round was not cancelled");
        require(_refundedAmount[_roundId][msg.sender] == 0, "Bet100: Refund already claimed");
        uint256 amountToRefund = userTotalStakeInRound[_roundId][msg.sender];
        require(amountToRefund > 0, "Bet100: No stake found for refund");

        _refundedAmount[_roundId][msg.sender] = amountToRefund;
        usdtToken.transfer(msg.sender, amountToRefund);
        emit BetRefunded(_roundId, msg.sender, 0, amountToRefund);
    }

    function resetTimer() external onlyOwner {
        if (block.timestamp < rounds[currentRoundId].bettingEnd && !rounds[currentRoundId].cancelled && !rounds[currentRoundId].concluded) {
            // Optionally cancel abandoned round
        }
        _startNewRound();
    }

    function overrideWinner(uint8 _winningNumber) external onlyOwner afterBettingPhase(currentRoundId) {
        this.drawWinner(_winningNumber);
    }

    // --- View Functions ---
    // Note: Returning structs directly can be problematic across different Solidity versions/ABIs
    // It's often safer to return individual components.
    function getRoundInfo(uint256 _roundId) external view returns (
        uint256 bettingEnd,
        uint256 cooldownEnd,
        uint8 winningNum,
        uint256 totalPotValue,
        uint256 totalBetsCount,
        uint256 playerCountNum,
        bool isConcluded,
        bool isCancelled,
        uint256 feeAmount,
        uint256 distributable
    ) {
        Round storage round = rounds[_roundId];
        return (
            round.bettingEnd,
            round.cooldownEnd,
            round.winningNumber,
            round.totalPot,
            round.totalBets,
            round.playerCount,
            round.concluded,
            round.cancelled,
            round.platformFeeAmount,
            round.distributablePot
        );
    }

    function getUserBetCountOnNumber(uint256 _roundId, address _user, uint8 _number) external view returns (uint256) {
        return userBets[_roundId][_number][_user];
    }

    function getUserTotalStake(uint256 _roundId, address _user) external view returns (uint256) {
        return userTotalStakeInRound[_roundId][_user];
    }

    function getTotalBetsOnNumber(uint256 _roundId, uint8 _number) external view returns (uint256) {
        return rounds[_roundId].totalBetsPerNumber[_number];
    }

    /**
     * @notice Check the amount of winnings claimed by a user for a specific round.
     * @param _roundId The ID of the round to check.
     * @param _user The address of the user to check.
     * @return The amount claimed (0 if none).
     */
    function getClaimedWinnings(uint256 _roundId, address _user) public view returns (uint256) {
        return _claimedWinnings[_roundId][_user];
    }

    /**
     * @notice Check the amount refunded to a user for a specific (cancelled) round.
     * @param _roundId The ID of the round to check.
     * @param _user The address of the user to check.
     * @return The amount refunded (0 if none).
     */
    function getRefundedAmount(uint256 _roundId, address _user) public view returns (uint256) {
        return _refundedAmount[_roundId][_user];
    }

    function getCurrentRoundState() external view returns (uint256 roundId, uint256 bettingEnd, uint256 cooldownEnd, string memory phase) {
        uint256 _currentRoundId = currentRoundId;
        Round storage current = rounds[_currentRoundId];
        uint256 currentTime = block.timestamp;

        if (currentTime < current.bettingEnd) {
            return (_currentRoundId, current.bettingEnd, current.cooldownEnd, "Betting");
        }
        if (currentTime >= current.bettingEnd && currentTime < current.cooldownEnd) {
             return (_currentRoundId, current.bettingEnd, current.cooldownEnd, "Cooldown");
        }
        return (_currentRoundId, current.bettingEnd, current.cooldownEnd, "Betting");
    }
} 