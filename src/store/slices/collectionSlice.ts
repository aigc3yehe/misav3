import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CHAIN_CONFIG } from '../../config';
import { RootState } from '../../store';

export interface Collection {
  id: string;
  chain: number;
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  contract: string;
  nfts: string;
  type: string;
  fee?: {
    feeCheck: boolean;
    treasury: string;
    feeToken: string;
    feeDecimals: number;
    feeAmount: number;
    feeSymbol: string;
  };
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

// 获取基本列表信息
const fetchStudioCollections = async (network: number) => {
  const response = await fetch(`/studio-api/studio/collections?network=${network}`);
  if (!response.ok) throw new Error('Failed to fetch studio collections');
  return await response.json();
};

// 获取合约元数据
const fetchContractMetadata = async (contractAddresses: string[]) => {
  const response = await fetch(
    `https://${CHAIN_CONFIG.base_url}.g.alchemy.com/nft/v3/goUyG3r-JBxlrxzsqIoyv0b_W-LwScsN/getContractMetadataBatch`,
    {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ contractAddresses })
    }
  );
  if (!response.ok) throw new Error('Failed to fetch contract metadata');
  return await response.json();
};

export const fetchCollections = createAsyncThunk(
  'collection/fetchCollections',
  async () => {
    try {
      // 1. 获取基本列表信息
      const studioData = await fetchStudioCollections(CHAIN_CONFIG.chainId);
      if (!studioData.data || !studioData.data.length) {
        throw new Error('No collections found');
      }

      // 2. 获取合约元数据
      // @ts-ignore
      const contractAddresses = studioData.data.map(item => item.collection);
      const contractData = await fetchContractMetadata(contractAddresses);

      // 3. 合并数据
      return studioData.data.map((item: any) => {
        const contractInfo = contractData.contracts.find(
          (c: any) => c.address.toLowerCase() === item.collection.toLowerCase()
        );

        return {
          id: item.collection,
          chain: item.network,
          name: item.name || item.metadata.name || contractInfo?.name,
          symbol: contractInfo?.symbol || '',
          description: item.metadata.description,
          imageUrl: item.metadata.imageUrl || "/misato_icon.jpg",
          contract: item.collection,
          nfts: contractInfo?.totalSupply || '0',
          type: item.type,
          fee: item.fee
        };
      });
    } catch (error) {
      console.error('Error fetching collections:', error);
      throw error;
    }
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

// 导出选择器
export const selectCollectionByName = (state: RootState, name: string | null) => 
  state.collection.collections.find(c => c.name.toLowerCase() === name?.toLowerCase()); 