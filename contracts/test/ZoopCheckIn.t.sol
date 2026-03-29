// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ZoopCheckIn} from "../src/ZoopCheckIn.sol";

contract ZoopCheckInTest is Test {
    ZoopCheckIn internal c;
    address internal alice = address(0xA11CE);

    function setUp() public {
        c = new ZoopCheckIn();
    }

    function test_checkIn_firstTime_emitsAndSetsStreak() public {
        vm.startPrank(alice);
        uint256 today = block.timestamp / 1 days;

        vm.expectEmit(true, true, true, true);
        emit ZoopCheckIn.CheckedIn(alice, today, 1);

        c.checkIn();

        assertEq(c.lastCheckInDay(alice), today);
        assertEq(c.streakOf(alice), 1);
        vm.stopPrank();
    }

    function test_checkIn_revertIfValueSent() public {
        vm.deal(alice, 1 ether);
        vm.startPrank(alice);
        vm.expectRevert(ZoopCheckIn.ValueNotZero.selector);
        c.checkIn{value: 1 wei}();
        vm.stopPrank();
    }

    function test_checkIn_revertIfSameDay() public {
        vm.startPrank(alice);
        c.checkIn();
        vm.expectRevert(ZoopCheckIn.AlreadyCheckedInToday.selector);
        c.checkIn();
        vm.stopPrank();
    }

    function test_checkIn_nextDay_incrementsStreak() public {
        vm.startPrank(alice);
        c.checkIn();

        uint256 nextMidnight = ((block.timestamp / 1 days) + 1) * 1 days;
        vm.warp(nextMidnight);

        uint256 today = block.timestamp / 1 days;
        vm.expectEmit(true, true, true, true);
        emit ZoopCheckIn.CheckedIn(alice, today, 2);

        c.checkIn();
        assertEq(c.streakOf(alice), 2);
        vm.stopPrank();
    }

    function test_checkIn_skipDay_resetsStreak() public {
        vm.startPrank(alice);
        c.checkIn();
        vm.warp(((block.timestamp / 1 days) + 1) * 1 days);
        c.checkIn();
        assertEq(c.streakOf(alice), 2);
        vm.warp(((block.timestamp / 1 days) + 2) * 1 days);
        c.checkIn();
        assertEq(c.streakOf(alice), 1);
        vm.stopPrank();
    }
}
