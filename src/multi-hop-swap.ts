import { ethers } from "ethers";
import RouterABI from "./abis/Router02.json";
import ERC20ABI from "./abis/ERC20.json";

/**
 * This example demonstrates how to perform a multi-hop swap on Neby.
 * A multi-hop swap is a transaction that routes through multiple pools to swap
 * one token for another when there is no direct pool available or when routing
 * through multiple pools provides a better price.
 */

// Production ROUTER Address 0x6Dd410DbF04b2C197353CD981eCC374906eB62F6
const ROUTER_ADDRESS = "0x5dbFD9d19c81021b6dbCb8766d853C7bB761a957";

const FEE_SIZE = 3

export enum FeeAmount {
  LOW = 500,
  MEDIUM = 3000,
  HIGH = 10000,
}

// FROM: https://github.com/Uniswap/v3-periphery/blob/main/test/shared/path.ts#L9
export function encodePath(path: string[], fees: FeeAmount[]): string {
  if (path.length != fees.length + 1) {
    throw new Error('path/fee lengths do not match')
  }

  let encoded = '0x'
  for (let i = 0; i < fees.length; i++) {
    // 20 byte encoding of the address
    encoded += path[i].slice(2)
    // 3 byte encoding of the fee
    encoded += fees[i].toString(16).padStart(2 * FEE_SIZE, '0')
  }
  // encode the final token
  encoded += path[path.length - 1].slice(2)

  return encoded.toLowerCase()
}

// Production change this to https://sapphire.oasis.io
const provider = new ethers.JsonRpcProvider(
  "https://testnet.sapphire.oasis.dev",
);

const wallet = new ethers.Wallet("0xYour-private-key", provider);

// Testnet tokens
const tokenIn = "0x9841aa6e415eE9c57C55720DBef9e02073307786";
const tokenHop = "0x3b00685d919C515A7BC2A6909a85e877cD217Cd1";
const tokenOut = "0x84DA87ffd41Abe5c95C8943f2259C986371DFE16";

const amountIn = ethers.parseEther("1");
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

  // Encode the path for the multi-hop swap
  // Both pools in the path have 0.3% fee tier (MEDIUM)
  const path = encodePath(
    [tokenIn, tokenHop, tokenOut],
    [FeeAmount.MEDIUM, FeeAmount.MEDIUM]
  );

  const swapParams = {
    path: path,
    recipient: to,
    deadline: deadline,
    amountIn: amountIn,
    amountOutMinimum: amountOutMin,
  };

  const tx = await router.exactInput(swapParams);
  console.log("Swap transaction submitted. Waiting for confirmation...");
  const receipt = await tx.wait();
  console.log("Swap confirmed:", receipt.hash);
}

const main = async () => {
  await approveToken();
  await swapTokens();
};

void main();
