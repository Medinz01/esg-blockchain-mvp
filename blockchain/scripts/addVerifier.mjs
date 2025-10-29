import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const contractDataRaw = fs.readFileSync(
    path.resolve("../frontend/src/contracts/ESGRegistry.json"),
    "utf-8"
  );
  const contractData = JSON.parse(contractDataRaw);

  const contract = await hre.ethers.getContractAt(
    "ESGRegistry",
    contractData.address
  );

  const verifierAddr = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";

  console.log("Authorizing verifier:", verifierAddr);
  const tx = await contract.authorizeVerifier(verifierAddr);
  await tx.wait();
  console.log("Verifier authorized!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
