/**
 * Pokemon NFT Contract Interaction - Complete Pipeline
 * TypeScript functions for Ethers.js v5
 * 
 * This module provides end-to-end functionality for:
 * 1. Fetching Pokemon data from PokeAPI
 * 2. Checking Pokemon initialization status
 * 3. Claiming Pokemon NFTs
 * 4. Managing NFT transfers and approvals
 * 5. Querying contract state
 */

import {
  Contract,
  ContractTransaction,
  Signer
} from "ethers";

// ============ Type Definitions ============

export interface PokemonData {
  pokemonId: number;
  name: string;
  pokemonType: string;
  imageUrl: string;
  description: string;
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
  abilities: string[];
}

export interface PokemonNFTStruct {
  pokemonId: bigint;
  name: string;
  pokemonType: string;
  imageUrl: string;
  description: string;
  hp: bigint;
  attack: bigint;
  defense: bigint;
  spAtk: bigint;
  spDef: bigint;
  speed: bigint;
  abilities: string[];
}

export interface ClaimResult {
  success: boolean;
  tokenId?: bigint;
  transactionHash?: string;
  isFirstClaim?: boolean;
  error?: string;
}

export interface PokemonStatus {
  isInitialized: boolean;
  totalClaims: number;
  metadata?: PokemonNFTStruct;
}

// ============ PokeAPI Data Fetching ============

/**
 * Fetch Pokemon data from PokeAPI
 * @param pokemonId - The Pokemon ID (1-9999)
 * @returns Promise<PokemonData> - Complete Pokemon data
 */
export async function getPokemonFromAPI(
  pokemonId: number
): Promise<PokemonData> {
  try {
    console.log(`Fetching Pokemon #${pokemonId} from PokeAPI...`);

    const pokemonResponse = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
    );
    if (!pokemonResponse.ok) {
      throw new Error(`Pokemon #${pokemonId} not found`);
    }

    const pokemonData = await pokemonResponse.json();

    // Fetch species data for description
    const speciesResponse = await fetch(pokemonData.species.url);
    const speciesData = await speciesResponse.json();

    // Extract flavor text (description)
    const flavorTextEntry = speciesData.flavor_text_entries.find(
      (entry: any) => entry.language.name === "en"
    );
    const description = flavorTextEntry?.flavor_text || "No description available";

    // Extract types
    const types = pokemonData.types
      .map((typeInfo: any) => 
        typeInfo.type.name.charAt(0).toUpperCase() + 
        typeInfo.type.name.slice(1)
      )
      .join("/");

    // Extract stats (order: hp, attack, defense, sp-atk, sp-def, speed)
    const stats = pokemonData.stats.reduce(
      (acc: any, stat: any, index: number) => {
        const statNames = ["hp", "attack", "defense", "spAtk", "spDef", "speed"];
        acc[statNames[index]] = stat.base_stat;
        return acc;
      },
      {}
    );

    // Extract abilities
    const abilities = pokemonData.abilities
      .filter((ability: any) => !ability.is_hidden)
      .slice(0, 4)
      .map((ability: any) => 
        ability.ability.name.charAt(0).toUpperCase() + 
        ability.ability.name.slice(1)
      );

    // Get official artwork image
    const imageUrl =
      pokemonData.sprites.other?.["official-artwork"]?.front_default ||
      pokemonData.sprites.front_default ||
      "";

    const result: PokemonData = {
      pokemonId: pokemonData.id,
      name: pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1),
      pokemonType: types,
      imageUrl,
      description: description.replace(/\f/g, " ").trim(),
      hp: stats.hp,
      attack: stats.attack,
      defense: stats.defense,
      spAtk: stats.spAtk,
      spDef: stats.spDef,
      speed: stats.speed,
      abilities,
    };

    console.log(`✅ Successfully fetched ${result.name}`);
    return result;
  } catch (error) {
    console.error(`❌ Error fetching Pokemon #${pokemonId}:`, error);
    throw error;
  }
}

/**
 * Batch fetch multiple Pokemon
 * @param pokemonIds - Array of Pokemon IDs
 * @returns Promise<PokemonData[]> - Array of Pokemon data
 */
export async function getPokemonBatch(
  pokemonIds: number[]
): Promise<PokemonData[]> {
  console.log(`Fetching ${pokemonIds.length} Pokemon...`);

  const promises = pokemonIds.map((id) => getPokemonFromAPI(id));
  const results = await Promise.allSettled(promises);

  const successfulResults: PokemonData[] = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      successfulResults.push(result.value);
    } else {
      console.error(`Failed to fetch Pokemon #${pokemonIds[index]}`);
    }
  });

  return successfulResults;
}

// ============ Contract Querying Functions ============

/**
 * Check if a Pokemon has been initialized
 * @param contract - The contract instance
 * @param pokemonId - Pokemon ID to check
 * @returns Promise<boolean> - True if initialized
 */
export async function isPokemonInitialized(
  contract: Contract,
  pokemonId: number
): Promise<boolean> {
  try {
    const result = await contract.isPokemonInitialized(pokemonId);
    console.log(`Pokemon #${pokemonId} initialized: ${result}`);
    return result;
  } catch (error) {
    console.error(`Error checking Pokemon initialization:`, error);
    throw error;
  }
}

/**
 * Get total claims for a Pokemon
 * @param contract - The contract instance
 * @param pokemonId - Pokemon ID
 * @returns Promise<number> - Total claims count
 */
export async function getTotalClaims(
  contract: Contract,
  pokemonId: number
): Promise<number> {
  try {
    const claims = await contract.getTotalClaims(pokemonId);
    console.log(`Pokemon #${pokemonId} total claims: ${claims.toString()}`);
    return Number(claims);
  } catch (error) {
    console.error(`Error getting total claims:`, error);
    throw error;
  }
}

/**
 * Get Pokemon metadata from contract
 * @param contract - The contract instance
 * @param pokemonId - Pokemon ID
 * @returns Promise<PokemonNFTStruct> - Pokemon metadata
 */
export async function getPokemonMetadata(
  contract: Contract,
  pokemonId: number
): Promise<PokemonNFTStruct> {
  try {
    const metadata = await contract.getPokemonMetadata(pokemonId);
    console.log(`Retrieved metadata for Pokemon #${pokemonId}`);
    return metadata;
  } catch (error) {
    console.error(`Error getting Pokemon metadata:`, error);
    throw error;
  }
}

/**
 * Get complete Pokemon status
 * @param contract - The contract instance
 * @param pokemonId - Pokemon ID
 * @returns Promise<PokemonStatus> - Full status including initialization and claims
 */
export async function getPokemonStatus(
  contract: Contract,
  pokemonId: number
): Promise<PokemonStatus> {
  try {
    const isInitialized = await contract.isPokemonInitialized(pokemonId);
    const totalClaims = await contract.getTotalClaims(pokemonId);

    let metadata: PokemonNFTStruct | undefined;
    if (isInitialized) {
      metadata = await contract.getPokemonMetadata(pokemonId);
    }

    return {
      isInitialized,
      totalClaims: Number(totalClaims),
      metadata,
    };
  } catch (error) {
    console.error(`Error getting Pokemon status:`, error);
    throw error;
  }
}

/**
 * Check if user has claimed a Pokemon
 * @param contract - The contract instance
 * @param userAddress - User wallet address
 * @param pokemonId - Pokemon ID
 * @returns Promise<boolean> - True if user claimed this Pokemon
 */
export async function hasUserClaimed(
  contract: Contract,
  userAddress: string,
  pokemonId: number
): Promise<boolean> {
  try {
    const claimed = await contract.hasClaimed(userAddress, pokemonId);
    console.log(
      `User ${userAddress} claimed Pokemon #${pokemonId}: ${claimed}`
    );
    return claimed;
  } catch (error) {
    console.error(`Error checking claim status:`, error);
    throw error;
  }
}

/**
 * Get total NFTs minted from contract
 * @param contract - The contract instance
 * @returns Promise<number> - Total minted tokens
 */
export async function getTotalMinted(contract: Contract): Promise<number> {
  try {
    const total = await contract.getTotalMinted();
    console.log(`Total Pokemon NFTs minted: ${total.toString()}`);
    return Number(total);
  } catch (error) {
    console.error(`Error getting total minted:`, error);
    throw error;
  }
}

/**
 * Get user's NFT balance
 * @param contract - The contract instance
 * @param userAddress - User wallet address
 * @returns Promise<number> - Number of NFTs owned
 */
export async function getUserBalance(
  contract: Contract,
  userAddress: string
): Promise<number> {
  try {
    const balance = await contract.balanceOf(userAddress);
    console.log(`User ${userAddress} owns ${balance.toString()} NFTs`);
    return Number(balance);
  } catch (error) {
    console.error(`Error getting user balance:`, error);
    throw error;
  }
}

// ============ Claiming Functions ============

/**
 * Claim a Pokemon NFT
 * @param contract - The contract instance
 * @param signer - The signer (user's wallet)
 * @param pokemonData - Pokemon data to pass to contract
 * @returns Promise<ClaimResult> - Claim result with token ID
 */
export async function claimPokemon(
  contract: Contract,
  signer: Signer,
  pokemonData: PokemonData
): Promise<ClaimResult> {
  try {
    console.log(
      `\n🎯 Claiming Pokemon: ${pokemonData.name} (ID: ${pokemonData.pokemonId})`
    );

    // Prepare the Pokemon struct for the contract
    const pokemonStruct = {
      pokemonId: pokemonData.pokemonId,
      name: pokemonData.name,
      pokemonType: pokemonData.pokemonType,
      imageUrl: pokemonData.imageUrl,
      description: pokemonData.description,
      hp: pokemonData.hp,
      attack: pokemonData.attack,
      defense: pokemonData.defense,
      spAtk: pokemonData.spAtk,
      spDef: pokemonData.spDef,
      speed: pokemonData.speed,
      abilities: pokemonData.abilities,
    };

    // Get contract with signer
    const contractWithSigner = contract.connect(signer) as Contract;

    // Check if Pokemon is already initialized
    const isInitialized = await contract.isPokemonInitialized(
      pokemonData.pokemonId
    );
    console.log(
      `Pokemon initialization status: ${isInitialized ? "Already initialized ✅" : "First claim 🆕"}`
    );

    // Call claimPokemon function
    console.log(`📤 Sending claim transaction...`);
    const tx: ContractTransaction | null = 
      await contractWithSigner.claimPokemon(
        pokemonData.pokemonId,
        pokemonStruct
      );

    if (!tx) {
      throw new Error("Transaction failed");
    }

    console.log(`📍 Transaction hash: ${tx.hash}`);
    console.log(`⏳ Waiting for confirmation...`);

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error("Receipt not found");
    }

    console.log(`✅ Transaction confirmed!`);

    // Extract token ID from event logs
    let tokenId: bigint | null = null;
    let isFirstClaim = false;

    // Look for PokemonClaimed event
    const pokemonClaimedEvent = receipt.logs
      .map((log) => {
        try {
          return contract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((event) => event?.name === "PokemonClaimed");

    if (pokemonClaimedEvent) {
      tokenId = pokemonClaimedEvent.args[1]; // tokenId is second argument
      isFirstClaim = pokemonClaimedEvent.args[4]; // isFirstClaim is fifth argument
      console.log(
        `🎁 Received NFT Token ID: ${tokenId!.toString()} ${
          isFirstClaim ? "(First claim!)" : ""
        }`
      );
    }

    return {
      success: true,
      tokenId: tokenId || undefined,
      transactionHash: tx.hash,
      isFirstClaim,
    };
  } catch (error) {
    console.error(`❌ Error claiming Pokemon:`, error);
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Claim multiple Pokemon sequentially
 * @param contract - The contract instance
 * @param signer - The signer
 * @param pokemonIds - Array of Pokemon IDs to claim
 * @returns Promise<ClaimResult[]> - Array of claim results
 */
export async function claimMultiplePokemon(
  contract: Contract,
  signer: Signer,
  pokemonIds: number[]
): Promise<ClaimResult[]> {
  console.log(`\n🎯 Claiming ${pokemonIds.length} Pokemon...`);

  const results: ClaimResult[] = [];

  for (const pokemonId of pokemonIds) {
    try {
      // Fetch Pokemon data
      const pokemonData = await getPokemonFromAPI(pokemonId);

      // Claim the Pokemon
      const result = await claimPokemon(contract, signer, pokemonData);
      results.push(result);

      // Small delay between claims to avoid rate limiting
      if (pokemonIds.indexOf(pokemonId) < pokemonIds.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error claiming Pokemon #${pokemonId}:`, error);
      results.push({
        success: false,
        error: String(error),
      });
    }
  }

  console.log(
    `\n📊 Claim Summary: ${results.filter((r) => r.success).length}/${
      pokemonIds.length
    } successful`
  );
  return results;
}

// ============ NFT Management Functions ============

/**
 * Approve an address to transfer an NFT
 * @param contract - The contract instance
 * @param signer - The signer (token owner)
 * @param approvedAddress - Address to approve
 * @param tokenId - Token ID to approve
 * @returns Promise<boolean> - Success status
 */
export async function approveNFT(
  contract: Contract,
  signer: Signer,
  approvedAddress: string,
  tokenId: bigint
): Promise<boolean> {
  try {
    console.log(`Approving ${approvedAddress} to transfer token ${tokenId}...`);

    const contractWithSigner = contract.connect(signer) as Contract;
    const tx = await contractWithSigner.approve(approvedAddress, tokenId);

    console.log(`📍 Approval transaction: ${tx.hash}`);
    await tx.wait();
    console.log(`✅ Approval confirmed`);

    return true;
  } catch (error) {
    console.error(`Error approving NFT:`, error);
    throw error;
  }
}

/**
 * Approve all NFTs for a spender
 * @param contract - The contract instance
 * @param signer - The signer (token owner)
 * @param spenderAddress - Spender address
 * @param approved - True to approve, false to revoke
 * @returns Promise<boolean> - Success status
 */
export async function setApprovalForAll(
  contract: Contract,
  signer: Signer,
  spenderAddress: string,
  approved: boolean = true
): Promise<boolean> {
  try {
    console.log(
      `${approved ? "Approving" : "Revoking"} all NFTs for ${spenderAddress}...`
    );

    const contractWithSigner = contract.connect(signer) as Contract;
    const tx = await contractWithSigner.setApprovalForAll(
      spenderAddress,
      approved
    );

    console.log(`📍 Approval transaction: ${tx.hash}`);
    await tx.wait();
    console.log(`✅ Approval confirmed`);

    return true;
  } catch (error) {
    console.error(`Error setting approval for all:`, error);
    throw error;
  }
}

/**
 * Check if an address is approved to transfer a token
 * @param contract - The contract instance
 * @param tokenId - Token ID to check
 * @returns Promise<string> - Approved address
 */
export async function getApprovedAddress(
  contract: Contract,
  tokenId: bigint
): Promise<string> {
  try {
    const approved = await contract.getApproved(tokenId);
    console.log(`Approved address for token ${tokenId}: ${approved}`);
    return approved;
  } catch (error) {
    console.error(`Error getting approved address:`, error);
    throw error;
  }
}

/**
 * Transfer an NFT to another address
 * @param contract - The contract instance
 * @param signer - The signer (token owner)
 * @param toAddress - Recipient address
 * @param tokenId - Token ID to transfer
 * @returns Promise<boolean> - Success status
 */
export async function transferNFT(
  contract: Contract,
  signer: Signer,
  toAddress: string,
  tokenId: bigint
): Promise<boolean> {
  try {
    console.log(`Transferring token ${tokenId} to ${toAddress}...`);

    const fromAddress = await signer.getAddress();
    const contractWithSigner = contract.connect(signer) as Contract;

    const tx = await contractWithSigner.transferFrom(
      fromAddress,
      toAddress,
      tokenId
    );

    console.log(`📍 Transfer transaction: ${tx.hash}`);
    await tx.wait();
    console.log(`✅ Transfer confirmed`);

    return true;
  } catch (error) {
    console.error(`Error transferring NFT:`, error);
    throw error;
  }
}

/**
 * Safe transfer an NFT (with data parameter)
 * @param contract - The contract instance
 * @param signer - The signer (token owner)
 * @param toAddress - Recipient address
 * @param tokenId - Token ID to transfer
 * @param data - Optional data to send with transfer
 * @returns Promise<boolean> - Success status
 */
export async function safeTransferNFT(
  contract: Contract,
  signer: Signer,
  toAddress: string,
  tokenId: bigint,
  data: string = "0x"
): Promise<boolean> {
  try {
    console.log(`Safe transferring token ${tokenId} to ${toAddress}...`);

    const fromAddress = await signer.getAddress();
    const contractWithSigner = contract.connect(signer) as Contract;

    const tx = await contractWithSigner.safeTransferFrom(
      fromAddress,
      toAddress,
      tokenId,
      data
    );

    console.log(`📍 Safe transfer transaction: ${tx.hash}`);
    await tx.wait();
    console.log(`✅ Safe transfer confirmed`);

    return true;
  } catch (error) {
    console.error(`Error safe transferring NFT:`, error);
    throw error;
  }
}

/**
 * Get the owner of a token
 * @param contract - The contract instance
 * @param tokenId - Token ID
 * @returns Promise<string> - Owner address
 */
export async function getTokenOwner(
  contract: Contract,
  tokenId: bigint
): Promise<string> {
  try {
    const owner = await contract.ownerOf(tokenId);
    console.log(`Owner of token ${tokenId}: ${owner}`);
    return owner;
  } catch (error) {
    console.error(`Error getting token owner:`, error);
    throw error;
  }
}

/**
 * Get token URI (metadata)
 * @param contract - The contract instance
 * @param tokenId - Token ID
 * @returns Promise<string> - Token URI
 */
export async function getTokenURI(
  contract: Contract,
  tokenId: bigint
): Promise<string> {
  try {
    const uri = await contract.tokenURI(tokenId);
    console.log(`Token URI for ${tokenId}:`);
    return uri;
  } catch (error) {
    console.error(`Error getting token URI:`, error);
    throw error;
  }
}

// ============ Complete Pipeline Function ============

/**
 * Full pipeline: Fetch, check status, and claim Pokemon
 * @param contract - The contract instance
 * @param signer - The signer
 * @param pokemonId - Pokemon ID to claim
 * @returns Promise<any> - Complete result object
 */
export async function completePipeline(
  contract: Contract,
  signer: Signer,
  pokemonId: number
): Promise<any> {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 POKEMON NFT CLAIMING PIPELINE");
  console.log("=".repeat(60));

  try {
    // Step 1: Fetch Pokemon data from API
    console.log("\n📍 STEP 1: Fetching Pokemon Data from PokeAPI");
    console.log("-".repeat(60));
    const pokemonData = await getPokemonFromAPI(pokemonId);
    console.log(`Name: ${pokemonData.name}`);
    console.log(`Type: ${pokemonData.pokemonType}`);
    console.log(`Stats: HP=${pokemonData.hp}, ATK=${pokemonData.attack}, DEF=${pokemonData.defense}`);
    console.log(`Abilities: ${pokemonData.abilities.join(", ")}`);

    // Step 2: Check if Pokemon is initialized
    console.log("\n📍 STEP 2: Checking Pokemon Initialization Status");
    console.log("-".repeat(60));
    const status = await getPokemonStatus(contract, pokemonId);
    console.log(`Initialized: ${status.isInitialized}`);
    // @ts-ignore
    console.log(`Total claims: ${status.totalClaims}`);

    // Step 3: Check if user has claimed
    console.log("\n📍 STEP 3: Checking User Claim Status");
    console.log("-".repeat(60));
    const userAddress = await signer.getAddress();
    const userBalance = await getUserBalance(contract, userAddress);
    console.log(`User: ${userAddress}`);
    console.log(`NFTs owned: ${userBalance}`);
    const hasClaimed = await hasUserClaimed(contract, userAddress, pokemonId);
    console.log(`Has claimed this Pokemon: ${hasClaimed}`);

    // Step 4: Claim the Pokemon
    console.log("\n📍 STEP 4: Claiming Pokemon NFT");
    console.log("-".repeat(60));
    const claimResult = await claimPokemon(contract, signer, pokemonData);

    if (!claimResult.success) {
      throw new Error(claimResult.error);
    }

    // Step 5: Verify the claim
    console.log("\n📍 STEP 5: Verifying Claim");
    console.log("-".repeat(60));
    const newBalance = await getUserBalance(contract, userAddress);
    console.log(`NFTs after claim: ${newBalance}`);
    const tokenOwner = await getTokenOwner(contract, claimResult.tokenId!);
    console.log(`Token ${claimResult.tokenId} owner: ${tokenOwner}`);

    // Step 6: Get token metadata
    console.log("\n📍 STEP 6: Retrieving Token Metadata");
    console.log("-".repeat(60));
    const tokenUri = await getTokenURI(contract, claimResult.tokenId!);
    console.log(`Token URI (first 100 chars): ${tokenUri.substring(0, 100)}...`);

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ PIPELINE COMPLETE");
    console.log("=".repeat(60));
    console.log(`Token ID: ${claimResult.tokenId}`);
    console.log(`Transaction: ${claimResult.transactionHash}`);
    console.log(`First Claim: ${claimResult.isFirstClaim}`);

    return {
      pokemonData,
      status,
      userAddress,
      claimResult,
      tokenUri,
      success: true,
    };
  } catch (error) {
    console.error("\n❌ Pipeline failed:", error);
    throw error;
  }
}
