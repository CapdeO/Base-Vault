// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.27;

import {ERC20} from "./libs/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "./libs/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Permit} from "./libs/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "./StakeFees.sol";
import "./aavemock.sol";

contract USDC is ERC20, ERC20Burnable, ERC20Permit {

    StakeFees public immutable stakeFees;
    aavemock public pool;
    ERC20 public aUsdc;
    address public usdc;

    constructor()
        ERC20("test Token", "test")
        ERC20Permit("test Token")
    {
        usdc = address(this);
        pool = new aavemock(usdc);
        aUsdc = ERC20(pool);
        stakeFees = StakeFees(new StakeFees(IERC20(aUsdc),address(pool), address(this)));
        //_mint(msg.sender, 5_000_000_000 * 10 ** decimals());
    }

    function testDeposit() public {
        mint(address(this), 100);
        //mint(msg.sender, 2000);
        //mint(address(0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2),3000);
        this.approve(address(stakeFees),100*10**decimals());
        stakeFees.deposit(100*10**decimals(),address(this),1742342356596970);
    }

    function testRedeem() public {
        stakeFees.redeem(address(this), address(this));
    }

    function testPreviewRedeem(uint256 shares) public view virtual returns (uint256) {
        return stakeFees.previewRedeem( shares);
    }

    function testIsVestingExpired() public view returns (bool) {
        (uint256 _vesting,,,) = stakeFees.user(msg.sender);
        return _vesting < block.timestamp;
    }

    function test_vesting() public view returns (uint256) {
        (uint256 _vesting,,,) = stakeFees.user(address(this));
        return _vesting;
    }

    function test_time() public view returns (uint256) {
        return block.timestamp;
    }

    function testPreviewRedeem2(uint256 shares) public view virtual returns (uint256) {
        return stakeFees.previewRedeem2( shares);
    }

    function test_feeOnTotal(uint256 assets, uint256 feeBasisPoints) public view returns (uint256) {
        return stakeFees._feeOnTotal( assets, feeBasisPoints);
    }

////////////////// For testing Purposes ////////////////////////////////
    function mint(address who, uint256 amount) public {
        _mint(who, amount*10**decimals());
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

}