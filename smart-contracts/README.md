# StakeFees Contract Documentation

## Overview
    - **Deployed at**: `0x44271FEe892F5caedFc47C61E6dC495E56C40244`

The **StakeFees** contract is an innovative ERC-4626 compliant vault designed to manage user deposits of USDC while providing enhanced yield opportunities through integration with the Aave protocol. Unlike directly depositing into Aave, our protocol ensures that participants who meet their investment objectives will always receive yield. Users who fail to meet their targets can still withdraw their funds but will incur a penalty, resulting in reduced yield.

This penalty serves a dual purpose: it not only discourages early withdrawals but also redistributes the forfeited yield to other participants who have successfully met their goals. This mechanism allows our protocol to offer potentially higher yields compared to Aave, rewarding users for their commitment to the investment objectives.

## Key Features

1. **Deposit Functionality**:
   - **Parameters**:
     - `assets`: Amount of USDC to invest.
     - `receiver`: Address benefiting from the deposit (usually the wallet owner).
     - `target`: Epoch time when the user can redeem without penalty.
   - Users can deposit USDC and receive a proportionate amount of the vault's ERC-20 tokens.

2. **Redeem Functionality**:
   - **Parameters**:
     - `receiver`: Address that receives the USDC.
     - `owner`: Address holding the vault tokens.
   - Users can redeem their tokens to receive the underlying USDC, respecting any vesting periods.

3. **User Data Structure**:
   - Each user has a `User` struct holding:
     - `vesting`: Timestamp for penalty-free withdrawals.
     - `amount`: Total USDC deposited without redemption.
     - `invested`: Cumulative amount invested.
     - `extracted`: Cumulative amount withdrawn.

4. **Preview Functions**:
   - `previewDeposit(assets)`: Displays the shares received from a deposit.
   - `previewRedeem(shares)`: Displays the USDC amount redeemable, accounting for fees.

5. **Fee Structure**:
   - A fee of **0.2%** is charged on the total extracted amount.

6. **Aave in BASE Integration**:
   - The contract interacts directly with the Aave protocol for depositing and withdrawing assets.
   - Addresses:
     - **USDC**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
     - **aUSDC**: `0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB` (Aave's token for the deposited USDC)
     - **Avave Pool**: `0xA238Dd80C259a72e81d7e4664a9801593F98d1c5`

## Contract Functionality

### How It Works

1. Users deposit USDC into the vault, receiving ERC-20 tokens in return.
2. The deposited USDC is supplied to Aave, which returns aTokens (aUSDC) to the vault.
3. Upon redemption, the vault burns the user's tokens and transfers the equivalent USDC back to the user after deducting any applicable fees.

### Important Functions

## Deposit Functionality

- **Deposit**: 
  ```solidity
  function deposit(uint256 assets, address receiver, uint256 target) public virtual returns (uint256);

## Redeem Functionality

- **Redeem**:
  ```solidity
  function redeem(address receiver, address owner) public virtual returns (uint256);

## Other Important Functions

- **setConfig(uint256 _minStakingTime, uint256 _fee)**: Allows the owner to adjust staking time and fees.
- **recoverToken(address tokenAddress)**: Enables the owner to recover any tokens sent to the contract.
- **investInSymbiosis(uint256 amount, address targetContract, bytes memory _message)**: Facilitates investments in Symbiosis Finance.
- **previewDeposit(uint256 assets)**: Preview the shares received on deposit.
- **previewRedeem(uint256 shares)**: Preview the USDC amount redeemable, accounting for fees.

## Example Transactions
- Example deposit: [Transaction 1](https://basescan.org/tx/0x8e299df9023f26cc850c7684a5ddd35c69db8444bbab53ee2c3634c2995bd2ad)
- Example redeem: [Transaction 2](https://basescan.org/tx/0x4718c22691515d11b012a4974fdca1e78c8343a462b36c3e2c6fca7938e5c4d9)

## ABI

The ABI for interacting with the contract is as follows:
```json
[{"inputs":[{"internalType":"contract IERC20","name":"_aUsdc","type":"address"},{"internalType":"address","name":"_pool","type":"address"},{"internalType":"address","name":"_usdc","type":"address"}],"stateMutability":"nonpayable","type":"constructor"}, ...]
```


## Libraries and Dependencies

- The contract uses OpenZeppelin's libraries, with some modifications to the ERC-4626 implementation for simplicity and testing purposes.
- The **libs** folder contains the modified libraries to facilitate integration.

## Mock Contracts

- **AaveMock.sol**: Simulates Aave's functionality for testing purposes.
- **Test.sol**: Creates a mock USDC token and facilitates testing of the main contract.

## Integration with SYMBIOSIS FINANCE

The contract also supports deposits into Symbiosis Finance's USDBC staking. It approves tokens for transfer to the META_ROUTER_GATEWAY and calls the respective functions to facilitate cross-chain operations.

### Important Addresses in base for SYMBIOSIS
- **USDBC**: `0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA`
- **META_ROUTER**: `0x691df9C4561d95a4a726313089c8536dd682b946`
- **META_ROUTER_GATEWAY**: `0x41Ae964d0F61Bb5F5e253141A462aD6F3b625B92`
- **PORTAL**: `0xEE981B2459331AD268cc63CE6167b446AF4161f8`

### Contract in SYMBIOSIS chain
- **StakeFeesSymbiosis**: `0x46D3F465E227f75a6CD03aB5c5782d1581BBfdCC`
(This contract is similar to StakeFeesBase but instead of calling the vault of aave to redeem, it calls the vault of Symbiosis finance, adjust the interfaces and changed the addresses to comunicate with)

### Important Addresses in SYMBIOSIS for SYMBIOSIS
- **USDBC**: `0xFBe80e8C3FbFf0bC314b33d1C6185230aC319309`
- **vUSDBC**: `0xC3255E317481B95A3e61844c274dE8BAF8eDF397`
- **vault**: `0xC3255E317481B95A3e61844c274dE8BAF8eDF397`


## Conclusion

The **StakeFees** contract provides a robust solution for handling USDC deposits and yield generation through Aave. With clear user data management and fee structures, it offers transparency and ease of integration for frontend developers. 

### Note
This contract is currently not audited. Use it with caution and ensure thorough testing in a development environment before deploying in production.