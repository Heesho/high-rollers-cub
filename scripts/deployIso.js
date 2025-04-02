const { ethers } = require("hardhat");
const { utils, BigNumber } = require("ethers");
const hre = require("hardhat");

// Constants
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const convert = (amount, decimals) => ethers.utils.parseUnits(amount, decimals);
const divDec = (amount, decimals = 18) => amount / 10 ** decimals;
const pointZeroOne = convert("0.01", 18);
const pointZeroTwo = convert("0.02", 18);

const WBERA_ADDRESS = "0x6969696969696969696969696969696969696969"; // WBERA address
const PYTH_ENTROPY_ADDRESS = "0x36825bf3Fbdf5a29E2d5148bfe7Dcf7B5639e320"; // PYTH Entropy address

// Contract Variables
let voter, vaultFactory;
let plugin, WBERA;

// WBERA ABI
const WBERA_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function deposit() external payable",
  "function withdraw(uint256 amount) external",
];

/*===================================================================*/
/*===========================  CONTRACT DATA  =======================*/

async function getContracts() {
  // Initialize provider
  provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  await provider.ready; // Ensure the provider is connected
  voter = await ethers.getContractAt(
    "contracts/Voter.sol:Voter",
    "0xd7E79975DACA9B61Baa0399ac224eCfe5033Fbed"
  );
  vaultFactory = await ethers.getContractAt(
    "contracts/BerachainRewardVaultFactory.sol:BerachainRewardVaultFactory",
    "0x6FAB98871CB914718294072C944bCF0d9bD4C080"
  );
  plugin = await ethers.getContractAt(
    "contracts/SlotPlugin.sol:SlotPlugin",
    "0x622777bF29b5808C744be4E15d321F7320B74218"
  );
  WBERA = new ethers.Contract(WBERA_ADDRESS, WBERA_ABI, provider);
  console.log("Contracts Retrieved");
}

/*===========================  END CONTRACT DATA  ===================*/
/*===================================================================*/

async function deployVoter() {
  console.log("Starting Voter Deployment");
  const voterArtifact = await ethers.getContractFactory("Voter");
  voter = await voterArtifact.deploy();
  console.log("Voter Deployed at:", voter.address);
}

async function deployVaultFactory() {
  console.log("Starting Vault Factory Deployment");
  const vaultFactoryArtifact = await ethers.getContractFactory(
    "BerachainRewardVaultFactory"
  );
  vaultFactory = await vaultFactoryArtifact.deploy();
  console.log("Vault Factory Deployed at:", vaultFactory.address);
}

async function deployPlugin(wallet) {
  console.log("Starting Plugin Deployment");
  const pluginArtifact = await ethers.getContractFactory("SlotPlugin");
  const pluginContract = await pluginArtifact.deploy(
    WBERA_ADDRESS,
    voter.address,
    [WBERA_ADDRESS],
    [WBERA_ADDRESS],
    wallet.address,
    wallet.address,
    vaultFactory.address,
    PYTH_ENTROPY_ADDRESS,
    {
      gasPrice: ethers.gasPrice,
    }
  );
  plugin = await pluginContract.deployed();
  await sleep(5000);
  console.log("Plugin Deployed at:", plugin.address);
}

async function printDeployment() {
  console.log("**************************************************************");
  console.log("Voter: ", voter.address);
  console.log("Vault Factory: ", vaultFactory.address);
  console.log("Plugin: ", plugin.address);
  console.log("**************************************************************");
}

async function verifyVoter() {
  await hre.run("verify:verify", {
    address: voter.address,
  });
}

async function verifyVaultFactory() {
  await hre.run("verify:verify", {
    address: vaultFactory.address,
  });
}

async function verifyPlugin(wallet) {
  await hre.run("verify:verify", {
    address: plugin.address,
    constructorArguments: [
      WBERA_ADDRESS,
      voter.address,
      [WBERA_ADDRESS],
      [WBERA_ADDRESS],
      wallet.address,
      wallet.address,
      vaultFactory.address,
      PYTH_ENTROPY_ADDRESS,
    ],
  });
}

async function main() {
  const [wallet] = await ethers.getSigners();
  console.log("Using wallet: ", wallet.address);

  await getContracts();

  //   await deployVoter();
  //   await deployVaultFactory();
  //   await deployPlugin(wallet);
  //   await printDeployment();

  //   await verifyVoter();
  //   await verifyVaultFactory();
  //   await verifyPlugin(wallet);

  //   await voter.setPlugin(plugin.address);
  //   await plugin.initialize();

  await plugin.play({ value: pointZeroTwo });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
