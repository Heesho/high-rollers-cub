const convert = (amount, decimals) => ethers.utils.parseUnits(amount, decimals);
const divDec = (amount, decimals = 18) => amount / 10 ** decimals;
const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { execPath } = require("process");

const AddressZero = "0x0000000000000000000000000000000000000000";
const pointZeroOne = convert("0.01", 18);
const pointZeroTwo = convert("0.02", 18);
const pointOne = convert("0.1", 18);
const one = convert("1", 18);

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

let owner, treasury, user0, user1, user2, user3, faction0, faction1, faction2;
let base, voter, vaultFactory;
let plugin, multicall;

describe("local: test1", function () {
  before("Initial set up", async function () {
    console.log("Begin Initialization");

    [
      owner,
      treasury,
      user0,
      user1,
      user2,
      user3,
      faction0,
      faction1,
      faction2,
    ] = await ethers.getSigners();

    const baseArtifact = await ethers.getContractFactory("Base");
    base = await baseArtifact.deploy();
    console.log("- Base Initialized");

    const voterArtifact = await ethers.getContractFactory("Voter");
    voter = await voterArtifact.deploy();
    console.log("- Voter Initialized");

    const vaultFactoryArtifact = await ethers.getContractFactory(
      "BerachainRewardVaultFactory"
    );
    vaultFactory = await vaultFactoryArtifact.deploy();
    console.log("- Vault Factory Initialized");

    const pluginArtifact = await ethers.getContractFactory("MapPlugin");
    plugin = await pluginArtifact.deploy(
      base.address,
      voter.address,
      [base.address],
      [base.address],
      treasury.address,
      treasury.address,
      vaultFactory.address
    );
    console.log("- Plugin Initialized");

    await voter.setPlugin(plugin.address);
    console.log("- System set up");

    const multicallArtifact = await ethers.getContractFactory("Multicall");
    multicall = await multicallArtifact.deploy(
      base.address,
      plugin.address,
      voter.address,
      await voter.OTOKEN()
    );
    console.log("- Multicall Initialized");

    await plugin.createFaction(user0.address);

    console.log("Initialization Complete");
    console.log();
  });

  it("First test", async function () {
    console.log("******************************************************");
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    await multicall.connect(user0).placeFor(user0.address, 1, "#06e647", [0], {
      value: pointZeroOne,
    });
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("Multicall testing", async function () {
    console.log("******************************************************");
    const factions = await multicall.getFactions();
    console.log(factions);
    await multicall.connect(user0).placeFor(user0.address, 1, "#06e647", [0], {
      value: pointZeroOne,
    });
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });
});
