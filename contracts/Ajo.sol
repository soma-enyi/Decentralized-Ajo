// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

error InvalidContribution();
error AjoIsFull();
error InitializationFailed();

contract Ajo {
    address public admin;
    uint256 public contributionAmount;
    uint256 public cycleDuration;
    uint32 public maxMembers;
    address[] public members;

    bool private initialized;
    event AjoCreated(address indexed admin, uint256 contributionAmount, uint32 maxMembers);

    function initialize(
        address _admin,
        uint256 _contributionAmount,
        uint256 _cycleDuration,
        uint32 _maxMembers
    ) external {
        if(initialized) revert InitializationFailed();
        
        admin = _admin;
        contributionAmount = _contributionAmount;
        cycleDuration = _cycleDuration;
        maxMembers = _maxMembers;
        initialized = true;

        emit AjoCreated(_admin, _contributionAmount, _maxMembers);
    }

    // ─── Withdraw ─────────────────────────────────────────────────────────────

    /**
     * @notice Withdraw the caller's entire balance from the pool.
     *
     * CEI order:
     *   Checks  — caller is member, balance > 0
     *   Effects — zero balance and totalPool BEFORE the ETH transfer
     *   Interactions — low-level `.call` to transfer ETH
     *
     * The `nonReentrant` modifier provides a second layer of defence: even if
     * a malicious contract re-enters `withdraw()` during the `.call`, the
     * mutex will revert the nested call before any state is read again.
     */
    function withdraw() external nonReentrant {
        // ── CHECKS ──────────────────────────────────────────────────────────
        if (!isMember[msg.sender])      revert NotMember();
        uint256 amount = balances[msg.sender];
        if (amount == 0)                revert NothingToWithdraw();

        // ── EFFECTS ─────────────────────────────────────────────────────────
        balances[msg.sender]  = 0;
        totalPool            -= amount;

        // ── INTERACTIONS ────────────────────────────────────────────────────
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Withdrawal(msg.sender, amount);
    }

    // ─── View Helpers ─────────────────────────────────────────────────────────

    /// @notice Returns the contract's current ETH balance.
    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
