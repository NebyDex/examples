import gql from "graphql-tag";
import { createClient, fetchExchange } from "urql";

const NEBY_SUBGRAPH_URL = "https://graph.api.neby.exchange/dex";

const query = gql`
  query getPoolTVL($poolAddress: ID!) {
    pool(id: $poolAddress) {
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
      liquidity
      totalValueLockedUSD
    }
  }
`;

async function getNebyPoolTVL(poolAddress: string) {
  const client = createClient({
    url: NEBY_SUBGRAPH_URL,
    exchanges: [fetchExchange],
  });

  const variables = { poolAddress: poolAddress.toLowerCase() };

  const response = await client.query(query, variables).toPromise();

  const tvlUSD = parseFloat(response.data.pool.totalValueLockedUSD);

  console.log("Pool ID:", response.data.pool.id);
  console.log("Token0:", response.data.pool.token0.symbol);
  console.log("Token1:", response.data.pool.token1.symbol);
  console.log("Liquidity:", response.data.pool.liquidity);
  console.log("Total Value Locked (USD):", tvlUSD.toFixed(2));
}

const main = async () => {
  const poolAddress = "0x3a2976b76b9af12639878b87b4ccef2e951ca5aa";

  await getNebyPoolTVL(poolAddress);
};

void main();
