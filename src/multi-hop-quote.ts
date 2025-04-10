import { ethers } from "ethers";
import QuoterV2 from "./abis/QouterV2.json";

/**
 * This example demonstrates how to get a quote for a multi-hop swap on Neby.
 * A multi-hop swap is a transaction that routes through multiple pools to swap
 * one token for another when there is no direct pool available or when routing
 * through multiple pools provides a better price.
 */

// Neby Quoter V2 Contract
const QUOTER_ADDRESS = "0xA7A00B2493F362B5232337398C0eC6052165464c";


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

/**
 * Gets a quote for a multi-hop swap using the Neby Quoter V2 contract.
 * 
 * @param amountIn - The amount of input tokens to swap
 * @param encodedPath - The encoded path of tokens and fees for the swap
 * @returns The expected amount of output tokens
 */
export async function getQuote(
    amountIn: ethers.BigNumberish,
    encodedPath: string,
): Promise<ethers.BigNumberish> {
  const provider = new ethers.JsonRpcProvider("https://sapphire.oasis.io");
  const quoterContract = new ethers.Contract(
    QUOTER_ADDRESS,
    QuoterV2,
    provider,
  );

  // Call the quoteExactInput function on the Quoter contract
  // This is a static call, so it doesn't actually execute the swap
  const quote = await quoterContract.quoteExactInput.staticCall(
      encodedPath,
      amountIn,
  );

  return quote[0]
}

async function main() {
  const tokenIn: string = "0x8Bc2B030b299964eEfb5e1e0b36991352E56D2D3"; // wROSE
  const tokenHop: string = "0xA14167756d9F86Aed12b472C29B257BBdD9974C2"; // BitUSDs
  const tokenOut: string = "0xDD629E5241CbC5919847783e6C96B2De4754e438"; // mtBILL

  const amountIn: ethers.BigNumberish = ethers.parseEther("1"); // 1 wROSE
  // Both pools in the path have 0.3% fee tier
  const path = encodePath([tokenIn, tokenHop, tokenOut], [FeeAmount.MEDIUM, FeeAmount.MEDIUM]);

  try {
    const quote = await getQuote(amountIn, path);
    console.log(`Amount in: ${ethers.formatEther(amountIn)} wROSE`);
    console.log(`Amount out: ${ethers.formatEther(quote)} mtBILL`);
  } catch (error) {
    console.error("Error", error);
  }
}

void main();
