# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Voting.ts
```

npx hardhat coverage

Version
=======
> solidity-coverage: v0.8.14

Instrumenting for coverage...
=============================

> Voting.sol

Compilation:
============

Nothing to compile
No need to generate any newer typings.

Network Info
============
> HardhatEVM: v2.22.18
> network:    hardhat



  Voting Contract
    Registration
      ✔ should allow the owner to register voters
      ✔ should not allow non-owner to register voters
      ✔ should not allow duplicate registrations
      ✔ should not allow registering voters when not in RegisteringVoters status
      ✔ should revert when trying to start voting session before ending proposal registration
      ✔ should revert when trying to tally votes before ending voting session
      ✔ should not allow non-owners to start proposals registration
      ✔ should emit VoterRegistered when a voter is added
      ✔ shouldn't allow a non-voter to get one voter
    Proposals
      ✔ should allow registered voters to add proposals
      ✔ should not allow non-registered voters to add proposals
      ✔ should not allow proposals before ProposalsRegistrationStarted
      ✔ should revert if a voter tries to vote when there are no proposals
      ✔ should revert if a non-voter tries to vote
      ✔ should emit ProposalRegistered when a proposal is added
      ✔ should revert when adding an empty proposal
      ✔ should allow a voter to add multiple proposals
      ✔ shouldn't allow a non-voter to get one proposals
    Voting
      ✔ should allow registered voters to vote
      ✔ should not allow double voting
      ✔ should not allow voting before voting session starts
      ✔ should not allow voting for non-existing proposals
      ✔ should emit Voted event when a vote is cast
      ✔ should not allow non-owners to tally votes
      ✔ should not allow tallying votes before voting session ends
      ✔ should tally votes correctly when no one has voted
      ✔ should correctly handle a tie
    Voting with 3rd voters
      ✔ should correctly determine the winning proposal
    Workflow Management
      ✔ should change workflow status correctly
    endVotingSession test
      ✔ endVotingSession should revert with OwnableUnauthorizedAccount
      ✔ endVotingSession should revert with Voting session havent started yet
    startVotingSession test
      ✔ startVotingSession should revert with OwnableUnauthorizedAccount
      ✔ startVotingSession should revert with Voting session havent started yet
    endProposalsRegistering test
      ✔ endProposalsRegistering should revert with OwnableUnauthorizedAccount
      ✔ endProposalsRegistering should revert with Registering proposals havent started yet
    startProposalsRegistering test
      ✔ startProposalsRegistering should revert with OwnableUnauthorizedAccount
      ✔ startProposalsRegistering should revert with Registering proposals cant be started now


  37 passing (603ms)

-------------|----------|----------|----------|----------|----------------|
File         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------|----------|----------|----------|----------|----------------|
 contracts/  |      100 |      100 |      100 |      100 |                |
  Voting.sol |      100 |      100 |      100 |      100 |                |
-------------|----------|----------|----------|----------|----------------|
All files    |      100 |      100 |      100 |      100 |                |
-------------|----------|----------|----------|----------|----------------|

> Istanbul reports written to ./coverage/ and ./coverage.json
