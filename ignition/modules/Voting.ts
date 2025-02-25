
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const VotingFactoryModule = buildModule("VotingModule", (m) => {
  const VotingFactory = m.contract("VotingFactory",[]);

  return { VotingFactory };
});

export default VotingFactoryModule;