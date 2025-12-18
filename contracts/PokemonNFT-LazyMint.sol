// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title PokemonNFT
 * @notice A Solidity contract for creating Pokemon NFTs with unlimited copies
 * @dev Lazy minting: First claim generates metadata, subsequent claims mint copies
 */

contract PokemonNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    // ============ Data Structures ============
    
    /**
     * @notice Struct to store Pokemon attributes
     * @dev All data is stored on-chain for immutability and decentralization
     */
    struct Pokemon {
        uint256 pokemonId;           // Unique Pokemon ID (e.g., 1 for Bulbasaur)
        string name;                  // Pokemon name
        string pokemonType;           // Pokemon type (e.g., "Grass/Poison")
        string imageUrl;              // IPFS or data URI for the image
        string description;           // Pokemon description
        uint256 hp;                   // Hit Points stat
        uint256 attack;               // Attack stat
        uint256 defense;              // Defense stat
        uint256 spAtk;                // Special Attack stat
        uint256 spDef;                // Special Defense stat
        uint256 speed;                // Speed stat
        string[] abilities;           // Array of abilities
    }
    
    // ============ State Variables ============
    
    Counters.Counter private _tokenIdCounter;
    
    // Mapping from pokemonId to whether it has been created/initialized
    mapping(uint256 => bool) public pokemonExists;
    
    // Mapping from pokemonId to the Pokemon metadata (template)
    mapping(uint256 => Pokemon) public pokemonMetadata;
    
    // Mapping from pokemonId to the token URI (stored once, reused for all copies)
    mapping(uint256 => string) public pokemonURIs;
    
    // Track which Pokemon each user has claimed (for reference, not enforcement)
    mapping(address => mapping(uint256 => bool)) public userClaimedPokemon;
    
    // Track total claims per Pokemon
    mapping(uint256 => uint256) public totalClaimsPerPokemon;
    
    // Maximum supply - set this as needed
    uint256 public constant MAX_SUPPLY = 1000000; // 1 million max tokens total
    
    // ============ Events ============
    
    event PokemonInitialized(
        uint256 indexed pokemonId,
        string name,
        string pokemonType
    );
    
    event PokemonClaimed(
        address indexed claimer,
        uint256 indexed tokenId,
        uint256 indexed pokemonId,
        string name,
        bool isFirstClaim
    );
    
    event PokemonMetadataUpdated(
        uint256 indexed pokemonId,
        string name
    );
    
    // ============ Constructor ============
    
    constructor() ERC721("Pokemon NFT", "PKNFT") {}
    
    // ============ Public Functions ============
    
    /**
     * @notice Allows a user to claim a Pokemon NFT
     * @dev First claim initializes the Pokemon metadata, subsequent claims mint copies
     * @param _pokemonId The ID of the Pokemon to claim
     * @param _pokemon The Pokemon struct containing all attributes (required only on first claim)
     * @return tokenId The ID of the newly minted NFT
     */
    function claimPokemon(
        uint256 _pokemonId,
        Pokemon memory _pokemon
    ) public returns (uint256) {
        require(_tokenIdCounter.current() < MAX_SUPPLY, "Max supply reached");
        require(_pokemon.pokemonId == _pokemonId, "Pokemon ID mismatch");
        
        bool isFirstClaim = false;
        
        // If this Pokemon hasn't been created yet, initialize it
        if (!pokemonExists[_pokemonId]) {
            _initializePokemon(_pokemonId, _pokemon);
            isFirstClaim = true;
        }
        
        // Mark that this user has claimed this Pokemon
        userClaimedPokemon[msg.sender][_pokemonId] = true;
        totalClaimsPerPokemon[_pokemonId]++;
        
        // Mint the NFT to the user
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(msg.sender, tokenId);
        
        // Set the token URI to the pre-generated metadata
        _setTokenURI(tokenId, pokemonURIs[_pokemonId]);
        
        emit PokemonClaimed(msg.sender, tokenId, _pokemonId, pokemonMetadata[_pokemonId].name, isFirstClaim);
        
        return tokenId;
    }
    
    /**
     * @notice Internal function to initialize a Pokemon for the first time
     * @param _pokemonId The Pokemon ID
     * @param _pokemon The Pokemon struct with all attributes
     */
    function _initializePokemon(uint256 _pokemonId, Pokemon memory _pokemon) internal {
        require(bytes(_pokemon.name).length > 0, "Name cannot be empty");
        require(bytes(_pokemon.pokemonType).length > 0, "Type cannot be empty");
        require(bytes(_pokemon.imageUrl).length > 0, "Image URL cannot be empty");
        
        // Store the Pokemon metadata template
        pokemonMetadata[_pokemonId] = _pokemon;
        pokemonExists[_pokemonId] = true;
        
        // Generate the metadata URI once and store it
        string memory metadataURI = generateMetadataURI(_pokemon);
        pokemonURIs[_pokemonId] = metadataURI;
        
        emit PokemonInitialized(_pokemonId, _pokemon.name, _pokemon.pokemonType);
    }
    
    /**
     * @notice Generate on-chain JSON metadata with base64 encoding
     * @param _pokemon The Pokemon struct
     * @return The complete metadata URI as a data URL
     */
    function generateMetadataURI(Pokemon memory _pokemon) 
        public 
        pure 
        returns (string memory) 
    {
        // Build the JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name": "',
            _pokemon.name,
            '", "description": "',
            _pokemon.description,
            '", "image": "',
            _pokemon.imageUrl,
            '", "attributes": [',
            '{"trait_type": "Type", "value": "',
            _pokemon.pokemonType,
            '"},',
            '{"trait_type": "HP", "value": ',
            uintToString(_pokemon.hp),
            '},',
            '{"trait_type": "Attack", "value": ',
            uintToString(_pokemon.attack),
            '},',
            '{"trait_type": "Defense", "value": ',
            uintToString(_pokemon.defense),
            '},',
            '{"trait_type": "Special Attack", "value": ',
            uintToString(_pokemon.spAtk),
            '},',
            '{"trait_type": "Special Defense", "value": ',
            uintToString(_pokemon.spDef),
            '},',
            '{"trait_type": "Speed", "value": ',
            uintToString(_pokemon.speed),
            '},',
            '{"trait_type": "Abilities", "value": "',
            arrayToString(_pokemon.abilities),
            '"}',
            ']}'
        ));
        
        // Encode to base64 and create data URI
        return string(abi.encodePacked(
            'data:application/json;base64,',
            base64Encode(bytes(json))
        ));
    }
    
    /**
     * @notice Get Pokemon metadata for a specific Pokemon ID
     * @param _pokemonId The Pokemon ID
     * @return The Pokemon struct associated with that ID
     */
    function getPokemonMetadata(uint256 _pokemonId) 
        public 
        view 
        returns (Pokemon memory) 
    {
        require(pokemonExists[_pokemonId], "Pokemon does not exist");
        return pokemonMetadata[_pokemonId];
    }
    
    /**
     * @notice Check if a Pokemon has been initialized (first claimed)
     * @param _pokemonId The Pokemon ID
     * @return True if the Pokemon has been claimed at least once
     */
    function isPokemonInitialized(uint256 _pokemonId) 
        public 
        view 
        returns (bool) 
    {
        return pokemonExists[_pokemonId];
    }
    
    /**
     * @notice Check if a user has claimed a specific Pokemon
     * @param _user The user address
     * @param _pokemonId The Pokemon ID
     * @return True if the user has claimed this Pokemon
     */
    function hasClaimed(address _user, uint256 _pokemonId) 
        public 
        view 
        returns (bool) 
    {
        return userClaimedPokemon[_user][_pokemonId];
    }
    
    /**
     * @notice Get total number of NFTs minted
     * @return The current token counter
     */
    function getTotalMinted() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @notice Get total times a specific Pokemon has been claimed
     * @param _pokemonId The Pokemon ID
     * @return The number of times this Pokemon has been claimed
     */
    function getTotalClaims(uint256 _pokemonId) public view returns (uint256) {
        return totalClaimsPerPokemon[_pokemonId];
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Initialize a Pokemon without requiring a claim
     * @dev Only owner can call this to pre-load Pokemon data
     * @param _pokemonId The Pokemon ID
     * @param _pokemon The Pokemon struct
     */
    function initializePokemonAdmin(uint256 _pokemonId, Pokemon memory _pokemon) 
        public 
        onlyOwner 
    {
        require(!pokemonExists[_pokemonId], "Pokemon already initialized");
        _initializePokemon(_pokemonId, _pokemon);
    }
    
    /**
     * @notice Update Pokemon metadata (only owner)
     * @dev Updates the template metadata and regenerates URI
     * @param _pokemonId The Pokemon ID to update
     * @param _pokemon The updated Pokemon struct
     */
    function updatePokemonMetadata(uint256 _pokemonId, Pokemon memory _pokemon) 
        public 
        onlyOwner 
    {
        require(pokemonExists[_pokemonId], "Pokemon does not exist");
        
        pokemonMetadata[_pokemonId] = _pokemon;
        
        // Regenerate the URI
        string memory metadataURI = generateMetadataURI(_pokemon);
        pokemonURIs[_pokemonId] = metadataURI;
        
        emit PokemonMetadataUpdated(_pokemonId, _pokemon.name);
    }
    
    // ============ Internal Helper Functions ============
    
    /**
     * @notice Convert uint256 to string
     */
    function uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    /**
     * @notice Convert string array to comma-separated string
     */
    function arrayToString(string[] memory arr) internal pure returns (string memory) {
        if (arr.length == 0) {
            return "";
        }
        string memory result = arr[0];
        for (uint i = 1; i < arr.length; i++) {
            result = string(abi.encodePacked(result, ", ", arr[i]));
        }
        return result;
    }
    
    /**
     * @notice Base64 encode function
     */
    function base64Encode(bytes memory data) internal pure returns (string memory) {
        bytes memory TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        
        uint256 len = data.length;
        if (len == 0) return "";
        
        // multiply by 4/3 rounded up
        uint256 encodedLen = 4 * ((len + 2) / 3);
        
        bytes memory result = new bytes(encodedLen + 32);
        
        uint256 h;
        uint256 i = 0;
        uint256 j = 0;
        
        while (i < len) {
            h = (uint8(data[i]) << 16);
            if (i + 1 < len) {
                h |= uint256(uint8(data[i + 1])) << 8;
            }
            if (i + 2 < len) {
                h |= uint256(uint8(data[i + 2]));
            }
            
            result[j] = TABLE[h >> 18 & 0x3F];
            result[j + 1] = TABLE[h >> 12 & 0x3F];
            result[j + 2] = j + 2 < encodedLen ? TABLE[h >> 6 & 0x3F] : bytes1("=");
            result[j + 3] = j + 3 < encodedLen ? TABLE[h & 0x3F] : bytes1("=");
            
            i += 3;
            j += 4;
        }
        
        return string(result);
    }
    
    // ============ Required Overrides ============
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }
}
