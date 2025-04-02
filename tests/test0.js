const convert = (amount, decimals) => ethers.utils.parseUnits(amount, decimals);
const divDec = (amount, decimals = 18) => amount / 10 ** decimals;
const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { execPath } = require("process");

const AddressZero = "0x0000000000000000000000000000000000000000";
const pointZeroOne = convert("0.01", 18);

let owner, treasury, user0, user1, user2, user3;
let oToken, base, voter, vaultFactory;
let plugin;

describe("local: test0", function () {
  before("Initial set up", async function () {
    console.log("Begin Initialization");

    [owner, treasury, user0, user1, user2, user3] = await ethers.getSigners();

    const baseArtifact = await ethers.getContractFactory("Base");
    base = await baseArtifact.deploy();
    console.log("- Base Initialized");

    const voterArtifact = await ethers.getContractFactory("Voter");
    voter = await voterArtifact.deploy();
    console.log("- Voter Initialized");

    const oTokenAddress = await voter.OTOKEN();
    oToken = await ethers.getContractAt("RewardToken", oTokenAddress);
    console.log("- oBERO Initialized");

    const vaultFactoryArtifact = await ethers.getContractFactory(
      "BerachainRewardVaultFactory"
    );
    vaultFactory = await vaultFactoryArtifact.deploy();
    console.log("- Vault Factory Initialized");

    const pluginArtifact = await ethers.getContractFactory("SlotPlugin");
    plugin = await pluginArtifact.deploy(
      base.address,
      voter.address,
      [base.address],
      [base.address],
      treasury.address,
      treasury.address,
      vaultFactory.address,
      AddressZero
    );
    console.log("- Plugin Initialized");

    await voter.setPlugin(plugin.address);
    console.log("- System set up");

    await plugin.initialize();

    console.log("Initialization Complete");
    console.log();
  });

  it("First test", async function () {
    console.log("******************************************************");
  });

  it("User0 spins the slots", async function () {
    console.log("******************************************************");

    // Log balances before
    console.log("Before Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );

    // Play the lottery
    await plugin.connect(user0).play({ value: pointZeroOne });

    // Log balances after
    console.log("\nAfter Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );
  });

  it("User0 spins the slots", async function () {
    console.log("******************************************************");

    // Log balances before
    console.log("Before Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );

    // Play the lottery
    await plugin.connect(user0).play({ value: pointZeroOne });

    // Log balances after
    console.log("\nAfter Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );
  });

  it("User0 spins the slots", async function () {
    console.log("******************************************************");

    // Log balances before
    console.log("Before Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );

    // Play the lottery
    await plugin.connect(user0).play({ value: pointZeroOne });

    // Log balances after
    console.log("\nAfter Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );
  });

  it("User0 spins the slots", async function () {
    console.log("******************************************************");

    // Log balances before
    console.log("Before Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );

    // Play the lottery
    await plugin.connect(user0).play({ value: pointZeroOne });

    // Log balances after
    console.log("\nAfter Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );
  });

  it("User0 spins the slots", async function () {
    console.log("******************************************************");

    // Log balances before
    console.log("Before Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );

    // Play the lottery
    await plugin.connect(user0).play({ value: pointZeroOne });

    // Log balances after
    console.log("\nAfter Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );
  });

  it("User0 spins the slots", async function () {
    console.log("******************************************************");

    // Log balances before
    console.log("Before Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );

    // Play the lottery
    await plugin.connect(user0).play({ value: pointZeroOne });

    // Log balances after
    console.log("\nAfter Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );
  });

  it("User0 spins the slots", async function () {
    console.log("******************************************************");

    // Log balances before
    console.log("Before Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );

    // Play the lottery
    await plugin.connect(user0).play({ value: pointZeroOne });

    // Log balances after
    console.log("\nAfter Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );
  });

  it("User0 spins the slots", async function () {
    console.log("******************************************************");

    // Log balances before
    console.log("Before Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );

    // Play the lottery
    await plugin.connect(user0).play({ value: pointZeroOne });

    // Log balances after
    console.log("\nAfter Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );
  });

  it("User0 spins the slots", async function () {
    console.log("******************************************************");

    // Log balances before
    console.log("Before Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );

    // Play the lottery
    await plugin.connect(user0).play({ value: pointZeroOne });

    // Log balances after
    console.log("\nAfter Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );
  });

  it("User0 spins the slots", async function () {
    console.log("******************************************************");

    // Log balances before
    console.log("Before Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );

    // Play the lottery
    await plugin.connect(user0).play({ value: pointZeroOne });

    // Log balances after
    console.log("\nAfter Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );
  });

  it("User0 spins the slots", async function () {
    console.log("******************************************************");

    // Log balances before
    console.log("Before Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );

    // Play the lottery
    await plugin.connect(user0).play({ value: pointZeroOne });

    // Log balances after
    console.log("\nAfter Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );
  });

  it("User0 spins the slots", async function () {
    console.log("******************************************************");

    // Log balances before
    console.log("Before Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );

    // Play the lottery
    await plugin.connect(user0).play({ value: pointZeroOne });

    // Log balances after
    console.log("\nAfter Play:");
    console.log(
      "Plugin ETH Balance:",
      divDec(await ethers.provider.getBalance(plugin.address))
    );
    console.log(
      "User0 ETH Balance:",
      divDec(await ethers.provider.getBalance(user0.address))
    );
    console.log(
      "Plugin oBERO Balance:",
      divDec(await oToken.balanceOf(plugin.address))
    );
    console.log(
      "User0 oBERO Balance:",
      divDec(await oToken.balanceOf(user0.address))
    );
  });
});
