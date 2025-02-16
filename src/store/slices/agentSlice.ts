import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 定义 Agent 类型
export interface Agent {
  id: string;
  name: string;
  avatar: string;
  address: string;
  wallet_address: string;
}

// 可用的 agents 列表
export const availableAgents: Agent[] = [
  {
    id: 'misato',
    name: 'MISATO',
    avatar: '/misato.jpg',
    address: '0x98f4779FcCb177A6D856dd1DfD78cd15B7cd2af5',
    wallet_address: '0x900709432a8F2C7E65f90aA7CD35D0afe4eB7169',
  },
  {
    id: 'niyoko',
    name: 'NIYOKO',
    avatar: '/niyoko_avatar.png',
    address: '0x98f4779FcCb177A6D856dd1DfD78cd15B7cd2af5',
    wallet_address: '0x900709432a8F2C7E65f90aA7CD35D0afe4eB7169',
  },
];

interface AgentState {
  currentAgent: Agent | null;
  availableAgents: Agent[];
}

const initialState: AgentState = {
  currentAgent: availableAgents[0], // 默认使用第一个 agent
  availableAgents: availableAgents,
};

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    setCurrentAgent: (state, action: PayloadAction<Agent>) => {
      state.currentAgent = action.payload;
    },
  },
});

export const { setCurrentAgent } = agentSlice.actions;
export default agentSlice.reducer; 