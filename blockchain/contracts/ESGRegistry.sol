// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ESGRegistry {
    
    struct ESGRecord {
        address company;
        string companyName;
        uint256 timestamp;
        string dataType; // "carbon_emissions", "water_usage", "labor_audit", etc.
        string value;
        string unit;
        string verificationDocHash; // IPFS hash or document hash
        address verifier;
        bool isVerified;
        string comments;
    }
    
    struct Company {
        address companyAddress;
        string name;
        string registrationId;
        bool isRegistered;
        uint256 registrationTimestamp;
    }
    
    // Mappings
    mapping(address => Company) public companies;
    mapping(uint256 => ESGRecord) public esgRecords;
    mapping(address => bool) public authorizedVerifiers;
    mapping(address => uint256[]) public companyRecordIds;
    
    // Counters
    uint256 public totalRecords;
    uint256 public totalCompanies;
    
    // Events
    event CompanyRegistered(address indexed companyAddress, string name, uint256 timestamp);
    event ESGDataSubmitted(uint256 indexed recordId, address indexed company, string dataType, uint256 timestamp);
    event ESGDataVerified(uint256 indexed recordId, address indexed verifier, uint256 timestamp);
    event VerifierAuthorized(address indexed verifier, uint256 timestamp);
    event VerifierRevoked(address indexed verifier, uint256 timestamp);
    
    // Modifiers
    modifier onlyRegisteredCompany() {
        require(companies[msg.sender].isRegistered, "Company not registered");
        _;
    }
    
    modifier onlyAuthorizedVerifier() {
        require(authorizedVerifiers[msg.sender], "Not an authorized verifier");
        _;
    }
    
    // Admin address (contract deployer)
    address public admin;
    
    constructor() {
        admin = msg.sender;
        authorizedVerifiers[msg.sender] = true; // Admin is default verifier
    }
    
    // Company Management
    function registerCompany(string memory _name, string memory _registrationId) public {
        require(!companies[msg.sender].isRegistered, "Company already registered");
        require(bytes(_name).length > 0, "Company name required");
        
        companies[msg.sender] = Company({
            companyAddress: msg.sender,
            name: _name,
            registrationId: _registrationId,
            isRegistered: true,
            registrationTimestamp: block.timestamp
        });
        
        totalCompanies++;
        emit CompanyRegistered(msg.sender, _name, block.timestamp);
    }
    
    // ESG Data Submission
    function submitESGData(
        string memory _dataType,
        string memory _value,
        string memory _unit,
        string memory _verificationDocHash,
        string memory _comments
    ) public onlyRegisteredCompany returns (uint256) {
        require(bytes(_dataType).length > 0, "Data type required");
        require(bytes(_value).length > 0, "Value required");
        
        uint256 recordId = totalRecords;
        
        esgRecords[recordId] = ESGRecord({
            company: msg.sender,
            companyName: companies[msg.sender].name,
            timestamp: block.timestamp,
            dataType: _dataType,
            value: _value,
            unit: _unit,
            verificationDocHash: _verificationDocHash,
            verifier: address(0),
            isVerified: false,
            comments: _comments
        });
        
        companyRecordIds[msg.sender].push(recordId);
        totalRecords++;
        
        emit ESGDataSubmitted(recordId, msg.sender, _dataType, block.timestamp);
        
        return recordId;
    }
    
    // Verification by Authorized Verifiers
    function verifyESGData(uint256 _recordId, bool _isVerified, string memory _comments) 
        public 
        onlyAuthorizedVerifier 
    {
        require(_recordId < totalRecords, "Invalid record ID");
        require(!esgRecords[_recordId].isVerified, "Record already verified");
        
        esgRecords[_recordId].isVerified = _isVerified;
        esgRecords[_recordId].verifier = msg.sender;
        if (bytes(_comments).length > 0) {
            esgRecords[_recordId].comments = _comments;
        }
        
        emit ESGDataVerified(_recordId, msg.sender, block.timestamp);
    }
    
    // Verifier Management (Admin only)
    function authorizeVerifier(address _verifier) public {
        require(msg.sender == admin, "Only admin can authorize verifiers");
        require(!authorizedVerifiers[_verifier], "Already authorized");
        
        authorizedVerifiers[_verifier] = true;
        emit VerifierAuthorized(_verifier, block.timestamp);
    }
    
    function revokeVerifier(address _verifier) public {
        require(msg.sender == admin, "Only admin can revoke verifiers");
        require(authorizedVerifiers[_verifier], "Not authorized");
        
        authorizedVerifiers[_verifier] = false;
        emit VerifierRevoked(_verifier, block.timestamp);
    }
    
    // Query Functions
    function getCompanyRecords(address _company) public view returns (uint256[] memory) {
        return companyRecordIds[_company];
    }
    
    function getRecord(uint256 _recordId) public view returns (ESGRecord memory) {
        require(_recordId < totalRecords, "Invalid record ID");
        return esgRecords[_recordId];
    }
    
    function isCompanyRegistered(address _company) public view returns (bool) {
        return companies[_company].isRegistered;
    }
}
