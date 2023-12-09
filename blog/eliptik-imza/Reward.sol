// SPDX-License-Identifier: MIT

pragma solidity 0.8.23;

import {Signature, validateHumanID} from "@kimlikdao-sdk/SimpleValidator.sol";

interface IERC20 {
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

// Arbitrum USDT
IERC20 constant USDT = IERC20(0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9);

contract Reward {
    mapping(bytes32 => uint256) public given;

    /**
     * @param humanID of the claimer
     * @param timestamp at which the humanID was signed by a KimlikDAO protocol signer node.
     * @param sig of the humanID by some KimlikDAO protocol signer node.
     * @param commitmentR the claimer chose at the mint time.
     */
    function claim(
        bytes32 humanID,
        uint256 timestamp,
        Signature calldata sig,
        bytes32 commitmentR
    ) external {
        require(given[humanID] == 0);
        validateHumanID(humanID, timestamp, sig, commitmentR);
        given[humanID] = block.timestamp;
        USDT.transferFrom(
            0x79883D9aCBc4aBac6d2d216693F66FcC5A0BcBC1,
            msg.sender,
            5e6
        );
    }
}
