// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ZoopCheckIn — daily on-chain check-in on Base (no ETH fee, gas only).
contract ZoopCheckIn {
    /// @notice Emitted after a successful check-in for `user` on `dayIndex` with current `streak`.
    event CheckedIn(address indexed user, uint256 indexed dayIndex, uint256 streak);

    error AlreadyCheckedInToday();
    error ValueNotZero();

    /// @dev Packed day: 0 = never checked in; otherwise Unix day index + 1 (so real day 0 is stored as 1).
    mapping(address => uint256) internal lastCheckInPacked;
    mapping(address => uint256) public streakOf;

    /// @notice Calendar day index for the user's last successful check-in (`block.timestamp / 1 days`), or 0 if none.
    function lastCheckInDay(address user) external view returns (uint256) {
        uint256 packed = lastCheckInPacked[user];
        return packed == 0 ? 0 : packed - 1;
    }

    /// @notice Records one check-in per calendar day (UTC day boundary via / 1 days).
    /// @dev Reverts if `msg.value != 0` or user already checked in today.
    function checkIn() external payable {
        if (msg.value != 0) revert ValueNotZero();

        uint256 today = block.timestamp / 1 days;
        uint256 packed = lastCheckInPacked[msg.sender];

        if (packed != 0) {
            uint256 last = packed - 1;
            if (last == today) revert AlreadyCheckedInToday();
        }

        uint256 newStreak;
        if (packed == 0) {
            newStreak = 1;
        } else {
            uint256 last = packed - 1;
            if (last == today - 1) {
                newStreak = streakOf[msg.sender] + 1;
            } else {
                newStreak = 1;
            }
        }

        lastCheckInPacked[msg.sender] = today + 1;
        streakOf[msg.sender] = newStreak;

        emit CheckedIn(msg.sender, today, newStreak);
    }
}
