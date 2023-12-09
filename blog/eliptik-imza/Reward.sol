// SPDX-License-Identifier: MIT

pragma solidity 0.8.23;

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
    struct Signature {
        bytes32 r;
        uint256 yParityAndS;
    }

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
        bytes32 digest = keccak256(
            abi.encode(
                uint256(bytes32("\x19KimlikDAO hash\n")) | timestamp,
                keccak256(abi.encodePacked(commitmentR, msg.sender)),
                humanID
            )
        );
        address signer = ecrecover(
            digest,
            uint8(sig.yParityAndS >> 255) + 27,
            sig.r,
            bytes32(sig.yParityAndS & ((1 << 255) - 1))
        );
        require(
            // node.kimlikdao.org
            signer == 0x299A3490c8De309D855221468167aAD6C44c59E0 ||
                // kdao-node.yenibank.org
                signer == 0x86f6B34A26705E6a22B8e2EC5ED0cC5aB3f6F828 ||
                // kdao-node.lstcm.co
                signer == 0x384bF113dcdF3e7084C1AE2Bb97918c3Bf15A6d2
        );
        given[humanID] = block.timestamp;
        USDT.transferFrom(
            0x79883D9aCBc4aBac6d2d216693F66FcC5A0BcBC1,
            msg.sender,
            5e6
        );
    }
}
