const { expect, use } = require("chai");
const { ethers } = require('hardhat');

describe("CBDC", function() {
    let cbdc, owner, user1, user2;
    const initialSupply = 10000000;

    beforeEach(async () => {
        [owner, user1, user2] = await ethers.getSigners();
        const CBDC = await ethers.getContractFactory('CBDC');
        cbdc = await CBDC.connect(owner).deploy(owner.address, initialSupply);
        await cbdc.deployed(); 
    });

    it('should have the correct name and symbol', async () => {
        expect(await cbdc.name()).to.equal('Central Bank Digital Currency');
        expect(await cbdc.symbol()).to.equal('CBDC');
    });

    it('should allow the controlling party to update the controlling party', async () => {
        expect(await cbdc.controllingParty()).to.equal(owner.address);
        await cbdc.connect(owner).updateControllingParty(user1.address);
        expect(await cbdc.controllingParty()).to.equal(user1.address);
    });

    it('should not allow non-controlling parties to update the controlling party', async () => {
        await expect(cbdc.connect(user1).updateControllingParty(user2.address)).to.be.revertedWith('Only the controlling party can call this function');
    });

    it('should allow the controlling party to update the interest rate', async () => {
        expect(await cbdc.interestRateBasisPoints()).to.equal(500);
        await cbdc.connect(owner).updateInterestRate(600);
        expect(await cbdc.interestRateBasisPoints()).to.equal(600);
    });

    it('should not allow non-controlling party to update the interest rate', async () => {
        await expect(cbdc.connect(user1).updateInterestRate(600)).to.be.revertedWith('Only the controlling party can call this function');
    });

    it('should allow the controlling party to increase the token supply', async () => {
        expect(await cbdc.totalSupply()).to.equal(initialSupply);
        await cbdc.connect(owner).increaseTokenSupply(1000000);
        expect(await cbdc.totalSupply()).to.equal(11000000);
    });

    it('should not allow non-controlling party to increase the token supply', async () => {
        await expect(cbdc.connect(user1).increaseTokenSupply(1000000)).to.be.revertedWith('Only the controlling party can call this function');
    });

    it('should allow the controlling party to update the blacklist', async () => {
        expect(await cbdc.blacklist(user1.address)).to.equal(false);
        await cbdc.connect(owner).updateBlacklist(user1.address, true);
        expect(await cbdc.blacklist(user1.address)).to.equal(true);
    });

    it('should not allow non-controlling party to update the blacklist', async () => {
        await expect(cbdc.connect(user1).updateBlacklist(user2.address, true)).to.be.revertedWith('Only the controlling party can call this function');
    });

    it('should allow user to stake and unstake the treasury bonds', async () => {
        const stakingAmount = 1000000;

        await cbdc.connect(owner).increaseTokenSupply(stakingAmount);
        await cbdc.connect(owner).transfer(user1.address, stakingAmount);
        expect(await cbdc.balanceOf(user1.address)).to.equal(stakingAmount);
        expect(await cbdc.balanceOf(owner.address)).to.equal(initialSupply);

        await cbdc.connect(user1).stakeTreasuryBonds(stakingAmount);
        expect(await cbdc.stakedAmountOf(user1.address)).to.equal(stakingAmount);
        expect(await cbdc.balanceOf(user1.address)).to.equal(0);
        expect(await cbdc.balanceOf(cbdc.address)).to.equal(stakingAmount);

        await cbdc.connect(user1).unstakeTreasuryBonds(stakingAmount);
        expect(await cbdc.stakedAmountOf(user1.address)).to.equal(0);
        expect(await cbdc.balanceOf(user1.address)).to.equal(stakingAmount);
        expect(await cbdc.balanceOf(cbdc.address)).to.equal(0);
    });

    it('should allow user to claim reward', async () => {
        const stakingAmount = 1000000;
        const stakeDuration = 60 * 60 * 24 * 365;
        const interestRate = await cbdc.interestRateBasisPoints();

        await cbdc.connect(owner).transfer(user1.address, stakingAmount);
        expect(await cbdc.balanceOf(user1.address)).to.equal(stakingAmount);
        await cbdc.connect(user1).stakeTreasuryBonds(stakingAmount);

        await ethers.provider.send('evm_increaseTime', [stakeDuration]);
        await cbdc.connect(user1).claimTreasuryBonds();
        const expectedReward = (stakingAmount * interestRate * stakeDuration) / (10000 * 31536000);
        expect(await cbdc.balanceOf(user1.address)).to.equal(expectedReward);

        await cbdc.connect(user1).unstakeTreasuryBonds(stakingAmount);
        expect(await cbdc.balanceOf(user1.address)).to.equal(stakingAmount + expectedReward);
    });
});