const { web3, contract, getGasPrice, estimateGas } = require('../config/blockchain');
const ESGSubmission = require('../models/ESGSubmission');
const User = require('../models/User');

// @route   POST /api/esg/submit
// @desc    Submit ESG data to blockchain
exports.submitESGData = async (req, res) => {
  try {
    const { dataType, value, unit, comments, reportingPeriod, metadata } = req.body;
    const userId = req.user._id;
    const user = req.user;

    // Validation
    if (!dataType || !value) {
      return res.status(400).json({ 
        error: 'Data type and value are required' 
      });
    }

    // Check if company is registered on blockchain
    const isRegistered = await contract.methods
      .isCompanyRegistered(user.walletAddress.toLowerCase())
      .call();
    
    if (!isRegistered) {
      return res.status(400).json({ 
        error: 'Company not registered on blockchain. Please register first.' 
      });
    }

    const walletAddress = user.walletAddress.toLowerCase();

    // Generate document hash (simplified - in production, use actual file hash)
    const documentHash = web3.utils.keccak256(
      JSON.stringify({
        dataType,
        value,
        unit,
        timestamp: Date.now(),
        company: user.companyName
      })
    );

    // Prepare blockchain transaction
    const method = contract.methods.submitESGData(
      dataType,
      value.toString(),
      unit || '',
      documentHash,
      comments || ''
    );

    // Estimate gas
    const gasEstimate = await estimateGas(method, walletAddress);
    const gasPrice = await getGasPrice();
    const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

    console.log('ESG Submission Transaction params:', {
      from: walletAddress,
      gasLimit,
      gasPrice: gasPrice.toString()
    });

    // Send transaction
    const tx = await method.send({
      from: walletAddress,
      gas: gasLimit,
      gasPrice: gasPrice.toString()
    });

    // Extract record ID from event
    const recordId = tx.events.ESGDataSubmitted.returnValues.recordId;

    // Save to MongoDB
    const submission = new ESGSubmission({
      userId,
      walletAddress,
      blockchainRecordId: Number(recordId),
      transactionHash: tx.transactionHash,
      dataType,
      value: value.toString(),
      unit: unit || '',
      documentHash,
      reportingPeriod: reportingPeriod || {},
      metadata: metadata || {},
      submittedAt: new Date()
    });

    await submission.save();

    res.status(201).json({
      success: true,
      message: 'ESG data submitted successfully',
      data: {
        recordId: Number(recordId),
        transactionHash: tx.transactionHash,
        blockNumber: Number(tx.blockNumber),
        gasUsed: tx.gasUsed.toString(),
        submission: {
          id: submission._id,
          dataType: submission.dataType,
          value: submission.value,
          unit: submission.unit,
          submittedAt: submission.submittedAt
        }
      }
    });

  } catch (error) {
    console.error('Error submitting ESG data:', error);
    
    if (error.message.includes('insufficient funds')) {
      return res.status(400).json({ 
        error: 'Insufficient funds in wallet for transaction' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to submit ESG data', 
      details: error.message 
    });
  }
};

// @route   GET /api/esg/records
// @desc    Get company's ESG records
exports.getCompanyRecords = async (req, res) => {
  try {
    const userId = req.user._id;
    const walletAddress = req.user.walletAddress.toLowerCase();

    // Get records from MongoDB
    const dbRecords = await ESGSubmission.find({ userId })
      .sort({ submittedAt: -1 });

    // Get blockchain record IDs
    const recordIds = await contract.methods
      .getCompanyRecords(walletAddress)
      .call();

    // Get detailed blockchain records - FIXED: Convert all BigInt to Number/String
    const blockchainRecords = await Promise.all(
      recordIds.map(async (id) => {
        try {
          const record = await contract.methods.getRecord(id).call();
          
          // Convert all BigInt values explicitly
          return {
            id: Number(id),
            company: record.company,
            companyName: record.companyName,
            timestamp: Number(record.timestamp),
            dataType: record.dataType,
            value: record.value,
            unit: record.unit,
            verificationDocHash: record.verificationDocHash,
            verifier: record.verifier,
            isVerified: record.isVerified,
            comments: record.comments
          };
        } catch (error) {
          console.error('Error fetching record', id, error);
          return null;
        }
      })
    );

    // Combine data - FIXED: Ensure all data is serializable
    const records = dbRecords.map(dbRecord => {
      const blockchainRecord = blockchainRecords.find(
        br => br && br.id === dbRecord.blockchainRecordId
      );
      
      // Convert MongoDB document to plain object
      const plainRecord = dbRecord.toObject();
      
      return {
        ...plainRecord,
        blockchain: blockchainRecord || null
      };
    });

    res.json({ 
      success: true, 
      count: records.length,
      records 
    });

  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ 
      error: 'Failed to fetch records',
      details: error.message 
    });
  }
};


// @route   GET /api/esg/record/:recordId
// @desc    Get single ESG record by blockchain ID
exports.getRecordById = async (req, res) => {
  try {
    const { recordId } = req.params;

    // Get from blockchain - FIXED: Convert BigInt values
    const record = await contract.methods.getRecord(recordId).call();
    
    const blockchainRecord = {
      id: Number(recordId),
      company: record.company,
      companyName: record.companyName,
      timestamp: Number(record.timestamp),
      dataType: record.dataType,
      value: record.value,
      unit: record.unit,
      verificationDocHash: record.verificationDocHash,
      verifier: record.verifier,
      isVerified: record.isVerified,
      comments: record.comments
    };

    // Get from database
    const dbRecord = await ESGSubmission.findOne({ 
      blockchainRecordId: Number(recordId) 
    }).populate('userId', 'companyName email walletAddress');

    res.json({
      success: true,
      record: {
        blockchain: blockchainRecord,
        database: dbRecord
      }
    });

  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({ 
      error: 'Failed to fetch record',
      details: error.message 
    });
  }
};


// @route   GET /api/esg/data-types
// @desc    Get available ESG data types
exports.getDataTypes = async (req, res) => {
  const dataTypes = [
    {
      value: 'carbon_emissions',
      label: 'Carbon Emissions',
      description: 'Total greenhouse gas emissions',
      units: ['tonnes CO2', 'kg CO2', 'tonnes CO2e']
    },
    {
      value: 'energy_consumption',
      label: 'Energy Consumption',
      description: 'Total energy usage',
      units: ['MWh', 'kWh', 'GJ', 'BTU']
    },
    {
      value: 'water_usage',
      label: 'Water Usage',
      description: 'Total water consumption',
      units: ['cubic meters', 'liters', 'gallons']
    },
    {
      value: 'waste_generation',
      label: 'Waste Generation',
      description: 'Total waste produced',
      units: ['tonnes', 'kg', 'cubic meters']
    },
    {
      value: 'renewable_energy',
      label: 'Renewable Energy',
      description: 'Renewable energy usage percentage',
      units: ['%', 'MWh', 'kWh']
    },
    {
      value: 'employee_satisfaction',
      label: 'Employee Satisfaction',
      description: 'Employee satisfaction score',
      units: ['score (1-10)', '%', 'index']
    },
    {
      value: 'safety_incidents',
      label: 'Safety Incidents',
      description: 'Number of workplace safety incidents',
      units: ['count', 'per 1000 employees', 'rate']
    },
    {
      value: 'diversity_ratio',
      label: 'Diversity Ratio',
      description: 'Workforce diversity percentage',
      units: ['%', 'ratio', 'index']
    },
    {
      value: 'supply_chain_ethics',
      label: 'Supply Chain Ethics',
      description: 'Ethical supply chain score',
      units: ['score (1-10)', '%', 'compliance rate']
    }
  ];

  res.json({ success: true, dataTypes });
};
