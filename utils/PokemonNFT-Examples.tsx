/**
 * Pokemon NFT Pipeline - Usage Examples
 * Complete implementation examples for different scenarios
 */

import {
  Contract,
  ethers,
  Signer,
} from "ethers";
import * as React from 'react';

import {
  approveNFT,
  claimMultiplePokemon,
  claimPokemon,
  completePipeline,
  getPokemonFromAPI,
  getPokemonStatus,
  getTokenOwner,
  getUserBalance,
  hasUserClaimed,
  setApprovalForAll,
  transferNFT
} from "./PokemonNFT-Pipeline";

// ============ Setup Functions ============

/**
 * Initialize contract instance
 * @param contractAddress - Deployed contract address
 * @param contractABI - Contract ABI from Ethers
 * @param provider - Ethers provider
 * @returns Contract instance
 */
export function initializeContract(
  contractAddress: string,
  contractABI: any[],
  provider: ethers.providers.Provider
): Contract {
  return new ethers.Contract(contractAddress, contractABI, provider);
}

/**
 * Get signer from provider
 * @param provider - Ethers provider
 * @returns Signer instance
 */
export async function getSigner(
  provider: ethers.providers.Web3Provider
): Promise<Signer> {
  const accounts = await provider.send("eth_requestAccounts", []);
  return provider.getSigner(accounts[0]);
}

// ============ Example 1: Simple Single Claim ============

/**
 * Example: User claims Bulbasaur (Pokemon #1)
 */
export async function exampleSingleClaim() {
  console.log("\n🎮 EXAMPLE 1: Single Pokemon Claim\n");

  // Setup (in real app, these would be passed in)
  const contractAddress = "0x..."; // Your contract address
  const contractABI: any[] = []; // Your contract ABI
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
  const signer = provider.getSigner();

  try {
    // Initialize contract
    const contract = initializeContract(contractAddress, contractABI, provider);

    // Step 1: Fetch Pokemon data
    const bulbasaur = await getPokemonFromAPI(1);
    console.log(`Fetched: ${bulbasaur.name}`);

    // Step 2: Claim the Pokemon
    const claimResult = await claimPokemon(contract, signer, bulbasaur);

    if (claimResult.success) {
      console.log(`✅ Claimed! Token ID: ${claimResult.tokenId}`);
      console.log(`   Transaction: ${claimResult.transactionHash}`);
      console.log(`   First Claim: ${claimResult.isFirstClaim}`);
    } else {
      console.error(`❌ Failed: ${claimResult.error}`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// ============ Example 2: Batch Claiming ============

/**
 * Example: Claim first generation Pokemon (1-151)
 */
export async function exampleBatchClaim() {
  console.log("\n🎮 EXAMPLE 2: Batch Claiming Pokemon\n");

  const contractAddress = "0x...";
  const contractABI: any[] = [];
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
  const signer = provider.getSigner();

  try {
    const contract = initializeContract(contractAddress, contractABI, provider);

    // Claim Pokemon #1 through #10
    const pokemonIds = Array.from({ length: 10 }, (_, i) => i + 1);
    console.log(`Claiming Pokemon #${pokemonIds[0]} through #${pokemonIds[pokemonIds.length - 1]}...`);

    const results = await claimMultiplePokemon(
      contract,
      signer,
      pokemonIds
    );

    // Summary
    const successful = results.filter((r) => r.success).length;
    console.log(
      `\n📊 Results: ${successful}/${pokemonIds.length} successful`
    );

    results.forEach((result, index) => {
      if (result.success) {
        console.log(`  ✅ Pokemon #${pokemonIds[index]}: Token ID ${result.tokenId}`);
      } else {
        console.log(`  ❌ Pokemon #${pokemonIds[index]}: ${result.error}`);
      }
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

// ============ Example 3: Check Pokemon Status ============

/**
 * Example: Check if Pokemon is initialized and get claims count
 */
export async function exampleCheckStatus() {
  console.log("\n🎮 EXAMPLE 3: Check Pokemon Status\n");

  const contractAddress = "0x...";
  const contractABI: any[] = [];
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

  try {
    const contract = initializeContract(contractAddress, contractABI, provider);

    // Check multiple Pokemon
    const pokemonIds = [1, 4, 7, 25, 39]; // Bulbasaur, Charmander, Squirtle, Pikachu, Jigglypuff

    console.log("Checking Pokemon status...\n");

    for (const pokemonId of pokemonIds) {
      const status = await getPokemonStatus(contract, pokemonId);

      console.log(`Pokemon #${pokemonId}:`);
      console.log(`  Initialized: ${status.isInitialized}`);
      console.log(`  Total Claims: ${status.totalClaims}`);

      if (status.metadata) {
        console.log(`  Name: ${status.metadata.name}`);
        console.log(`  Type: ${status.metadata.pokemonType}`);
      }
      console.log();
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// ============ Example 4: User Balance and Claimed Pokemon ============

/**
 * Example: Check user's NFT balance and what they've claimed
 */
export async function exampleUserStatus() {
  console.log("\n🎮 EXAMPLE 4: User Status\n");

  const contractAddress = "0x...";
  const contractABI: any[] = [];
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
  const signer = provider.getSigner();

  try {
    const contract = initializeContract(contractAddress, contractABI, provider);
    const userAddress = await signer.getAddress();

    // Get balance
    const balance = await getUserBalance(contract, userAddress);
    console.log(`User: ${userAddress}`);
    console.log(`Pokemon NFTs owned: ${balance}\n`);

    // Check which Pokemon user has claimed
    const pokemonIds = [1, 4, 7, 25, 39];
    console.log("Claim Status:");
    for (const pokemonId of pokemonIds) {
      const claimed = await hasUserClaimed(contract, userAddress, pokemonId);
      console.log(`  Pokemon #${pokemonId}: ${claimed ? "✅ Claimed" : "❌ Not claimed"}`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// ============ Example 5: Complete Pipeline ============

/**
 * Example: Full pipeline from API fetch to verification
 */
export async function exampleCompletePipeline() {
  console.log("\n🎮 EXAMPLE 5: Complete Pipeline\n");

  const contractAddress = "0x...";
  const contractABI: any[] = [];
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
  const signer = provider.getSigner();

  try {
    const contract = initializeContract(contractAddress, contractABI, provider);

    // Run complete pipeline for Pokemon #25 (Pikachu)
    const result = await completePipeline(contract, signer, 25);

    // Access results
    console.log("\nFinal Results:");
    console.log(`  Pokemon: ${result.pokemonData.name}`);
    console.log(`  Token ID: ${result.claimResult.tokenId}`);
    console.log(`  Transaction: ${result.claimResult.transactionHash}`);
    console.log(`  Your NFTs: ${(await getUserBalance(contract, result.userAddress))}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

// ============ Example 6: NFT Transfer ============

/**
 * Example: Transfer claimed Pokemon NFT to another user
 */
export async function exampleTransferNFT() {
  console.log("\n🎮 EXAMPLE 6: Transfer NFT\n");

  const contractAddress = "0x...";
  const contractABI: any[] = [];
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
  const signer = provider.getSigner();

  try {
    const contract = initializeContract(contractAddress, contractABI, provider);

    // Transfer token ID 0 to another user
    const recipientAddress = "0x742d35Cc6634C0532925a3b844Bc172e3a0f77D8";
    const tokenId = BigInt(0);

    console.log(`Transferring token ${tokenId} to ${recipientAddress}...`);

    // Get current owner
    const currentOwner = await getTokenOwner(contract, tokenId);
    console.log(`Current owner: ${currentOwner}`);

    // Transfer NFT
    const success = await transferNFT(
      contract,
      signer,
      recipientAddress,
      tokenId
    );

    if (success) {
      // Verify transfer
      const newOwner = await getTokenOwner(contract, tokenId);
      console.log(`✅ Transfer successful!`);
      console.log(`New owner: ${newOwner}`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// ============ Example 7: Approve and List NFT ============

/**
 * Example: Approve marketplace to manage your NFT
 */
export async function exampleApproveMint() {
  console.log("\n🎮 EXAMPLE 7: Approve NFT for Marketplace\n");

  const contractAddress = "0x...";
  const contractABI: any[] = [];
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
  const signer = provider.getSigner();

  try {
    const contract = initializeContract(contractAddress, contractABI, provider);

    // Approve specific token to OpenSea marketplace
    const openSeaMarketplace = "0x1E0049783F008A0085193E00003D00cd54003c71";
    const tokenId = BigInt(0);

    console.log(`Approving OpenSea to manage token ${tokenId}...`);
    const success = await approveNFT(
      contract,
      signer,
      openSeaMarketplace,
      tokenId
    );

    if (success) {
      console.log(`✅ Approved! NFT can now be listed on OpenSea`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// ============ Example 8: Approve All NFTs ============

/**
 * Example: Give marketplace operator access to all your NFTs
 */
export async function exampleApproveAll() {
  console.log("\n🎮 EXAMPLE 8: Approve All NFTs\n");

  const contractAddress = "0x...";
  const contractABI: any[] = [];
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
  const signer = provider.getSigner();

  try {
    const contract = initializeContract(contractAddress, contractABI, provider);

    // Approve OpenSea marketplace for all tokens
    const openSeaMarketplace = "0x1E0049783F008A0085193E00003D00cd54003c71";

    console.log(`Approving OpenSea for all your Pokemon NFTs...`);
    const success = await setApprovalForAll(
      contract,
      signer,
      openSeaMarketplace,
      true
    );

    if (success) {
      console.log(`✅ All NFTs approved! You can now list them on OpenSea`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// ============ Example 9: Monitor Contract Events ============

/**
 * Example: Listen to Pokemon claimed events
 */
export async function exampleListenToEvents() {
  console.log("\n🎮 EXAMPLE 9: Monitor Contract Events\n");

  const contractAddress = "0x...";
  const contractABI: any[] = [];
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

  try {
    const contract = initializeContract(contractAddress, contractABI, provider);

    console.log("Listening to PokemonClaimed events...\n");

    // Listen to Pokemon claimed events
    contract.on(
      "PokemonClaimed",
      (
        claimer: string,
        tokenId: bigint,
        pokemonId: bigint,
        name: string,
        isFirstClaim: boolean
      ) => {
        console.log(`🎁 Pokemon Claimed!`);
        console.log(`   Claimer: ${claimer}`);
        console.log(`   Token ID: ${tokenId}`);
        console.log(`   Pokemon: ${name} (#${pokemonId})`);
        console.log(`   First Claim: ${isFirstClaim}\n`);
      }
    );

    // Listen for Pokemon initialization
    contract.on(
      "PokemonInitialized",
      (pokemonId: bigint, name: string, pokemonType: string) => {
        console.log(`🆕 Pokemon Initialized!`);
        console.log(`   Pokemon: ${name} (#${pokemonId})`);
        console.log(`   Type: ${pokemonType}\n`);
      }
    );

    console.log("Listening... (Press Ctrl+C to stop)");
    // Keep listening
    await new Promise(() => {});
  } catch (error) {
    console.error("Error:", error);
  }
}

// ============ Example 10: Market Analysis ============

/**
 * Example: Analyze which Pokemon are most claimed
 */
export async function exampleMarketAnalysis() {
  console.log("\n🎮 EXAMPLE 10: Market Analysis\n");

  const contractAddress = "0x...";
  const contractABI: any[] = [];
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

  try {
    const contract = initializeContract(contractAddress, contractABI, provider);

    // Analyze first 25 Pokemon (Gen 1 starters and common Pokemon)
    const pokemonIds = Array.from({ length: 25 }, (_, i) => i + 1);

    console.log("Analyzing Pokemon popularity...\n");
    console.log("Pokemon          | Initialized | Total Claims");
    console.log("-".repeat(50));

    const results = [];

    for (const pokemonId of pokemonIds) {
      const status = await getPokemonStatus(contract, pokemonId);
      const pokemon = await getPokemonFromAPI(pokemonId);

      const initialized = status.isInitialized ? "✅" : "❌";
      results.push({
        pokemonId,
        name: pokemon.name,
        // @ts-ignore
        claims: status.totalClaims,
      });

      console.log(
        // @ts-ignore
        `${pokemon.name.padEnd(16)} | ${initialized} | ${status.totalClaims}`
      );
    }

    // Sort by claims
    const sorted = results.sort((a, b) => b.claims - a.claims);
    console.log("\n📊 Top Claimed Pokemon:");
    sorted.slice(0, 5).forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.name}: ${result.claims} claims`);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

// ============ Usage in React Component ============

/**
 * Example: React component using the pipeline
 */
export function PokemonClaimComponent() {
  const [pokemonId, setPokemonId] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);

  const handleClaim = async () => {
    setLoading(true);
    try {
      // Assuming you have these setup globally
      if (!window.ethereum) throw new Error("No wallet found");
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();
      const contract = initializeContract(
        process.env.CONTRACT_ADDRESS || "",
        [], // process.env.CONTRACT_ABI
        provider
      );

      const result = await completePipeline(contract, signer, pokemonId);
      setResult(result);
    } catch (error) {
      console.error("Error claiming Pokemon:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="number"
        value={pokemonId}
        onChange={(e) => setPokemonId(Number(e.target.value))}
        min={1}
        max={1025}
      />
      <button onClick={handleClaim} disabled={loading}>
        {loading ? "Claiming..." : "Claim Pokemon"}
      </button>

      {result && (
        <div>
          <h3>Success! 🎉</h3>
          <p>Pokemon: {result.pokemonData.name}</p>
          <p>Token ID: {result.claimResult.tokenId.toString()}</p>
          <p>Transaction: {result.claimResult.transactionHash}</p>
        </div>
      )}
    </div>
  );
}

// ============ Batch Operations Helper ============

/**
 * Helper: Claim specific Pokemon list efficiently
 */
export async function claimPokemonCollection(
  contract: Contract,
  signer: Signer,
  pokemonNames: string[]
): Promise<any[]> {
  // Map common names to IDs
  const pokemonMap: { [key: string]: number } = {
    bulbasaur: 1,
    charmander: 4,
    squirtle: 7,
    pikachu: 25,
    jigglypuff: 39,
    vulpix: 37,
    oddish: 69,
    poliwag: 60,
  };

  const pokemonIds = pokemonNames
    .map((name) => pokemonMap[name.toLowerCase()])
    .filter((id) => id !== undefined);

  return claimMultiplePokemon(contract, signer, pokemonIds);
}
