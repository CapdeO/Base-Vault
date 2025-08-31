// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {IERC20} from "./libs/contracts/token/ERC20/IERC20.sol";
import {ERC4626} from "./libs/contracts/token/ERC20/extensions/ERC4626.sol";
import {SafeERC20} from "./libs/contracts/token/ERC20/utils/SafeERC20.sol";
import {Math} from "./libs/contracts/utils/math/Math.sol";
import "./libs/contracts/access/Ownable.sol";


/**
 * @title IAavePool
 * @notice This interface provides the necessary functions for interacting with the Aave pool.
 */
interface IAavePool {
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256);
}





// Usar deposit y redeem

/// @dev ERC-4626 vault with entry/exit fees expressed in https://en.wikipedia.org/wiki/Basis_point[basis point (bp)].
///
/// NOTE: The contract charges fees in terms of assets, not shares. This means that the fees are calculated based on the
/// amount of assets that are being deposited or withdrawn, and not based on the amount of shares that are being minted or
/// redeemed. This is an opinionated design decision that should be taken into account when integrating this contract.
///
/// WARNING: This contract has not been audited and shouldn't be considered production ready. Consider using it with caution.
contract StakeFees is ERC4626, Ownable {
    using Math for uint256;

    struct User {
        uint256 vesting;
        uint256 amount;
        uint256 invested;
        uint256 extracted;
    }

    uint256 private constant _BASIS_POINT_SCALE = 1e4;
    address public immutable protocolAddr;
    uint256 public minStakingTime;
    uint256 public fee_;

    IERC20 public immutable USDBC = IERC20(0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA);
    address public immutable META_ROUTER = address(0x691df9C4561d95a4a726313089c8536dd682b946);
    address public immutable META_ROUTER_GATEWAY = address(0x41Ae964d0F61Bb5F5e253141A462aD6F3b625B92);

    IAavePool public immutable pool; // = IAavePool(0xA238Dd80C259a72e81d7e4664a9801593F98d1c5);
    IERC20 public immutable usdc = IERC20(0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913); // USDC address
    IERC20 public immutable aUsdc; // = IERC20(0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB); // aUSDC address

    mapping(address => User) public user;// contiene siempre el minimo que el usuario puede sacar pero nunca se puede achicar sin previamente withdraw todo

    event InvestmentMade(string indexed stakingProtocol,address indexed user, uint256 amount);

    constructor(IERC20 _aUsdc, address _pool, address _usdc) ERC4626(_aUsdc) Ownable(msg.sender) {
        protocolAddr = tx.origin;
        minStakingTime = 60;
        fee_ = 20; // 0.2% al salir

        if (block.chainid == 8453) {
            pool = IAavePool(0xA238Dd80C259a72e81d7e4664a9801593F98d1c5);
            usdc = IERC20(0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913); // USDC address
            aUsdc = IERC20(0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB); // aUSDC address
        } else {
            aUsdc = _aUsdc;
            usdc = IERC20(_usdc);
            pool = IAavePool(_pool);            
        }

    }

    // === Overrides ===

    /// @dev Preview taking an entry fee on deposit. See {IERC4626-previewDeposit}.
    function previewDeposit(uint256 assets) public view virtual override returns (uint256) {
        return super.previewDeposit(assets);
    }

    /// @dev Preview taking an exit fee on redeem. See {IERC4626-previewRedeem}.
    function previewRedeem(uint256 shares) public view virtual override returns (uint256) {
        User storage _user = user[msg.sender];
        uint256 _vesting = _user.vesting;
        uint256 _amount = _user.amount;
        uint256 assets = super.previewRedeem(shares);
        if(_vesting > block.timestamp) {
            if(assets > _amount) {
                assets = _amount;
            }
        }
        return assets - _feeOnTotal(assets, _exitFeeBasisPoints());
    }

    function previewRedeem2(uint256 shares) public view virtual returns (uint256) {
        return super.previewRedeem(shares);
    }

    function previewRedeem(uint256 shares, address _caller) public view virtual returns (uint256) {
        User storage _user = user[_caller];
        uint256 _vesting = _user.vesting; // 1742342356596970
        uint256 _amount = _user.amount; // 100000000
        uint256 assets = super.previewRedeem(shares); // redeem(999) => 100 M
        if(_vesting > block.timestamp) {
            // aún no alcanzó el tiempo de vesting
            if(assets > _amount) {
                // Le dejo sacar solo el amount que puso y no todos los assets que tiene
                assets = _amount;
            }
        }
        return assets - _feeOnTotal(assets, _exitFeeBasisPoints());
    }

    function _decimalsOffset() internal view virtual override returns (uint8) {
        return 3;
    }

    // Función para establecer la configuración
    function setConfig(uint256 _minStakingTime, uint256 _fee) external onlyOwner {
        minStakingTime = _minStakingTime;
        fee_ = _fee;
    }

    function recoverToken(address tokenAddress) external onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        uint256 amount = token.balanceOf(address(this));
        token.transfer(owner(), amount);
    }

    function recoverEther() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}

    fallback() external payable {}

    function deposit(uint256 assets, address receiver, uint256 target) public virtual returns (uint256) {

        _depositAve(assets); // deposito assets amounts de usdc y obtengo assets amounts de aUSDC

        User storage _user = user[receiver];
        uint256 _vesting = _user.vesting;
        if(_vesting < target) { // solo aumento el tiempo si el target es superior.
            if(receiver == msg.sender) {
                _vesting = target;
                _user.vesting = target; // si el usuario se aumenta el tiempo a si mismo lo dejo.
            } else {
                if(_vesting == 0) {
                    _vesting = target;
                    _user.vesting = target; // acá lo incremento porque sería un primer deposito.
                } 
                //else {
                //    Aca no incremento el tiempo porque alguien podría incrementarle el tiempo de otro
                //}
            }
        }
        _user.amount += assets;
        _user.invested += assets;


        if (_vesting < (block.timestamp + minStakingTime)) revert(); // No dejamos que nadie deposite por menos de 60 segundos (la idea es que sea en días, pero para testear.
 
 
        
        uint256 maxAssets = maxDeposit(receiver);
        if (assets > maxAssets) {
            revert ERC4626ExceededMaxDeposit(receiver, assets, maxAssets);
        }

        uint256 shares = previewDeposit(assets);
        _deposit(_msgSender(), receiver, assets, shares);

        return shares;
        /**/
    }

    function _deposit(address caller, address receiver, uint256 assets, uint256 shares) internal virtual override {
        // SafeERC20.safeTransferFrom(IERC20(asset()), caller, address(this), assets); // ya los tengo
        _mint(receiver, shares*10**decimals()); // *10**decimals()

        emit Deposit(caller, receiver, assets, shares);
        emit InvestmentMade("YieldMillionaire",receiver, assets);
    }


    function investInSymbiosis(uint256 amount, address targetContract, bytes memory _message) external {
        // 1. Transfer USDBC from user to contract
        require(USDBC.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // 2. Approve USDBC to META_ROUTER
        require(USDBC.approve(META_ROUTER, amount), "Approval to META_ROUTER failed");

        // 3. Approve USDBC to META_ROUTER_GATEWAY
        require(USDBC.approve(META_ROUTER_GATEWAY, amount), "Approval to META_ROUTER_GATEWAY failed");

        // 4. Call the target contract or META_ROUTER if targetContract is zero address
        address contractToCall = targetContract == address(0) ? META_ROUTER : targetContract;
        (bool success, ) = contractToCall.call(_message);
        require(success, "Call to target contract failed");

        // 5. Emit investment event
        emit InvestmentMade("Symbiosis",msg.sender, amount);
    }

    // shares no sirve para nada porque lo saca todo.
    function redeem(address receiver, address owner) public virtual returns (uint256) {
        //_user.extracted += assets; //ver donde ponerlo
        uint256 shares = balanceOf(owner); // 999000000000000000000000

        uint256 maxShares = maxRedeem(owner);
        if (shares > maxShares) {
            revert ERC4626ExceededMaxRedeem(owner, shares, maxShares);
        }

        uint256 assets = previewRedeem(shares); //assets reducidos por el fee => 99800399

        User storage _user = user[receiver];
        _user.vesting = 0;
        _user.amount = 0;

        _withdraw(msg.sender, receiver, owner, assets, shares); // cambio shares por aUdsc y me los quedo
        //(msg.sender, receiver, owner, 99800399, 999000000000000000000000)

        assets = _withdrawAve(assets); // cambio aUsdc por USDC dandoselos al usuario
        _user.extracted += assets; // incremento lo que extrajo

        return assets;
    }

    /// @dev Send exit fee to {_exitFeeRecipient}. See {IERC4626-_deposit}.
    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal virtual override {
        uint256 fee = _feeOnRaw(assets, _exitFeeBasisPoints()); // (99800399, 20)=> 199601
        address recipient = _exitFeeRecipient(); //protocol


        if (caller != owner) {
            _spendAllowance(owner, caller, shares);
        }
        _burn(owner, shares); //(owner, 999000000000000000000000) => le quemo todo
        emit Withdraw(caller, receiver, owner, assets, shares);

        //super._withdraw(caller, receiver, owner, assets, shares); // (99800399, 999000000000000000000000)
        // el vault transfiere 99800399 aUsdc al usuario y se queda con 199601

        if (fee > 0 && recipient != address(this)) { // transfiere 199601 al protocol
            SafeERC20.safeTransfer(IERC20(asset()), recipient, fee);
        }
    }

    // === Fee configuration ===

    function _exitFeeBasisPoints() public view virtual returns (uint256) {
        return fee_; // replace with e.g. 100 for 1%
    }

    function _entryFeeRecipient() internal view virtual returns (address) {
        return address(protocolAddr); // replace with e.g. a treasury address
    }

    function _exitFeeRecipient() internal view virtual returns (address) {
        return address(protocolAddr); // replace with e.g. a treasury address
    }

    // === Fee operations ===

    /// @dev Calculates the fees that should be added to an amount `assets` that does not already include fees.
    /// Used in {IERC4626-mint} and {IERC4626-withdraw} operations.
    function _feeOnRaw(uint256 assets, uint256 feeBasisPoints) private pure returns (uint256) { // return 199601
        return assets.mulDiv(feeBasisPoints, _BASIS_POINT_SCALE, Math.Rounding.Ceil); // (99800399, 20)
    } // (20, 1e4,  1) = 99800399 * 2 /1000 = 199601 => porque redondeo para arriba por el Ceil

    /// @dev Calculates the fee part of an amount `assets` that already includes fees.
    /// Used in {IERC4626-deposit} and {IERC4626-redeem} operations.
    function _feeOnTotal(uint256 assets, uint256 feeBasisPoints) public pure returns (uint256) {
        return assets.mulDiv(feeBasisPoints, feeBasisPoints + _BASIS_POINT_SCALE, Math.Rounding.Ceil);
    }



    /**
     * @notice Deposit USDC into the Aave pool and receive aTokens.
     * @param amount The amount to be supplied
     */
    function _depositAve(
        uint256 amount
    ) internal {
        // Transfer USDC from user to this contract
        usdc.transferFrom(msg.sender, address(this), amount);
        
        // Approve the pool to spend the USDC
        usdc.approve(address(pool), amount);
        
        // Supply USDC to Aave pool
        pool.supply(address(usdc), amount, address(this), 0); // le llegan a este contrato los tokens
    }

    /**
     * @notice Withdraw USDC from the Aave pool using aTokens.
     * @param amount The amount of aTokens to withdraw
     * @return The final amount withdrawn
     */
    function _withdrawAve(
        uint256 amount
    ) internal returns (uint256) {
        // puede que necesite un approve aca de los aUsdc
        // Withdraw USDC from the Aave pool
        uint256 withdrawnAmount = pool.withdraw(address(usdc), amount, msg.sender); //always gets usdc for the one calling
        
        return withdrawnAmount;
    }

}