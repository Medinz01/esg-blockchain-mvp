import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Deploying ESGRegistry contract...");

  const ESGRegistry = await hre.ethers.getContractFactory("ESGRegistry");
  const esgRegistry = await ESGRegistry.deploy();
  await esgRegistry.waitForDeployment();

  const address = await esgRegistry.getAddress();
  console.log("ESGRegistry deployed to:", address);

  // Save contract address and ABI
  const contractData = {
    address: address,
    abi: JSON.parse(esgRegistry.interface.formatJson())
  };

  const backendDir = path.join(process.cwd(), "../backend/contracts");
  const frontendDir = path.join(process.cwd(), "../frontend/src/contracts");

  if (!fs.existsSync(backendDir)) fs.mkdirSync(backendDir, { recursive: true });
  if (!fs.existsSync(frontendDir)) fs.mkdirSync(frontendDir, { recursive: true });

  fs.writeFileSync(path.join(backendDir, "ESGRegistry.json"), JSON.stringify(contractData, null, 2));
  fs.writeFileSync(path.join(frontendDir, "ESGRegistry.json"), JSON.stringify(contractData, null, 2));

  console.log("Contract data saved to backend and frontend");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
