// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {ZoopCheckIn} from "../src/ZoopCheckIn.sol";

contract ZoopCheckInScript is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);
        ZoopCheckIn deployed = new ZoopCheckIn();
        vm.stopBroadcast();
        console2.log("ZoopCheckIn:", address(deployed));
    }
}
