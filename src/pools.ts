import gql from "graphql-tag";
import { createClient, fetchExchange } from "urql";

// Neby production subgraph url
const NEBY_SUBGRAPH_URL = "https://graph.api.neby.exchange/dex";
// Testnet url: https://graph.dev.neby.exchange/dex

const query = gql`
  query getAllPools($first: Int!, $skip: Int!) {
    pools(
      first: $first
      skip: $skip
      orderBy: totalValueLockedUSD
      orderDirection: desc
    ) {
      id
      token0 {
        id
        symbol
        decimals
      }
      token1 {
        id
        symbol
        decimals
      }
      feeTier
      liquidity
      volumeUSD
      totalValueLockedUSD
    }
  }
`;

async function getNebyPools(limit: number = 10, skip: number = 0) {
  const client = createClient({
    url: NEBY_SUBGRAPH_URL,
    exchanges: [fetchExchange],
  });

  const response = await client
    .query(query, { first: limit, skip: skip })
    .toPromise();

  if (response.error) {
    console.error("Error fetching pools:", response.error);
    return;
  }

  const pools = response.data.pools;

  console.log(`Fetched ${pools.length} pools from Neby DEX:`);
  console.log("-------------------------------------------");

  pools.forEach((pool: any, index: number) => {
    console.log(`Pool #${index + 1}:`);
    console.log(`ID: ${pool.id}`);
    console.log(`Pair: ${pool.token0.symbol}/${pool.token1.symbol}`);
    console.log(`Fee Tier: ${pool.feeTier / 10000}%`);
    console.log(`Liquidity: ${pool.liquidity}`);
    console.log(`Volume USD: $${parseFloat(pool.volumeUSD).toFixed(2)}`);
    console.log(
      `Total Value Locked (USD): $${parseFloat(pool.totalValueLockedUSD).toFixed(2)}`,
    );
    console.log("-------------------------------------------");
  });

  return pools;
}

async function main() {
  try {
    // Get the top 50 pools by TVL
    await getNebyPools(50, 0);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

void main();
