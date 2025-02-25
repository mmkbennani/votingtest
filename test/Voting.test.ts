import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { Voting } from "../typechain-types"; // Import the Voting contract type
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Voting Contract", function () {
  let voting: Voting;
  let owner: HardhatEthersSigner;
  let voter1: HardhatEthersSigner;
  let voter2: HardhatEthersSigner;
  let nonVoter: HardhatEthersSigner;


  async function deployVotingFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, address1, address2, adresse3, adresse4] = await hre.ethers.getSigners();
    const Voting = await hre.ethers.getContractFactory("Voting");
    const hardhatVoting = await Voting.deploy();

    return { hardhatVoting, owner, address1, address2, adresse3, adresse4};
  }

  beforeEach(async function () {

    const fixture = await loadFixture(deployVotingFixture);

    voting = fixture.hardhatVoting;
    owner = fixture.owner;
    voter1 = fixture.address2;
    voter2 = fixture.adresse3;
    nonVoter = fixture.adresse4;
  });

  describe("Registration", function () {
    it("should allow the owner to register voters", async function () {
      await voting.addVoter(voter1.address);
      const voter = await voting.connect(voter1).getVoter(voter1.address);
      expect(voter.isRegistered).to.be.true;
    });

    it("should not allow non-owner to register voters", async function () {
      await expect(
        voting.connect(nonVoter).addVoter(voter1.address)
      ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount").withArgs(nonVoter.address);
    });

    it("should not allow duplicate registrations", async function () {
      await voting.addVoter(voter1.address);
      await expect(voting.addVoter(voter1.address)).to.be.revertedWith(
        "Already registered"
      );
    });

    it("should not allow registering voters when not in RegisteringVoters status", async function () {
      await voting.startProposalsRegistering();
      await expect(
        voting.addVoter(voter1.address)
      ).to.be.revertedWith("Voters registration is not open yet");
    });

    it("should revert when trying to start voting session before ending proposal registration", async function () {
      await expect(voting.startVotingSession()).to.be.revertedWith(
        "Registering proposals phase is not finished"
      );
    });
    
    it("should revert when trying to tally votes before ending voting session", async function () {
      await expect(voting.tallyVotes()).to.be.revertedWith(
        "Current status is not voting session ended"
      );
    });

    it("should not allow non-owners to start proposals registration", async function () {
      await expect(voting.connect(nonVoter).startProposalsRegistering())
        .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
        .withArgs(nonVoter.address);
    });
    

    it("should emit VoterRegistered when a voter is added", async function () {
      await expect(voting.addVoter(voter1.address))
        .to.emit(voting, "VoterRegistered")
        .withArgs(voter1.address);
    });

    it("shouldn't allow a non-voter to get one voter", async function () {
      await voting.addVoter(voter1.address);
      await expect( voting.connect(nonVoter).getVoter(voter1.address)).to.be.revertedWith("You're not a voter");
    });
  });

  describe("Proposals", function () {
    beforeEach(async function () {
      await voting.addVoter(voter1.address);
      await voting.addVoter(voter2.address);
      await voting.startProposalsRegistering();
    });

    it("should allow registered voters to add proposals", async function () {
      await voting.connect(voter1).addProposal("Proposal 1");
      const proposal = await voting.connect(voter1).getOneProposal(1);
      expect(proposal.description).to.equal("Proposal 1");
    });

    it("should not allow non-registered voters to add proposals", async function () {
      await expect(
        voting.connect(nonVoter).addProposal("Proposal 2")
      ).to.be.revertedWith("You're not a voter");
    });

    it("should not allow proposals before ProposalsRegistrationStarted", async function () {
      await voting.endProposalsRegistering();
      await expect(
        voting.connect(voter1).addProposal("Proposal 3")
      ).to.be.revertedWith("Proposals are not allowed yet");
    });

    it("should revert if a voter tries to vote when there are no proposals", async function () {
      await voting.endProposalsRegistering();
      await voting.startVotingSession();
      await expect(voting.connect(voter1).setVote(1)).to.be.revertedWith("Proposal not found");
    });

    it("should revert if a non-voter tries to vote", async function () {
      await voting.endProposalsRegistering();
      await voting.startVotingSession();
      await expect(voting.connect(nonVoter).setVote(1)).to.be.revertedWith("You're not a voter");
    });

    it("should emit ProposalRegistered when a proposal is added", async function () {
      await expect(voting.connect(voter1).addProposal("New Proposal"))
        .to.emit(voting, "ProposalRegistered")
        .withArgs(1); // Assuming 1 is the new proposal ID
    });

    it("should revert when adding an empty proposal", async function () {
      await expect(voting.connect(voter1).addProposal("")).to.be.revertedWith("Vous ne pouvez pas ne rien proposer");
    });

    it("should allow a voter to add multiple proposals", async function () {
      await voting.connect(voter1).addProposal("Proposal A");
      await voting.connect(voter1).addProposal("Proposal B");
      const proposalA = await voting.connect(voter1).getOneProposal(1);
      const proposalB = await voting.connect(voter1).getOneProposal(2);
      expect(proposalA.description).to.equal("Proposal A");
      expect(proposalB.description).to.equal("Proposal B");
    });

    it("shouldn't allow a non-voter to get one proposals", async function () {
      await voting.connect(voter1).addProposal("Proposal A");
      await expect( voting.connect(nonVoter).getOneProposal(1)).to.be.revertedWith("You're not a voter");
    });

    
  });

  describe("Voting", function () {
    beforeEach(async function () {
      await voting.connect(owner).addVoter(voter1.address);
      await voting.connect(owner).addVoter(voter2.address);
      await voting.startProposalsRegistering();
      await voting.connect(voter1).addProposal("Proposal 1");
      await voting.connect(voter2).addProposal("Proposal 2");
      await voting.endProposalsRegistering();
      await voting.startVotingSession();
    });

    it("should allow registered voters to vote", async function () {
      await voting.connect(voter1).setVote(0);
      const proposal = await voting.connect(voter1).getOneProposal(0);
      expect(proposal.voteCount).to.equal(1);
    });

    it("should not allow double voting", async function () {
      await voting.connect(voter1).setVote(0);
      await expect(voting.connect(voter1).setVote(1)).to.be.revertedWith(
        "You have already voted"
      );
    });

    it("should not allow voting before voting session starts", async function () {
      await voting.endVotingSession();
      await expect(voting.connect(voter1).setVote(0)).to.be.revertedWith(
        "Voting session havent started yet"
      );
    });

    it("should not allow voting for non-existing proposals", async function () {
      await expect(voting.connect(voter1).setVote(99)).to.be.revertedWith(
        "Proposal not found"
      );
    });

    it("should emit Voted event when a vote is cast", async function () {
      await voting.connect(voter1).setVote(0);
      await expect(voting.connect(voter2).setVote(1))
        .to.emit(voting, "Voted")
        .withArgs(voter2.address, 1);
    });

    it("should not allow non-owners to tally votes", async function () {
      await expect(voting.connect(nonVoter).tallyVotes())
        .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
        .withArgs(nonVoter.address);
    });


    it("should not allow tallying votes before voting session ends", async function () {
      await expect(voting.tallyVotes()).to.be.revertedWith(
        "Current status is not voting session ended"
      );
    });


    


    it("should tally votes correctly when no one has voted", async function () {
      await voting.endVotingSession();
      await expect(voting.tallyVotes()).to.not.be.reverted;
      const winningProposalId = await voting.winningProposalID();
      expect(winningProposalId).to.equal(0); // Default winner if no votes
    });

    it("should correctly handle a tie", async function () {
      await voting.connect(voter1).setVote(0);
      await voting.connect(voter2).setVote(1); // Equal votes on different proposals
      await voting.endVotingSession();
      await voting.tallyVotes();
      const winningProposalId = await voting.winningProposalID();
      expect(winningProposalId+"").to.be.oneOf(['0', '1']); // Should be one of the tied proposals
    });
  });

  describe("Voting with 3rd voters", function () {
    beforeEach(async function () {
      await voting.connect(owner).addVoter(voter1.address);
      await voting.connect(owner).addVoter(voter2.address);
      await voting.connect(owner).addVoter(nonVoter.address);
      await voting.startProposalsRegistering();
      await voting.connect(voter1).addProposal("Proposal 1");
      await voting.connect(voter2).addProposal("Proposal 2");
      await voting.endProposalsRegistering();
      await voting.startVotingSession();
    });
    it("should correctly determine the winning proposal", async function () {
      await voting.connect(voter1).setVote(0); // Proposal 0 gets 1 vote
      await voting.connect(voter2).setVote(1); // Proposal 1 gets 1 vote
      
      await voting.connect(nonVoter).setVote(1); // Proposal 1 gets 2 votes
    
      await voting.endVotingSession();
      await voting.tallyVotes();
    
      const winningProposal = await voting.winningProposalID();
      expect(winningProposal).to.equal(1); // Proposal 1 should win
    });
  });

  describe("Workflow Management", function () {
    it("should change workflow status correctly", async function () {
      await expect(voting.startProposalsRegistering()).to.emit(
        voting,
        "WorkflowStatusChange"
      ).withArgs(
        0, // RegisteringVoters
        1  // ProposalsRegistrationStarted
      );

      await voting.endProposalsRegistering();
      await expect(voting.startVotingSession()).to.emit(
        voting,
        "WorkflowStatusChange"
      ).withArgs(
        2, // ProposalsRegistrationEnded
        3  // VotingSessionStarted
      );
    });
  });


  describe("endVotingSession test", function () {
    beforeEach(async function () {
      await voting.connect(owner).addVoter(voter1.address);
      await voting.connect(owner).addVoter(voter2.address);
    });

    it("endVotingSession should revert with OwnableUnauthorizedAccount", async function () {
      await expect(voting.connect(nonVoter).endVotingSession())
        .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
        .withArgs(nonVoter.address);
    });

    it("endVotingSession should revert with Voting session havent started yet", async function () {
      await expect(voting.connect(owner).endVotingSession()).to.be.revertedWith(
        "Voting session havent started yet"
      );
    });
  });

  describe("startVotingSession test", function () {
    beforeEach(async function () {
      await voting.connect(owner).addVoter(voter1.address);
      await voting.connect(owner).addVoter(voter2.address);
      await voting.startProposalsRegistering();
      await voting.connect(voter1).addProposal("Proposal 1");
      await voting.connect(voter2).addProposal("Proposal 2");
      await voting.endProposalsRegistering();
    });

    it("startVotingSession should revert with OwnableUnauthorizedAccount", async function () {
      await expect(voting.connect(nonVoter).startVotingSession())
        .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
        .withArgs(nonVoter.address);
    });

    it("startVotingSession should revert with Voting session havent started yet", async function () {
      await expect(voting.connect(owner).endVotingSession()).to.be.revertedWith(
        "Voting session havent started yet"
      );
    });
  });

  describe("endProposalsRegistering test", function () {
    beforeEach(async function () {
      await voting.connect(owner).addVoter(voter1.address);
      await voting.connect(owner).addVoter(voter2.address);
      
    });

    it("endProposalsRegistering should revert with OwnableUnauthorizedAccount", async function () {
      await voting.startProposalsRegistering();
      await voting.connect(voter1).addProposal("Proposal 1");
      await voting.connect(voter2).addProposal("Proposal 2");
      await expect(voting.connect(nonVoter).endProposalsRegistering())
        .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
        .withArgs(nonVoter.address);
    });

    it("endProposalsRegistering should revert with Registering proposals havent started yet", async function () {
      await expect(voting.connect(owner).endProposalsRegistering()).to.be.revertedWith(
        "Registering proposals havent started yet"
      );
    });
  });

  describe("startProposalsRegistering test", function () {
    beforeEach(async function () {
      await voting.connect(owner).addVoter(voter1.address);
      await voting.connect(owner).addVoter(voter2.address);
      
    });

    it("startProposalsRegistering should revert with OwnableUnauthorizedAccount", async function () {
      
      await expect(voting.connect(nonVoter).startProposalsRegistering())
        .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
        .withArgs(nonVoter.address);
    });

    it("startProposalsRegistering should revert with Registering proposals cant be started now", async function () {
      await voting.startProposalsRegistering();
      await voting.connect(voter1).addProposal("Proposal 1");
      await expect(voting.connect(owner).startProposalsRegistering()).to.be.revertedWith(
        "Registering proposals cant be started now"
      );
    });
  });
});