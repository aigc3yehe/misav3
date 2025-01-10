import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '..';

// 定义日志记录接口
interface TerminalLog {
  id: string;
  text: string;
  timestamp?: number;
}

// 定义状态接口
interface TerminalState {
  logs: TerminalLog[];
  isLoading: boolean;
  error: string | null;
  isLive: boolean;
}

// 初始状态
const initialState: TerminalState = {
  logs: [],
  isLoading: false,
  error: null,
  isLive: false
};

// 获取历史日志
export const fetchTerminalLogs = createAsyncThunk(
  'terminal/fetchLogs',
  async ({ channel, event }: { channel: string, event: string }) => {
    const response = await fetch(`/studio-api/terminal/records?channel=${channel}&event=${event}`);
    if (!response.ok) throw new Error('Failed to fetch terminal logs');
    const data = await response.json();
    return data.map((text: string, index: number) => ({
      id: `history-${index}`,
      text,
      timestamp: Date.now()
    }));
  }
);

// 创建 slice
const terminalSlice = createSlice({
  name: 'terminal',
  initialState,
  reducers: {
    addLog: (state, action) => {
      console.log('addLog', action.payload);
      state.logs.push({
        id: `live-${Date.now()}`,
        text: action.payload.message,
        timestamp: Date.now()
      });
    },
    setLiveStatus: (state, action) => {
      state.isLive = action.payload;
    },
    clearLogs: (state) => {
      state.logs = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTerminalLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTerminalLogs.fulfilled, (state, action) => {
        state.logs = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchTerminalLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch logs';
      });
  },
});

// 导出 actions
export const { addLog, setLiveStatus, clearLogs } = terminalSlice.actions;

// 导出 selectors
export const selectTerminalLogs = (state: RootState) => state.terminal.logs;
export const selectTerminalStatus = (state: RootState) => ({
  isLoading: state.terminal.isLoading,
  error: state.terminal.error,
  isLive: state.terminal.isLive
});

export default terminalSlice.reducer; 