import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CHAIN_CONFIG } from '../../config';
import { RootState } from '../../store';

export interface NFT {
  id: string;
  name: string;
  image: string;
  imageOriginal?: string;
  contract: string;
  description?: string;
}

interface NFTState {
  nfts: NFT[];
  isLoading: boolean;
  error: string | null;
  cachedNfts: { [key: string]: NFT[] };
}

interface NFTResponse {
  nfts: Array<{
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

interface OwnedNFTResponse {
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
  cachedNfts: {},
};

const API_CONFIG = {
  baseUrl: `https://${CHAIN_CONFIG.base_url}.g.alchemy.com/nft/v3`,
  apiKey: 'goUyG3r-JBxlrxzsqIoyv0b_W-LwScsN'
};

// 修改计算分页的逻辑，返回倒序的页码数组
const calculatePageKeys = (totalNfts: string, pageSize: number = 90): string[] => {
  const total = parseInt(totalNfts);
  const pageCount = Math.ceil(total / pageSize);
  // 生成倒序的页码数组，比如 [360, 270, 180, 90, 0]
  return Array.from({ length: pageCount }, (_, index) => 
    ((pageCount - 1 - index) * pageSize).toString()
  );
};

export const fetchNFTs = createAsyncThunk(
  'nft/fetchNFTs',
  async ({ contractAddress, totalNfts, isBackground = false }: { 
    contractAddress: string, 
    totalNfts: string,
    isBackground?: boolean 
  }, { getState }) => {
    if (!contractAddress) {
      throw new Error('Contract address is required');
    }

    const state = getState() as RootState;
    const existingNfts = new Set(state.nft.nfts.map(nft => nft.id));
    const allNfts: NFT[] = [];
    
    try {
      const pageKeys = calculatePageKeys(totalNfts);
      const keysToProcess = isBackground ? pageKeys.slice(1) : [pageKeys[0]];

      for (const pageKey of keysToProcess) {
        const queryParams = new URLSearchParams({
          contractAddress: contractAddress,
          withMetadata: 'true',
          limit: '100',
          pageKey: pageKey
        });

        const response = await fetch(
          `${API_CONFIG.baseUrl}/${API_CONFIG.apiKey}/getNFTsForContract?${queryParams}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch NFTs');
        }

        const data: NFTResponse = await response.json();

        const newNfts = data.nfts
          .filter(nft => !existingNfts.has(nft.tokenId))
          .map(nft => ({
            id: nft.tokenId,
            name: nft.name || nft.raw?.metadata?.name || `MISATO Frens #${nft.tokenId}`,
            image: nft.image?.thumbnailUrl || nft.image?.originalUrl || nft.raw?.metadata?.image || nft.image?.cachedUrl || '',
            imageOriginal: nft.image?.originalUrl || nft.raw?.metadata?.image || nft.image?.cachedUrl,
            description: nft.description || nft.raw?.metadata?.description,
            contract: nft.contract.address
          }));

        allNfts.push(...newNfts);
      }

      return {
        nfts: allNfts,
        contractAddress,
        isBackground
      };

    } catch (error) {
      console.error('Error fetching NFTs:', error);
      throw error;
    }
  }
);

export const fetchOwnedNFTs = createAsyncThunk(
  'nft/fetchOwnedNFTs',
  async ({ ownerAddress, contractAddress }: { ownerAddress: string; contractAddress: string }) => {
    const allNfts: NFT[] = [];
    let pageKey: string | null = null;

    try {
      do {
        const queryParams = new URLSearchParams({
          owner: ownerAddress,
          withMetadata: 'true',
          pageSize: '100'
        });

        if (pageKey) {
          queryParams.set('pageKey', pageKey);
        }

        const response = await fetch(
          `${API_CONFIG.baseUrl}/${API_CONFIG.apiKey}/getNFTsForOwner?contractAddresses[]=${contractAddress}&${queryParams}`
        );

        const data: OwnedNFTResponse = await response.json();

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

      return allNfts.sort((a, b) => parseInt(b.id) - parseInt(a.id));

    } catch (error) {
      throw new Error('Failed to fetch owned NFTs');
    }
  }
);

export const fetchAllOwnedNFTs = createAsyncThunk(
  'nft/fetchAllOwnedNFTs',
  async (ownerAddress: string) => {
    try {
      // 1. 首先获取所有 collections
      const network = CHAIN_CONFIG.chainId;
      const response = await fetch(`/studio-api/studio/collections?network=${network}`);
      if (!response.ok) throw new Error('Failed to fetch studio collections');
      const studioData = await response.json();

      if (!studioData.data || !studioData.data.length) {
        throw new Error('No collections found');
      }

      // 2. 获取合约元数据
      // @ts-ignore
      const contractAddresses = studioData.data.map(item => item.collection);
      
      // 3. 获取所有 NFT
      const allNfts: NFT[] = [];
      let pageKey: string | null = null;

      do {
        const queryParams = new URLSearchParams({
          owner: ownerAddress,
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

        const data: OwnedNFTResponse = await response.json();

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

      return allNfts.sort((a, b) => parseInt(b.id) - parseInt(a.id));

    } catch (error) {
      throw new Error('Failed to fetch all owned NFTs');
    }
  }
);

const nftSlice = createSlice({
  name: 'nft',
  initialState,
  reducers: {
    clearNFTs: (state) => {
      state.nfts = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNFTs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNFTs.fulfilled, (state, action) => {
        const { nfts, contractAddress } = action.payload;
        
        if (!state.cachedNfts[contractAddress]) {
          state.cachedNfts[contractAddress] = [];
        }
        
        const allNfts = [...state.cachedNfts[contractAddress], ...nfts];
        const uniqueNfts = Array.from(
          new Map(allNfts.map(nft => [nft.id, nft])).values()
        );
        
        state.cachedNfts[contractAddress] = uniqueNfts;
        state.nfts = uniqueNfts.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        state.isLoading = false;
      })
      .addCase(fetchNFTs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load NFTs';
      })
      .addCase(fetchOwnedNFTs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOwnedNFTs.fulfilled, (state, action) => {
        state.nfts = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchOwnedNFTs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load owned NFTs';
      })
      .addCase(fetchAllOwnedNFTs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllOwnedNFTs.fulfilled, (state, action) => {
        state.nfts = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllOwnedNFTs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load all owned NFTs';
      });
  },
});

export const { clearNFTs } = nftSlice.actions;
export default nftSlice.reducer; 