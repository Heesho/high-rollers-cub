const { expect } = require("chai");
const { ethers } = require("hardhat");

const AddressZero = "0x0000000000000000000000000000000000000000";
const BASIS_POINTS = 10000;

describe("SlotPlugin: Reward Tiers", function () {
  let owner, treasury, user0;
  let plugin, base, voter, vaultFactory;

  // Default valid tiers for testing
  const defaultThresholds = [
    100, 300, 800, 2000, 4000, 6000, 7500, 8500, 9500, 10000,
  ];
  const defaultRewardPercents = [3000, 1500, 500, 250, 100, 50, 25, 10, 5, 0];

  beforeEach(async function () {
    [owner, treasury, user0] = await ethers.getSigners();

    // Deploy base contracts
    const Base = await ethers.getContractFactory("Base");
    base = await Base.deploy();

    const Voter = await ethers.getContractFactory("Voter");
    voter = await Voter.deploy();

    const VaultFactory = await ethers.getContractFactory(
      "BerachainRewardVaultFactory"
    );
    vaultFactory = await VaultFactory.deploy();

    // Deploy plugin
    const Plugin = await ethers.getContractFactory("SlotPlugin");
    plugin = await Plugin.deploy(
      base.address,
      voter.address,
      [base.address],
      [base.address],
      treasury.address,
      treasury.address,
      vaultFactory.address,
      AddressZero
    );

    await voter.setPlugin(plugin.address);
    await plugin.initialize();
  });

  describe("Initial State", function () {
    it("Should have correct initial reward tiers", async function () {
      const tier0 = await plugin.rewardTiers(0);
      expect(tier0.threshold).to.equal(100);
      expect(tier0.rewardPercent).to.equal(3000);

      const tier9 = await plugin.rewardTiers(9);
      expect(tier9.threshold).to.equal(10000);
      expect(tier9.rewardPercent).to.equal(0);
    });
  });

  describe("setRewardTiers", function () {
    it("Should successfully set new reward tiers", async function () {
      const tx = await plugin.setRewardTiers(
        defaultThresholds,
        defaultRewardPercents
      );

      // Check event emission
      await expect(tx)
        .to.emit(plugin, "Plugin__RewardTiersSet")
        .withArgs(defaultThresholds, defaultRewardPercents);

      // Verify all tiers were set correctly
      for (let i = 0; i < 10; i++) {
        const tier = await plugin.rewardTiers(i);
        expect(tier.threshold).to.equal(defaultThresholds[i]);
        expect(tier.rewardPercent).to.equal(defaultRewardPercents[i]);
      }
    });

    it("Should revert when called by non-owner", async function () {
      await expect(
        plugin
          .connect(user0)
          .setRewardTiers(defaultThresholds, defaultRewardPercents)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should revert when thresholds are not ascending", async function () {
      const invalidThresholds = [
        100, 300, 200, 2000, 4000, 6000, 7500, 8500, 9500, 10000,
      ];
      await expect(
        plugin.setRewardTiers(invalidThresholds, defaultRewardPercents)
      ).to.be.revertedWith("Plugin__InvalidThresholds");
    });

    it("Should revert when last threshold is not BASIS_POINTS", async function () {
      const invalidThresholds = [
        100, 300, 800, 2000, 4000, 6000, 7500, 8500, 9500, 9999,
      ];
      await expect(
        plugin.setRewardTiers(invalidThresholds, defaultRewardPercents)
      ).to.be.revertedWith("Plugin__InvalidThresholds");
    });

    it("Should revert when thresholds are equal", async function () {
      const invalidThresholds = [
        100, 300, 800, 2000, 2000, 6000, 7500, 8500, 9500, 10000,
      ];
      await expect(
        plugin.setRewardTiers(invalidThresholds, defaultRewardPercents)
      ).to.be.revertedWith("Plugin__InvalidThresholds");
    });

    it("Should handle minimum valid thresholds", async function () {
      const minThresholds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10000];
      const tx = await plugin.setRewardTiers(
        minThresholds,
        defaultRewardPercents
      );

      await expect(tx)
        .to.emit(plugin, "Plugin__RewardTiersSet")
        .withArgs(minThresholds, defaultRewardPercents);
    });

    it("Should handle maximum reward percentages", async function () {
      const maxRewardPercents = [
        10000, 9000, 8000, 7000, 6000, 5000, 4000, 3000, 2000, 1000,
      ];
      const tx = await plugin.setRewardTiers(
        defaultThresholds,
        maxRewardPercents
      );

      await expect(tx)
        .to.emit(plugin, "Plugin__RewardTiersSet")
        .withArgs(defaultThresholds, maxRewardPercents);
    });
  });

  describe("Reward Distribution", function () {
    it("Should correctly assign rewards based on random values", async function () {
      // Set specific test tiers
      const testThresholds = [
        1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
      ];
      const testRewardPercents = [
        1000, 900, 800, 700, 600, 500, 400, 300, 200, 100,
      ];
      await plugin.setRewardTiers(testThresholds, testRewardPercents);

      // Test multiple plays
      const playValue = ethers.utils.parseEther("0.01");
      for (let i = 0; i < 5; i++) {
        const tx = await plugin.connect(user0).play({ value: playValue });
        const receipt = await tx.wait();

        // Find and verify the SpinResult event
        const spinResultEvent = receipt.events.find(
          (e) => e.event === "Plugin__SpinResult"
        );
        const { randomValue, rewardPercent } = spinResultEvent.args;

        // Verify reward percent matches our tier structure
        let expectedRewardPercent;
        for (let j = 0; j < testThresholds.length; j++) {
          if (randomValue < testThresholds[j]) {
            expectedRewardPercent = testRewardPercents[j];
            break;
          }
        }
        expect(rewardPercent).to.equal(expectedRewardPercent);
      }
    });
  });

  describe("Edge Cases", function () {
    it("Should handle all zero reward percentages", async function () {
      const zeroRewardPercents = Array(10).fill(0);
      const tx = await plugin.setRewardTiers(
        defaultThresholds,
        zeroRewardPercents
      );

      await expect(tx)
        .to.emit(plugin, "Plugin__RewardTiersSet")
        .withArgs(defaultThresholds, zeroRewardPercents);
    });

    it("Should handle sequential thresholds", async function () {
      const sequentialThresholds = [
        1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
      ];
      const tx = await plugin.setRewardTiers(
        sequentialThresholds,
        defaultRewardPercents
      );

      await expect(tx)
        .to.emit(plugin, "Plugin__RewardTiersSet")
        .withArgs(sequentialThresholds, defaultRewardPercents);
    });
  });
});
