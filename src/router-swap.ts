import { ethers } from "ethers";
import RouterABI from "./abis/Router02.json";
import ERC20ABI from "./abis/ERC20.json";

/**
 * This example works on sapphire testnet
 * */

// Production ROUTER Address 0x6Dd410DbF04b2C197353CD981eCC374906eB62F6
const ROUTER_ADDRESS = "0x5dbFD9d19c81021b6dbCb8766d853C7bB761a957";

// Production change this to https://sapphire.oasis.io
const provider = new ethers.JsonRpcProvider(
  "https://testnet.sapphire.oasis.dev",
);

const wallet = new ethers.Wallet("0xYour-private-key", provider);

// Testnet tokens
const tokenIn = "0x3b00685d919C515A7BC2A6909a85e877cD217Cd1";
const tokenOut = "0x0d31b21ae0854a40dc4f6554d2762ccF0a2559F4";

const amountIn = ethers.parseUnits("1.0", 6); // Token with 6 decimals
// Define your slippage here, 100% slippage currently
const amountOutMin = ethers.parseUnits("0", 18);

async function approveToken() {
  const tokenContract = new ethers.Contract(tokenIn, ERC20ABI, wallet);
  console.log("Approving router to spend tokenIn...");
  const approvalTx = await tokenContract.approve(ROUTER_ADDRESS, amountIn);
  console.log(`Approval transaction submitted: ${approvalTx.hash}`);
  await approvalTx.wait();
  console.log("Approval confirmed.");
}

async function swapTokens() {
  const router = new ethers.Contract(ROUTER_ADDRESS, RouterABI, wallet);
  const to = wallet.address;

  // Set a deadline for the transaction (current time + 20 minutes)
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

  const swapParams = {
    tokenIn: tokenIn,
    tokenOut: tokenOut,
    fee: 3000,
    recipient: to,
    deadline: deadline,
    amountIn: amountIn,
    amountOutMinimum: amountOutMin,
    sqrtPriceLimitX96: 0,
  };

  const tx = await router.exactInputSingle(swapParams);
  console.log("Swap transaction submitted. Waiting for confirmation...");
  const receipt = await tx.wait();
  console.log("Swap confirmed:", receipt.hash);
}

const main = async () => {
  await approveToken();
  await swapTokens();
};

void main();
