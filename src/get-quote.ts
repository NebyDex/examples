import { BigNumberish, ethers } from "ethers";
import QuoterV2 from "./abis/QouterV2.json";

// Neby Quoter V2 Contract
const QUOTER_ADDRESS = "0xA7A00B2493F362B5232337398C0eC6052165464c";

export async function getQuote(
    tokenIn: string,
    tokenOut: string,
    fee: number,
    amountIn: ethers.BigNumberish
): Promise<{
    amountOut: BigNumberish,
    sqrtPriceX96After: BigNumberish,
    initializedTicksCrossed: BigNumberish,
    gasEstimate: BigNumberish
}> {
    const provider = new ethers.JsonRpcProvider("https://sapphire.oasis.io");
    const quoterContract = new ethers.Contract(QUOTER_ADDRESS, QuoterV2, provider);

    // Set sqrtPriceLimitX96 to 0 to indicate no price limit
    const sqrtPriceLimitX96 = 0;

    const quote = await quoterContract.quoteExactInputSingle.staticCall({
        tokenIn,
        tokenOut,
        fee,
        amountIn,
        sqrtPriceLimitX96
    });

    return {
        amountOut: quote[0],
        sqrtPriceX96After: quote[1],
        initializedTicksCrossed: quote[2],
        gasEstimate: quote[3]
    };
}

async function main() {

    const tokenIn: string = "0x8Bc2B030b299964eEfb5e1e0b36991352E56D2D3"; // wROSE
    const tokenOut: string = "0x97eec1c29f745dC7c267F90292AA663d997a601D"; // USDC - 6 decimals
    const fee: number = 3000; // 0.3% fee tier
    const amountIn: ethers.BigNumberish = ethers.parseEther("100"); // 100 wROSE with 18 decimals

    try {
        const quote = await getQuote(tokenIn, tokenOut, fee, amountIn);
        console.log(`Amount in: ${ethers.formatEther(amountIn)} wROSE`);
        console.log(`Amount out: ${ethers.formatUnits(quote.amountOut, 6)} USDC`); // Quote
        // Other information
        console.log(`Square root price after swap: ${quote.sqrtPriceX96After}`);
        console.log(`Initialized ticks crossed: ${quote.initializedTicksCrossed}`);
        console.log(`Gas estimate: ${quote.gasEstimate}`);
    } catch (error) {
        console.error("Error", error);
    }
}

void main();
