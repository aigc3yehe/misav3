import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Agent {
  id: string;
  name: string;
  avatar: string;
  address: string;
}

interface AgentState {
  currentAgent: Agent | null;
}

const initialState: AgentState = {
  currentAgent: null,
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