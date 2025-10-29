const { web3, contract, getGasPrice, estimateGas } = require('../config/blockchain');
const ESGSubmission = require('../models/ESGSubmission');
const User = require('../models/User');

// @route   GET /api/verification/pending
// @desc    Get all pending ESG records for verification
exports.getPendingRecords = async (req, res) => {
  try {
    // Get all unverified submissions
    const pendingSubmissions = await ESGSubmission.find({ 
      isVerified: false 
    })
    .populate('userId', 'companyName email walletAddress')
    .sort({ submittedAt: -1 });

    // Get blockchain data for each
    const recordsWithBlockchainData = await Promise.all(
      pendingSubmissions.map(async (submission) => {
        try {
          const blockchainRecord = await contract.methods
            .getRecord(submission.blockchainRecordId)
            .call();

          return {
            ...submission.toObject(),
            blockchain: {
              id: Number(submission.blockchainRecordId),
              company: blockchainRecord.company,
              companyName: blockchainRecord.companyName,
              timestamp: Number(blockchainRecord.timestamp),
              dataType: blockchainRecord.dataType,
              value: blockchainRecord.value,
              unit: blockchainRecord.unit,
              verificationDocHash: blockchainRecord.verificationDocHash,
              isVerified: blockchainRecord.isVerified,
              comments: blockchainRecord.comments
            }
          };
        } catch (error) {
          console.error('Error fetching blockchain record:', error);
          return {
            ...submission.toObject(),
            blockchain: null
          };
        }
      })
    );

    res.json({
      success: true,
      count: recordsWithBlockchainData.length,
      records: recordsWithBlockchainData
    });

  } catch (error) {
    console.error('Error fetching pending records:', error);
    res.status(500).json({ 
      error: 'Failed to fetch pending records',
      details: error.message 
    });
  }
};

// @route   GET /api/verification/all
// @desc    Get all ESG records (verified and unverified)
exports.getAllRecords = async (req, res) => {
  try {
    const allSubmissions = await ESGSubmission.find()
      .populate('userId', 'companyName email walletAddress')
      .populate('verifier', 'companyName email')
      .sort({ submittedAt: -1 })
      .limit(100);

    const recordsWithBlockchainData = await Promise.all(
      allSubmissions.map(async (submission) => {
        try {
          const blockchainRecord = await contract.methods
            .getRecord(submission.blockchainRecordId)
            .call();

          return {
            ...submission.toObject(),
            blockchain: {
              id: Number(submission.blockchainRecordId),
              company: blockchainRecord.company,
              companyName: blockchainRecord.companyName,
              timestamp: Number(blockchainRecord.timestamp),
              dataType: blockchainRecord.dataType,
              value: blockchainRecord.value,
              unit: blockchainRecord.unit,
              isVerified: blockchainRecord.isVerified,
              verifier: blockchainRecord.verifier
            }
          };
        } catch (error) {
          return {
            ...submission.toObject(),
            blockchain: null
          };
        }
      })
    );

    res.json({
      success: true,
      count: recordsWithBlockchainData.length,
      records: recordsWithBlockchainData
    });

  } catch (error) {
    console.error('Error fetching all records:', error);
    res.status(500).json({ 
      error: 'Failed to fetch records',
      details: error.message 
    });
  }
};

// @route   POST /api/verification/verify/:recordId
// @desc    Verify an ESG record
exports.verifyRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { approved, comments } = req.body;
    const verifier = req.user;

    // Check if user is a verifier
    if (verifier.role !== 'verifier' && verifier.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Only authorized verifiers can verify ESG data' 
      });
    }

    // Get submission from database
    const submission = await ESGSubmission.findOne({ 
      blockchainRecordId: Number(recordId) 
    });

    if (!submission) {
      return res.status(404).json({ error: 'Record not found' });
    }

    if (submission.isVerified) {
      return res.status(400).json({ error: 'Record already verified' });
    }

    const walletAddress = verifier.walletAddress.toLowerCase();

    // Prepare blockchain transaction
    const method = contract.methods.verifyESGData(
      recordId,
      approved,
      comments || ''
    );

    // Estimate gas
    const gasEstimate = await estimateGas(method, walletAddress);
    const gasPrice = await getGasPrice();
    const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

    console.log('Verification Transaction params:', {
      recordId,
      approved,
      from: walletAddress,
      gasLimit
    });

    // Send transaction
    const tx = await method.send({
      from: walletAddress,
      gas: gasLimit,
      gasPrice: gasPrice.toString()
    });

    // Update database
    submission.isVerified = approved;
    submission.verifier = verifier._id;
    submission.verificationDate = new Date();
    await submission.save();

    res.json({
      success: true,
      message: `Record ${approved ? 'approved' : 'rejected'} successfully`,
      data: {
        recordId: Number(recordId),
        transactionHash: tx.transactionHash,
        blockNumber: Number(tx.blockNumber),
        gasUsed: tx.gasUsed.toString(),
        approved
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    
    if (error.message.includes('Record already verified')) {
      return res.status(400).json({ 
        error: 'Record already verified on blockchain' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to verify record',
      details: error.message 
    });
  }
};

// @route   GET /api/verification/stats
// @desc    Get verification statistics
exports.getVerificationStats = async (req, res) => {
  try {
    const totalRecords = await ESGSubmission.countDocuments();
    const verifiedRecords = await ESGSubmission.countDocuments({ isVerified: true });
    const pendingRecords = await ESGSubmission.countDocuments({ isVerified: false });
    
    const totalCompanies = await User.countDocuments({ 
      role: 'company',
      isBlockchainRegistered: true 
    });
    
    const totalVerifiers = await User.countDocuments({ role: 'verifier' });

    res.json({
      success: true,
      stats: {
        totalRecords,
        verifiedRecords,
        pendingRecords,
        verificationRate: totalRecords > 0 
          ? ((verifiedRecords / totalRecords) * 100).toFixed(1) 
          : 0,
        totalCompanies,
        totalVerifiers
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      details: error.message 
    });
  }
};
