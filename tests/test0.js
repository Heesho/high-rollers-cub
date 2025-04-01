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

describe("local: test0", function () {
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

  it("User0 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    await expect(
      multicall.connect(user0).placeFor(user0.address, 0, "#5406e6", [0], {
        value: pointZeroOne,
      })
    ).to.be.revertedWith("Plugin__InvalidFaction");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("Owners creates factions", async function () {
    console.log("******************************************************");
    await plugin.createFaction(faction0.address);
    await plugin.createFaction(faction1.address);
    await plugin.createFaction(faction2.address);
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    await multicall.connect(user0).placeFor(user0.address, 1, "#06e647", [0], {
      value: pointZeroOne,
    });
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tiles in first row", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user1.getBalance()));
    await multicall
      .connect(user1)
      .placeFor(user1.address, 1, "#e6cf06", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], {
        value: pointOne,
      });
    console.log("ETH balance: ", divDec(await user1.getBalance()));
  });

  it("Gauge data", async function () {
    console.log("******************************************************");
    console.log(await multicall.getGauge(user0.address));
  });

  it("Grid data", async function () {
    console.log("******************************************************");
    const res = await multicall.getPixels(0, 1); // Fetch 100 pixels for a 10x10 grid
    console.log(res);
  });

  it("Grid data", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getPixels(0, 99); // Fetch 100 pixels for a 10x10 grid
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let row = 0; row < 10; row++) {
      let rowColors = [];
      for (let col = 0; col < 10; col++) {
        const pixelIndex = row * 10 + col;
        const pixel = gridChunk[pixelIndex];
        rowColors.push(pixel.color.toString());
      }
      console.log(rowColors.join(" "));
    }
  });

  it("Get Pixels", async function () {
    console.log("******************************************************");
    console.log(await plugin.getPixel(0));
    console.log(await plugin.getPixel(1));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    await multicall.connect(user0).placeFor(user0.address, 1, "#33353a", [0], {
      value: pointZeroOne,
    });
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    await multicall.connect(user0).placeFor(user0.address, 1, "#56aa77", [0], {
      value: pointZeroOne,
    });
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    await multicall.connect(user0).placeFor(user0.address, 2, "#ffffff", [0], {
      value: pointZeroOne,
    });
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("Get Factions", async function () {
    console.log("******************************************************");
    console.log(await multicall.getFactions());
  });

  it("Get Account State", async function () {
    console.log("******************************************************");
    console.log(await multicall.getAccountState(user0.address));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    await multicall
      .connect(user0)
      .placeFor(user0.address, 2, "#2e2c00", [0, 1], {
        value: pointZeroTwo,
      });
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    await expect(
      multicall
        .connect(user0)
        .placeFor(
          user0.address,
          2,
          "#0cff00",
          [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
          {
            value: pointZeroOne,
          }
        )
    ).to.be.reverted;
    await multicall
      .connect(user0)
      .placeFor(
        user0.address,
        1,
        "#ffc1c1",
        [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
        {
          value: pointOne,
        }
      );
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("Grid data", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getPixels(0, 99); // Fetch 100 pixels for a 10x10 grid
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let row = 0; row < 10; row++) {
      let rowColors = [];
      for (let col = 0; col < 10; col++) {
        const pixelIndex = row * 10 + col;
        const pixel = gridChunk[pixelIndex];
        rowColors.push(pixel.color.toString());
      }
      console.log(rowColors.join(" "));
    }
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#700202",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#374648",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#009b14",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          "#252524",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          "#dadbff",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          "#0004a2",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#00ff4e",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          "#880043",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          "#010c06",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("Grid data", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getPixels(0, 99); // Fetch 100 pixels for a 10x10 grid
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let row = 0; row < 10; row++) {
      let rowColors = [];
      for (let col = 0; col < 10; col++) {
        const pixelIndex = row * 10 + col;
        const pixel = gridChunk[pixelIndex];
        rowColors.push(pixel.color.toString());
      }
      console.log(rowColors.join(" "));
    }
  });

  it("Get Factions", async function () {
    console.log("******************************************************");
    console.log(await multicall.getFactions());
  });

  it("Get Account State", async function () {
    console.log("******************************************************");
    console.log(await multicall.getAccountState(user0.address));
  });

  it("Gauge data", async function () {
    console.log("******************************************************");
    console.log(await multicall.getGauge(user0.address));
  });

  it("Gauge data", async function () {
    console.log("******************************************************");
    console.log(await multicall.getGauge(user1.address));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#888888",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#ffffff",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#000000",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          "#a500ff",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          "#1f1d20",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          "#ff6cb5",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#ff6300",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          "#4ba1b0",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          "#e17503",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("Grid data", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getPixels(0, 99); // Fetch 100 pixels for a 10x10 grid
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let row = 0; row < 10; row++) {
      let rowColors = [];
      for (let col = 0; col < 10; col++) {
        const pixelIndex = row * 10 + col;
        const pixel = gridChunk[pixelIndex];
        rowColors.push(pixel.color.toString());
      }
      console.log(rowColors.join(" "));
    }
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#919191",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#f100ff",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#202020",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          "#000000",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));

    it("User2 places tile", async function () {
      console.log("******************************************************");
      console.log("ETH balance: ", divDec(await user0.getBalance()));
      for (let i = 0; i < 100; i++) {
        await multicall
          .connect(user2)
          .placeFor(
            user2.address,
            getRndInteger(1, 3),
            "#000000",
            [getRndInteger(0, 100)],
            {
              value: pointZeroOne,
            }
          );
      }
      console.log("ETH balance: ", divDec(await user0.getBalance()));
    });
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          "#baffa2",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#a2e4ff",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          "#008374",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          "#260083",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("Grid data", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getPixels(0, 99); // Fetch 100 pixels for a 10x10 grid
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let row = 0; row < 10; row++) {
      let rowColors = [];
      for (let col = 0; col < 10; col++) {
        const pixelIndex = row * 10 + col;
        const pixel = gridChunk[pixelIndex];
        rowColors.push(pixel.color.toString());
      }
      console.log(rowColors.join(" "));
    }
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#dd159e",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#01c96f",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#00ffef",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          "#060707",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          "#000000",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          "#000000",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#000000",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          "#ffffff",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          "#ffffff",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("Grid data", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getPixels(0, 99); // Fetch 100 pixels for a 10x10 grid
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let row = 0; row < 10; row++) {
      let rowColors = [];
      for (let col = 0; col < 10; col++) {
        const pixelIndex = row * 10 + col;
        const pixel = gridChunk[pixelIndex];
        rowColors.push(pixel.color.toString());
      }
      console.log(rowColors.join(" "));
    }
  });

  it("User0 places tiles in first row", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user1.getBalance()));
    await multicall
      .connect(user0)
      .placeFor(user0.address, 1, "#325f27", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], {
        value: pointOne,
      });
    console.log("ETH balance: ", divDec(await user1.getBalance()));
  });

  it("User1 places tiles in first row", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user1.getBalance()));
    await multicall
      .connect(user1)
      .placeFor(user1.address, 1, "#b3ffee", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], {
        value: pointOne,
      });
    console.log("ETH balance: ", divDec(await user1.getBalance()));
  });

  it("User2 places tiles in first row", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user1.getBalance()));
    await multicall
      .connect(user2)
      .placeFor(user2.address, 1, "#af3501", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], {
        value: pointOne,
      });
    console.log("ETH balance: ", divDec(await user1.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#3c2c26",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#0b0088",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#064522",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          "#b200ff",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          "#0cbd00",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          "#038dc5",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#c5033a",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          "#5f550f",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          "#5f550f",
          [getRndInteger(0, 100)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("Grid data", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getPixels(0, 99); // Fetch 100 pixels for a 10x10 grid
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let row = 0; row < 10; row++) {
      let rowColors = [];
      for (let col = 0; col < 10; col++) {
        const pixelIndex = row * 10 + col;
        const pixel = gridChunk[pixelIndex];
        rowColors.push(pixel.color.toString());
      }
      console.log(rowColors.join(" "));
    }
  });

  it("Get Factions", async function () {
    console.log("******************************************************");
    console.log(await multicall.getFactions());
  });

  it("Get Account State", async function () {
    console.log("******************************************************");
    console.log(await multicall.getAccountState(user0.address));
  });

  it("Gauge data", async function () {
    console.log("******************************************************");
    console.log(await multicall.getGauge(user0.address));
  });

  it("Grid data Colors", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getPixels(0, 99); // Fetch 100 pixels for a 10x10 grid
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let row = 0; row < 10; row++) {
      let rowColors = [];
      for (let col = 0; col < 10; col++) {
        const pixelIndex = row * 10 + col;
        const pixel = gridChunk[pixelIndex];
        rowColors.push(pixel.color.toString());
      }
      console.log(rowColors.join(" "));
    }
  });

  it("Grid data Factions", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getPixels(0, 99); // Fetch 100 pixels for a 10x10 grid
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let row = 0; row < 10; row++) {
      let rowColors = [];
      for (let col = 0; col < 10; col++) {
        const pixelIndex = row * 10 + col;
        const pixel = gridChunk[pixelIndex];
        rowColors.push(pixel.faction.toString());
      }
      console.log(rowColors.join(" "));
    }
  });

  it("Increase Capacity", async function () {
    console.log("******************************************************");
    await expect(plugin.setCapacity(50)).to.be.revertedWith(
      "Plugin__InvalidCapacity()"
    );
    await plugin.setCapacity(200);
  });

  it("Grid data Factions", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getPixels(0, 199); // Fetch 100 pixels for a 10x10 grid
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let row = 0; row < 10; row++) {
      let rowColors = [];
      for (let col = 0; col < 20; col++) {
        const pixelIndex = row * 20 + col;
        const pixel = gridChunk[pixelIndex];
        rowColors.push(pixel.faction.toString());
      }
      console.log(rowColors.join(" "));
    }
  });

  it("Grid data Colors", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getPixels(0, 199); // Fetch 100 pixels for a 10x10 grid
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let row = 0; row < 10; row++) {
      let rowColors = [];
      for (let col = 0; col < 20; col++) {
        const pixelIndex = row * 20 + col;
        const pixel = gridChunk[pixelIndex];
        rowColors.push(pixel.color.toString());
      }
      console.log(rowColors.join(" "));
    }
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#064522",
          [getRndInteger(0, 200)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          "#b200ff",
          [getRndInteger(0, 200)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          "#0cbd00",
          [getRndInteger(0, 200)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#064522",
          [getRndInteger(0, 200)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          "#b200ff",
          [getRndInteger(0, 200)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          "#0cbd00",
          [getRndInteger(0, 200)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#064522",
          [getRndInteger(0, 200)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          "#b200ff",
          [getRndInteger(0, 200)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          "#0cbd00",
          [getRndInteger(0, 200)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#064522",
          [getRndInteger(0, 200)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          "#b200ff",
          [getRndInteger(0, 200)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          "#0cbd00",
          [getRndInteger(0, 200)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#064522",
          [getRndInteger(0, 200)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          "#b200ff",
          [getRndInteger(0, 200)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          "#0cbd00",
          [getRndInteger(0, 200)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#064522",
          [getRndInteger(0, 200)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          "#b200ff",
          [getRndInteger(0, 200)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          "#0cbd00",
          [getRndInteger(0, 200)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          "#064522",
          [getRndInteger(0, 200)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          "#b200ff",
          [getRndInteger(0, 200)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          "#0cbd00",
          [getRndInteger(0, 200)],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("Grid data Factions", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getPixels(0, 199); // Fetch 100 pixels for a 10x10 grid
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let row = 0; row < 10; row++) {
      let rowColors = [];
      for (let col = 0; col < 20; col++) {
        const pixelIndex = row * 20 + col;
        const pixel = gridChunk[pixelIndex];
        rowColors.push(pixel.faction.toString());
      }
      console.log(rowColors.join(" "));
    }
  });

  it("Grid data Colors", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getPixels(0, 199); // Fetch 100 pixels for a 10x10 grid
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let row = 0; row < 10; row++) {
      let rowColors = [];
      for (let col = 0; col < 20; col++) {
        const pixelIndex = row * 20 + col;
        const pixel = gridChunk[pixelIndex];
        rowColors.push(pixel.color.toString());
      }
      console.log(rowColors.join(" "));
    }
  });
});
