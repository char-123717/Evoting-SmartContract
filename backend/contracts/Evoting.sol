// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// ==========================================
// Smart Contract: Evoting
// ==========================================
// This contract handles the core logic of the voting system.
// It stores candidates, voters, and vote history on the blockchain.
contract Evoting {

    // --- State Variables ---
    // 'owner' is the address of the person who deployed the contract (Admin).
    address public owner;
    
    // Flags to control the voting process status.
    bool public votingStart;
    bool public votingEnd;
    
    // Flag to control visibility of vote counts (Admin only).
    // When true, vote counts are hidden until voting ends.
    bool public hideVotes;

    // --- Events ---
    event OwnershipClaimed(address indexed newOwner);

    // --- Constructor ---
    // Runs only once when the contract is deployed.
    constructor () {
        owner = address(0);  // Initially no owner. First to claim becomes admin.
        votingStart = false; // Voting is initially stopped.
        votingEnd = false;   // Voting has not ended yet.
        hideVotes = false;   // Votes are visible by default.
    }

    // --- Ownership Management ---
    // Allows the first user to claim ownership of the contract.
    function claimOwnership() public {
        require(owner == address(0), "Owner already set");
        owner = msg.sender;
        emit OwnershipClaimed(msg.sender);
    }

    // --- Structs ---
    // Defines the structure of a Candidate.
    struct data_candidate {
        address addr_candidate; // Wallet address of the candidate.
        uint num_votes;         // Total votes received.
    }

    // Defines the structure of a Vote Record (for history).
    struct VoteRecord {
        address voter;      // Who voted.
        address candidate;  // Who they voted for.
        uint256 timestamp;  // When they voted (block timestamp).
    }

    // --- Storage ---
    // Array to store all candidates.
    data_candidate[] public candidate;
    
    // Array to store the history of all votes.
    VoteRecord[] public voteHistory;

    // Mappings to store status efficiently.
    mapping(address => bool) public regis_candidate; // Checks if an address is already a candidate.
    mapping(address => bool) public participant_vote; // Checks if a voter has already voted.
    mapping(address => bool) public whitelist;        // List of allowed voters.

    // --- Functions ---

    // Function 1: Register a Voter
    // Only the 'owner' can call this to allow an address to vote.
    function registerVoter(address _voter) public {
        require(msg.sender == owner, "Only owner can register voters");
        require(_voter != owner, "Owner cannot be registered as voter"); // Owner usually acts as admin, not voter.
        require(!votingEnd, "Voting has ended");
        require(!whitelist[_voter], "Voter already registered"); // Prevent duplicate registration.
        
        whitelist[_voter] = true; // Mark address as whitelisted.
    }

    // Helper: Check if a voter is registered.
    function isVoterRegistered(address _voter) public view returns (bool) {
        return whitelist[_voter];
    }

    // Function 2: Add a Candidate
    // Only owner can add candidates, and only before voting starts.
    function AddCandidate (address _adrs) public {
        require(msg.sender==owner,"You aren't the owner, Only owner has the right to add candidates");
        require(!votingStart,"Owner was not allowed to add candidates during voting started");
        require(!votingEnd,"Voting has ended");
        require(!regis_candidate[_adrs],"The candidate has been added");
        
        // Push new candidate with 0 votes.
        candidate.push(data_candidate(_adrs,0));
        regis_candidate[_adrs]=true; // Mark address as a registered candidate.
    }

    // Function 3: Start Voting
    // Changes the state to allow voting. Needs at least 2 candidates.
    function VotingStart () public {
        require(msg.sender==owner,"You aren't the owner, Only owner has the right to initiate the voting");
        require(candidate.length >= 2, "Candidates must be more than one or at least two to start the voting");
        require(!votingStart, "Voting has started");
        require(!votingEnd, "Voting has ended and cannot be restarted");
        
        votingStart = true;
    }

    // Function 4: End Voting
    // Stops the voting process.
    function VotingEnd() public {
        require (msg.sender == owner,"You aren't the owner, Only owner has the right to initiate the voting");
        require(votingStart, "No voting is on going");
        
        votingEnd = true;
        votingStart = false;
    }

    // Function 4.5: Toggle Hide Votes
    // Allows owner to show/hide vote counts during active voting.
    function toggleHideVotes() public {
        require(msg.sender == owner, "Only owner can toggle hide votes");
        hideVotes = !hideVotes;
    }

    // Function 5: Cast a Vote
    // The main function for users.
    function Vote (uint _indexCandidate) public {
        require (votingStart,"Voting has not started or Voting has ended");
        require (msg.sender!=owner,"Owner has no right to vote");
        require (whitelist[msg.sender], "You are not registered to vote"); // Must be whitelisted.
        require (_indexCandidate < candidate.length,"Candidate not found");
        require (!participant_vote[msg.sender],"All voters are only allowed to vote once"); // One person, one vote.
        
        participant_vote[msg.sender] = true; // Mark voter as having voted.
        candidate[_indexCandidate].num_votes++; // Increment candidate's vote count.
        
        // Record the vote in history.
        voteHistory.push(VoteRecord({
            voter: msg.sender,
            candidate: candidate[_indexCandidate].addr_candidate,
            timestamp: block.timestamp
        }));
    }

    // Function 6: Determine Winner
    // Calculates who has the most votes. Returns an array (in case of ties) and the highest vote count.
    function Winner () public view returns(address[] memory, uint) {
        require (!votingStart,"Voting has not started");
        require (candidate.length >= 2,"Candidates must be more than one or at least two");
        require (votingEnd,"Voting is in progress"); // Can only see winner after voting ends.
        
        uint highestVote = 0;

        // Step A: Find the highest number of votes.
        for(uint i=0;i<candidate.length;i++) {
            if(candidate[i].num_votes > highestVote) {
                highestVote = candidate[i].num_votes;
            }
        }

        // Step B: Count how many candidates have that highest vote (to handle ties).
        uint winnerCount = 0;
        for(uint i=0;i<candidate.length;i++) {
            if(candidate[i].num_votes == highestVote) {
                winnerCount++;
            }
        }

        // Step C: Create the result array.
        address[] memory winners = new address[](winnerCount);
        uint index = 0;
        for(uint i=0;i<candidate.length;i++) {
            if(candidate[i].num_votes == highestVote) {
                winners[index] = candidate[i].addr_candidate;
                index++;
            }
        }
        
        return (winners, highestVote);
    }

    // Helper: Get full list of candidates.
    function getAllCandidates() public view returns (data_candidate[] memory) {
        return candidate;
    }

    // Helper: Get full voting history.
    function getVoteHistory() public view returns (VoteRecord[] memory) {
        return voteHistory;
    }
}