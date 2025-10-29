const { web3, contract, getGasPrice, estimateGas } = require('../config/blockchain');
const User = require('../models/User');

// @route   POST /api/blockchain/register-company
// @desc    Register company on blockchain
exports.registerCompany = async (req, res) => {
  try {
    console.log("registerCompany: controller called");
    const userId = req.userId;
    const user = await User.findById(userId);
    console.log("registerCompany: user found:", user && user.email, user && user.walletAddress);


    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isBlockchainRegistered) {
      return res.status(400).json({ 
        error: 'Company already registered on blockchain' 
      });
    }

    const { companyName, registrationId } = user;
    const walletAddress = user.walletAddress.toLowerCase();

    // Check if already registered on blockchain
    const isRegistered = await contract.methods
      .isCompanyRegistered(walletAddress)
      .call();

    if (isRegistered) {
      // Update database
      user.isBlockchainRegistered = true;
      await user.save();
      
      return res.status(400).json({ 
        error: 'Company already registered on blockchain' 
      });
    }

    // Prepare transaction
    console.log("registerCompany: calling contract, params:", companyName, registrationId, walletAddress);

    const method = contract.methods.registerCompany(
      companyName,
      registrationId || 'N/A'
    );

    // Estimate gas - FIXED: Convert BigInt to Number
    const gasEstimate = await estimateGas(method, walletAddress);
    const gasPrice = await getGasPrice();

    // Convert to numbers and add buffer - FIXED
    const gasLimit = Math.floor(Number(gasEstimate) * 1.2);
    const gasPriceValue = gasPrice.toString();

    console.log('Transaction params:', {
      from: walletAddress,
      gasLimit,
      gasPrice: gasPriceValue
    });

    console.log("registerCompany: sending tx", {
      from: walletAddress,
      gas: gasLimit,
      gasPrice: gasPriceValue
    });


    // Send transaction - FIXED: Use proper type conversions
    const tx = await method.send({
      from: walletAddress,
      gas: gasLimit,
      gasPrice: gasPriceValue
    });

    // Update database
    user.isBlockchainRegistered = true;
    await user.save();

    res.json({
      success: true,
      message: 'Company registered on blockchain successfully',
      transactionHash: tx.transactionHash,
      blockNumber: Number(tx.blockNumber),
      gasUsed: tx.gasUsed.toString()
    });

  } catch (error) {
    console.error('Blockchain registration error:', error);
    
    // Handle specific errors
    if (error.message.includes('Company already registered')) {
      return res.status(400).json({ 
        error: 'Company already registered on blockchain' 
      });
    }
    
    if (error.message.includes('insufficient funds')) {
      return res.status(400).json({ 
        error: 'Insufficient funds in wallet for transaction' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to register on blockchain',
      details: error.message 
    });
  }
};

// @route   GET /api/blockchain/company-info
// @desc    Get company info from blockchain
exports.getCompanyInfo = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const walletAddress = user.walletAddress.toLowerCase();

    // Get company info from blockchain
    const companyInfo = await contract.methods
      .companies(walletAddress)
      .call();

    const isRegistered = companyInfo.isRegistered;

    if (!isRegistered) {
      return res.json({
        success: true,
        isRegistered: false,
        message: 'Company not registered on blockchain'
      });
    }

    // FIXED: Convert BigInt timestamp
    const timestamp = Number(companyInfo.registrationTimestamp);

    res.json({
      success: true,
      isRegistered: true,
      company: {
        address: companyInfo.companyAddress,
        name: companyInfo.name,
        registrationId: companyInfo.registrationId,
        registrationTimestamp: new Date(timestamp * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Get company info error:', error);
    res.status(500).json({ 
      error: 'Failed to get company info',
      details: error.message 
    });
  }
};

// @route   GET /api/blockchain/stats
// @desc    Get blockchain statistics
exports.getBlockchainStats = async (req, res) => {
  try {
    const totalCompanies = await contract.methods.totalCompanies().call();
    const totalRecords = await contract.methods.totalRecords().call();

    // FIXED: Convert BigInt to string
    res.json({
      success: true,
      stats: {
        totalCompanies: totalCompanies.toString(),
        totalRecords: totalRecords.toString(),
        contractAddress: contract.options.address
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get blockchain stats',
      details: error.message 
    });
  }
};
