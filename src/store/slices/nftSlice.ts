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

// 修改计算分页的逻辑，返回倒序的页码数组,由于nft链的同步数据有可能存在更新不及时，所以我们这里在计算数量
// 的时候，需要多计算10个，另外，如果不是后台请求，我们只会请求首页数据，为了加快加载速度，所以首页的数量
// 可以设置为70
const calculatePageKeys = (totalNfts: string, pageSize: number = 90): string[] => {
  try {
    const total = parseInt(totalNfts) + 10;
    const pageCount = Math.ceil(total / pageSize);
    // 生成倒序的页码数组，比如 [360, 270, 180, 90, 0]
    return Array.from({ length: pageCount }, (_, index) => 
      ((pageCount - 1 - index) * pageSize).toString()
    );
  } catch (error) {
    return ['0']
  }
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
    
    const cachedNfts = state.nft.cachedNfts[contractAddress] || [];
    // 如果不是后台请求且有缓存数据，立即返回缓存数据
    if (!isBackground && cachedNfts.length > 0) {
      return {
        nfts: [],
        contractAddress,
        isBackground,
        useCache: true,
        cachedNfts  // 直接传递缓存数据
      };
    }

    try {
      const pageKeys = calculatePageKeys(totalNfts, 90);
      const keysToProcess = isBackground ? pageKeys : [pageKeys[0]];

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
        const { nfts, contractAddress, useCache, cachedNfts } = action.payload;
        
        // 如果使用缓存，直接使用传递过来的缓存数据
        if (useCache && cachedNfts) {
          // 创建一个新数组进行排序
          // 排序完只需要前70个（如果超过70个，则只取70个，小于70个则全部取）
          state.nfts = [...cachedNfts].sort((a, b) => parseInt(b.id) - parseInt(a.id)).slice(0, 70);
          state.isLoading = false;
          return;
        }
        
        // 原有的数据处理逻辑
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
      });
  },
});

export const { clearNFTs } = nftSlice.actions;
export default nftSlice.reducer; 