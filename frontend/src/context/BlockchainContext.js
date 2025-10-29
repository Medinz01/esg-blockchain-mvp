import React, { createContext } from 'react';
import axios from 'axios';

export const BlockchainContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const BlockchainProvider = ({ children }) => {
  const registerCompany = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/blockchain/register`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Blockchain registration failed',
      };
    }
  };

  const getBlockchainStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/blockchain/stats`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch stats',
      };
    }
  };

  const getCompanyInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/blockchain/company-info`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch company info',
      };
    }
  };

  return (
    <BlockchainContext.Provider
      value={{
        registerCompany,
        getBlockchainStats,
        getCompanyInfo,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};
