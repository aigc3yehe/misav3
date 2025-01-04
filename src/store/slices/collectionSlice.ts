import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Collection {
  id: string;
  chain: string;
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  contract: string;
  nfts: string;
}

interface CollectionState {
  collections: Collection[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CollectionState = {
  collections: [],
  isLoading: false,
  error: null,
};

const CONTRACT_ADDRESS = '0xccb6B629f5434102e37175BDac8262722180a62f';

export const fetchCollections = createAsyncThunk(
  'collection/fetchCollections',
  async () => {
    const response = await fetch(
      `https://base-mainnet.g.alchemy.com/nft/v3/goUyG3r-JBxlrxzsqIoyv0b_W-LwScsN/getContractMetadata?contractAddress=${CONTRACT_ADDRESS}`,
      {
        method: 'GET',
        headers: { accept: 'application/json' }
      }
    );
    
    const data = await response.json();
    
    // 创建10个测试数据
    return [
      {
      id: data.address,
      chain: "base",
      name: data.name,
      symbol: 'misato-frens',
      description: "The world's first Agent-operated creative studio, $MISATO Studio, presents its NFT collection.",
      imageUrl: "/misato_icon.jpg",
      contract: data.address,
      nfts: data.totalSupply
    }];
  }
);

const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.collections = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load collections';
      });
  },
});

export default collectionSlice.reducer; 