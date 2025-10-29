# ESG Blockchain MVP

![CI](https://github.com/your-username/esg-blockchain-mvp/actions/workflows/ci.yml/badge.svg)


A full-stack ESG data registry and verification app using **React**, **Node.js**, **MongoDB**, **Ethereum** (smart contracts), and **Docker Compose**.

## Features

- Company registration and ESG data submission on blockchain
- Verifier dashboard to approve/reject submissions (after on-chain authorization)
- Built with Vite + React, Express backend, Hardhat smart contracts
- Runs locally and consistently with Docker Compose

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/) (for development outside containers)
- [GitHub CLI](https://cli.github.com/) (optional)

### Setup & Run

git clone https://github.com/Medinz01/esg-blockchain-mvp.git
cd esg-blockchain-mvp
docker-compose up -d --build


> **Frontend:** [http://localhost:8080](http://localhost:8080)  
> **Backend API:** [http://localhost:5000](http://localhost:5000)  
> **Blockchain (Ganache):** [http://localhost:8545](http://localhost:8545)  
> **MongoDB:** [mongodb://localhost:27017](mongodb://localhost:27017)

### Smart Contract Management

**To deploy contracts and authorize verifier:**

docker-compose exec blockchain npx hardhat run scripts/deploy.mjs --network ganache
docker-compose exec blockchain npx hardhat run scripts/addVerifier.mjs --network ganache


### Dev Accounts

Get test wallet addresses:

docker logs esg-ganache

Use these for company and verifier registration.

### Database Admin

Connect to MongoDB:

docker exec -it esg-mongodb mongosh
use esg_database
db.users.find().pretty()


Change user role:

db.users.updateOne({ email: "verifier@test.com" }, { $set: { role: "verifier" } })


### Note

- After restarting Ganache or redeploying contracts, you must re-register companies and re-authorize verifiers on-chain.

## Project Structure

.
├── backend/
├── frontend/
├── blockchain/
├── docker-compose.yml


## License

MIT
