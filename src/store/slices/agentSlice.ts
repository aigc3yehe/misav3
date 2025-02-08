import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Agent {
  id: string;
  name: string;
  avatar: string;
  wallet_address: string;
  address: string;
}

interface AgentState {
  currentAgent: Agent | null;
}

const initialState: AgentState = {
  currentAgent: {
    id: 'niyoko',
    name: 'NIYOKO',
    avatar: '/misato.jpg',
    address: '0x98f4779FcCb177A6D856dd1DfD78cd15B7cd2af5',
    wallet_address: '0x900709432a8F2C7E65f90aA7CD35D0afe4eB7169',
  },
};

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    setCurrentAgent: (state, action: PayloadAction<Agent>) => {
      state.currentAgent = action.payload;
    },
    clearCurrentAgent: (state) => {
      state.currentAgent = null;
    },
  },
});

export const { setCurrentAgent, clearCurrentAgent } = agentSlice.actions;
export default agentSlice.reducer; 