import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CHAIN_CONFIG } from '../../config';
import { RootState } from '..';
import { fetchCollections } from './collectionSlice';

export interface MyNFT {
  id: string;
  name: string;
  image: string;
  imageOriginal?: string;
  contract: string;
  description?: string;
}

interface NFTState {
  nfts: MyNFT[];
  isLoading: boolean;
  error: string | null;
  lastAddress: string | null;
}

interface NFTResponse {
  ownedNfts: Array<{
    tokenId: string;
    name?: string;
    raw?: {
      metadata?: {
        name?: string;
        image?: string;
        description?: string;
      }
    };
    image?: {
      originalUrl?: string;
      thumbnailUrl?: string;
      cachedUrl?: string;
    };
    description?: string;
    contract: {
      address: string;
    }
  }>;
  pageKey?: string;
}

const initialState: NFTState = {
  nfts: [],
  isLoading: false,
  error: null,
  lastAddress: null,
};

const API_CONFIG = {
  baseUrl: `https://${CHAIN_CONFIG.base_url}.g.alchemy.com/nft/v3`,
  apiKey: 'goUyG3r-JBxlrxzsqIoyv0b_W-LwScsN'
};

export const fetchAllOwnedNFTs = createAsyncThunk(
  'myNft/fetchAllOwnedNFTs',
  async (ownerAddress: string, { getState, dispatch }) => {
    const address = ownerAddress;
    try {
      // 从 Redux store 中获取 collections 数据
      const state = getState() as RootState;
      let collections = state.collection.collections;

      // 如果 collections 为空，先获取 collections 数据
      if (!collections || collections.length === 0) {
        await dispatch(fetchCollections()).unwrap();
        // 重新获取更新后的 state
        collections = (getState() as RootState).collection.collections;
        
        if (!collections || collections.length === 0) {
          throw new Error('No collections found');
        }
      }

      // 获取合约地址
      const contractAddresses = collections.map(item => item.contract);
      
      // 3. 获取所有 NFT
      const allNfts: MyNFT[] = [];
      let pageKey: string | null = null;

      do {
        const queryParams = new URLSearchParams({
          owner: address,
          withMetadata: 'true',
          pageSize: '100'
        });

        if (pageKey) {
          queryParams.set('pageKey', pageKey);
        }

        // 构建合约地址查询参数
        const contractParams = contractAddresses
          // @ts-ignore
          .map(address => `contractAddresses[]=${address}`)
          .join('&');

        const response = await fetch(
          `${API_CONFIG.baseUrl}/${API_CONFIG.apiKey}/getNFTsForOwner?${contractParams}&${queryParams}`
        );

        const data: NFTResponse = await response.json();

        const newNfts = data.ownedNfts.map(nft => ({
          id: nft.tokenId,
          name: nft.name || nft.raw?.metadata?.name || `MISATO Frens #${nft.tokenId}`,
          image: nft.image?.thumbnailUrl || nft.image?.originalUrl || nft.raw?.metadata?.image || nft.image?.cachedUrl || '',
          imageOriginal: nft.image?.originalUrl || nft.raw?.metadata?.image || nft.image?.cachedUrl,
          description: nft.description || nft.raw?.metadata?.description,
          contract: nft.contract.address
        }));

        allNfts.push(...newNfts);
        pageKey = data.pageKey || null;
      } while (pageKey);

      const sortedNfts = allNfts.sort((a, b) => parseInt(b.id) - parseInt(a.id));
      
      return {
        nfts: sortedNfts,
        address,
        fromCache: false
      };

    } catch (error) {
      throw new Error('Failed to fetch all owned NFTs');
    }
  }
);

const myNftSlice = createSlice({
  name: 'myNft',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOwnedNFTs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllOwnedNFTs.fulfilled, (state, action) => {
        const { nfts, address } = action.payload;
        state.nfts = nfts;
        state.lastAddress = address;
        state.isLoading = false;
      })
      .addCase(fetchAllOwnedNFTs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load all owned NFTs';
      });
  },
});

export default myNftSlice.reducer; 
// 导出判断地址是否不同的函数
export const isDifferentAddress = (address: string) => (state: RootState) => state.myNft.lastAddress !== address;
