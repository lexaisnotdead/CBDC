// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract CBDC is ERC20 {
    address public controllingParty;
    uint public interestRateBasisPoints = 500;
    
    mapping(address => bool) public blacklist;
    mapping(address => uint) private stakedTreasuryBond;
    mapping(address => uint) private stakedFromTS;

    event NewControllingParty(address indexed oldParty, address indexed newParty);
    event NewInterestRate(uint indexed oldRate, uint indexed newRate);
    event IncreaseTokenSupply(uint indexed oldTokenSupply, uint indexed inflationAmount);
    event UpdateBlacklist(address indexed user, bool blacklisted);
    event StakeTreasuryBonds(address indexed user, uint amount);
    event UnstakeTreasuryBonds(address indexed user, uint amount);
    event ClaimTreasuryBonds(address indexed user, uint amount);

    constructor(address _controllingParty, uint _initialSupply)
    ERC20("Central Bank Digital Currency", "CBDC") {
        controllingParty = _controllingParty;
        _mint(controllingParty, _initialSupply);
    }

    modifier onlyControllingParty() {
        require(msg.sender == controllingParty, 'Only the controlling party can call this function');
        _;
    }

    function updateControllingParty(address _newControllingParty) external onlyControllingParty {
        _transfer(controllingParty, _newControllingParty, balanceOf(controllingParty));
        controllingParty = _newControllingParty;

        emit NewControllingParty(msg.sender, _newControllingParty);
    }

    function updateInterestRate(uint _newInterestRate) external onlyControllingParty {
        uint oldInterestRate = interestRateBasisPoints;
        interestRateBasisPoints = _newInterestRate;

        emit NewInterestRate(oldInterestRate, _newInterestRate);
    }

    function increaseTokenSupply(uint inflationAmount) external onlyControllingParty {
        uint oldTokenSupply = totalSupply();
        _mint(controllingParty, inflationAmount);

        emit IncreaseTokenSupply(oldTokenSupply, inflationAmount);
    }

    function updateBlacklist(address _user, bool _blacklisted) external onlyControllingParty {
        blacklist[_user] = _blacklisted;

        emit UpdateBlacklist(_user, _blacklisted);
    }

    function stakeTreasuryBonds(uint _amount) external {
        require(_amount > 0, "Staking amount must be grater than 0");
        require(balanceOf(msg.sender) >= _amount, "Insuficcient funds");
        
        _transfer(msg.sender, address(this), _amount);
        if (stakedTreasuryBond[msg.sender] > 0) claimTreasuryBonds();
        
        stakedFromTS[msg.sender] = block.timestamp;
        stakedTreasuryBond[msg.sender] += _amount;

        emit StakeTreasuryBonds(msg.sender, _amount);
    }

    function unstakeTreasuryBonds(uint _amount) external {
        require(_amount > 0, "Amount must be grater than 0");
        require(stakedTreasuryBond[msg.sender] >= _amount, "Amount > staked");

        claimTreasuryBonds();
        stakedTreasuryBond[msg.sender] -= _amount;
        _transfer(address(this), msg.sender, _amount);

        emit UnstakeTreasuryBonds(msg.sender, _amount);
    }

    function claimTreasuryBonds() public {
        require(stakedTreasuryBond[msg.sender] > 0, "Nothing to claim");
        
        uint secondsStaked = block.timestamp - stakedFromTS[msg.sender];
        uint reward = stakedTreasuryBond[msg.sender] * secondsStaked * interestRateBasisPoints / (10000 * 86400 * 365);
        stakedFromTS[msg.sender] = block.timestamp;
        _mint(msg.sender, reward);

        emit ClaimTreasuryBonds(msg.sender, reward);
    }

    function _transfer(address _from, address _to, uint _amount) internal virtual override {
        require(blacklist[_from] == false, "From address is blacklisted");
        require(blacklist[_to] == false, "To address is blacklisted");

        super._transfer(_from, _to, _amount);
    }

    function stakedAmountOf(address _user) public view returns(uint) {
        return stakedTreasuryBond[_user];
    }
}