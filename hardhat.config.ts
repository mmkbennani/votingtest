import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-verify';
import 'solidity-docgen';
import 'dotenv/config';
import 'tsconfig-paths/register'; 
import "hardhat-gas-reporter"

const { API_URL, PRIVATE_KEY, AMOY_API_URL, AMOY_PRIVATE_KEY } = process.env;

const config: HardhatUserConfig = {
  gasReporter: {
    enabled: true,
    currency:'EUR',
  },
  networks: {
    baseSepolia: {
      accounts: [`0x${PRIVATE_KEY}`],
      url: API_URL,
    },
    amoy: {
      accounts: [`0x${AMOY_PRIVATE_KEY}`],
      url: AMOY_API_URL,
    },
    hardhat: {},
  },
  solidity: '0.8.28',
};

export default config;
