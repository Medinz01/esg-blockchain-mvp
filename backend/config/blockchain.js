const { Web3 } = require('web3');
const contractData = require('../contracts/ESGRegistry.json');

const web3 = new Web3(process.env.BLOCKCHAIN_RPC || 'http://localhost:8545');
const contract = new web3.eth.Contract(contractData.abi, contractData.address);

console.log("[DEBUG CONTRACT]: Loaded contract address:", contractData.address);

// Get gas price - FIXED: Return string
const getGasPrice = async () => {
  try {
    const gasPrice = await web3.eth.getGasPrice();
    return gasPrice.toString();
  } catch (error) {
    console.error('Error getting gas price:', error);
    return web3.utils.toWei('2', 'gwei').toString();
  }
};

// Estimate gas for a transaction - FIXED: Return number
const estimateGas = async (method, from) => {
  try {
    const estimate = await method.estimateGas({ from });
    return Number(estimate);
  } catch (error) {
    console.error('Error estimating gas:', error);
    return 500000; // Fallback
  }
};

module.exports = {
  web3,
  contract,
  contractAddress: contractData.address,
  getGasPrice,
  estimateGas
};
