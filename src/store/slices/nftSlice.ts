import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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
};

const API_CONFIG = {
  baseUrl: 'https://base-mainnet.g.alchemy.com/nft/v3',
  apiKey: 'goUyG3r-JBxlrxzsqIoyv0b_W-LwScsN'
};

export const fetchNFTs = createAsyncThunk(
  'nft/fetchNFTs',
  async (contractAddress: string) => {
    const allNfts: NFT[] = [];
    let pageKey: string | null = null;

    try {
      // 循环获取所有 NFT
      do {
        const queryParams = new URLSearchParams({
          contractAddress: contractAddress,
          withMetadata: 'true',
          limit: '100',
        });
        if (pageKey) {
          queryParams.set('pageKey', pageKey);
        }

        const response = await fetch(
          `${API_CONFIG.baseUrl}/${API_CONFIG.apiKey}/getNFTsForContract?${queryParams}`
        );

        const data: NFTResponse = await response.json();

        const newNfts = data.nfts.map(nft => ({
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

      // 按 tokenId 倒序排序
      return allNfts.sort((a, b) => parseInt(b.id) - parseInt(a.id));

    } catch (error) {
      throw new Error('Failed to fetch NFTs');
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
      const network = 8453;
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNFTs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNFTs.fulfilled, (state, action) => {
        state.nfts = action.payload;
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