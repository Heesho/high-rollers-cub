const { ethers } = require("hardhat");
const { utils, BigNumber } = require("ethers");
const hre = require("hardhat");

// Constants
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const convert = (amount, decimals) => ethers.utils.parseUnits(amount, decimals);
const divDec = (amount, decimals = 18) => amount / 10 ** decimals;

const VOTER_ADDRESS = "0x54cCcf999B5bd3Ea12c52810fA60BB0eB41d109c";
const WBERA_ADDRESS = "0x6969696969696969696969696969696969696969"; // WBERA address
const OBERO_ADDRESS = "0x935938EC3a925d09365e6Bd1f4eec04faF870b6e";
const VAULT_FACTORY_ADDRESS = "0x94Ad6Ac84f6C6FbA8b8CCbD71d9f4f101def52a8";

// Contract Variables
let plugin, multicall, WBERA;

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
  plugin = await ethers.getContractAt(
    "contracts/MapPlugin.sol:MapPlugin",
    "0xEc76C06258D32890F492c6575708D12d0AF3B9c9"
  );
  multicall = await ethers.getContractAt(
    "contracts/Multicall.sol:Multicall",
    "0x09117A6C49aE3f56B142Ab529dfcA4E600C77F3e"
  );
  WBERA = new ethers.Contract(WBERA_ADDRESS, WBERA_ABI, provider);
  console.log("Contracts Retrieved");
}

/*===========================  END CONTRACT DATA  ===================*/
/*===================================================================*/

async function deployPlugin(wallet) {
  console.log("Starting Plugin Deployment");
  const pluginArtifact = await ethers.getContractFactory("MapPlugin");
  const pluginContract = await pluginArtifact.deploy(
    WBERA_ADDRESS,
    VOTER_ADDRESS,
    [WBERA_ADDRESS],
    [WBERA_ADDRESS],
    wallet.address,
    VAULT_FACTORY_ADDRESS,
    {
      gasPrice: ethers.gasPrice,
    }
  );
  plugin = await pluginContract.deployed();
  await sleep(5000);
  console.log("Plugin Deployed at:", plugin.address);
}

async function deployMulticall() {
  console.log("Starting Multicall Deployment");
  const multicallArtifact = await ethers.getContractFactory("Multicall");
  const multicallContract = await multicallArtifact.deploy(
    WBERA_ADDRESS,
    plugin.address,
    VOTER_ADDRESS,
    OBERO_ADDRESS,
    {
      gasPrice: ethers.gasPrice,
    }
  );
  multicall = await multicallContract.deployed();
  console.log("Multicall Deployed at:", multicall.address);
}

async function printDeployment() {
  console.log("**************************************************************");
  console.log("Plugin: ", plugin.address);
  console.log("Multicall: ", multicall.address);
  console.log("**************************************************************");
}

async function verifyPlugin(wallet) {
  await hre.run("verify:verify", {
    address: plugin.address,
    constructorArguments: [
      WBERA_ADDRESS,
      VOTER_ADDRESS,
      [WBERA_ADDRESS],
      [WBERA_ADDRESS],
      wallet.address,
      VAULT_FACTORY_ADDRESS,
    ],
  });
}

async function verifyMulticall() {
  await hre.run("verify:verify", {
    address: multicall.address,
    constructorArguments: [
      WBERA_ADDRESS,
      plugin.address,
      VOTER_ADDRESS,
      OBERO_ADDRESS,
    ],
  });
}

async function main() {
  const [wallet] = await ethers.getSigners();
  console.log("Using wallet: ", wallet.address);

  await getContracts();

  // await deployPlugin(wallet);
  // await deployMulticall();
  // await printDeployment();

  // await verifyPlugin(wallet);
  // await verifyMulticall();

  // await plugin.createFaction(wallet.address);

  // await plugin.setPlacePrice(ethers.utils.parseEther("0.001"));

  // console.log("Factions: ", await plugin.factionMax());
  // console.log("Price: ", await plugin.placePrice());
  // console.log("Pixel 0: ", await plugin.getPixel(6));

  // await multicall.placeFor(wallet.address, 1, "#4f0095", [6], {
  //   value: ethers.utils.parseEther("0.001"),
  //   gasPrice: ethers.gasPrice,
  // });

  // await sleep(10000);

  // await plugin.connect(wallet).setCapacity(10000);

  // console.log("Pixel 0: ", await plugin.getPixel(0));

  // console.log(
  //   "WBERA Balance: ",
  //   await WBERA.connect(wallet).balanceOf(wallet.address)
  // );

  // await WBERA.connect(wallet).withdraw(
  //   await WBERA.connect(wallet).balanceOf(wallet.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
