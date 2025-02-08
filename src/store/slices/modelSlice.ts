import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '..';

interface ModelVote {
  state?: number;  // 1为喜欢，2为不喜欢
  like: number;
  dislike: number;
}

interface ModelTran {
  version: number;
  train_state: number; // 模型的训练状态，0 为未开始，1 为进行中，2 为完成，-1 为失败
  task_id?: string;
  urls?: string[]; // 训练的图片链接
}


export interface Model {
  id: number;
  name?: string;
  batch?: number;
  description?: string;
  creator?: string;
  cover?: string;
  tags?: string[];
  model_vote?: ModelVote;
  model_tran?: ModelTran[];
}

export interface ModelDetail {
  id: number;
  name?: string;
  description?: string;
  creator?: string;
  cover?: string;
  tags?: string[];
  created_at?: Date;
  batch?: number;
  model_vote?: ModelVote;
  model_tran?: ModelTran[];
  usersCount?: number;
}

export interface Vote {
  vote_id: number;
  vote_log_id?: number;
  like: boolean; // 当前用户的点赞状态
  likes: number;
  dislikes: number;
}

interface VoteState {
  model_id?: number;
  state?: number; // 1为喜欢，2为不喜欢
}

export interface GalleryImage {
  id: number;
  model_id?: number;
  creator?: string;
  version?: number;
  task_id?: string;
  url?: string;
  width?: number;
  height?: number;
  state?: number;
  isAddCard?: boolean
}

interface ModelState {
  votingModels: Model[];

  enabledModels: Model[];
  enabledTotalCount: number;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  currentPage: number;

  pageSize: number;
  currentModel: ModelDetail | null;
  modelLoading: boolean;
  modelError: string | null;
  galleryImages: GalleryImage[];
  galleryPage: number;
  galleryTotalCount: number;
  galleryLoading: boolean;
  galleryError: string | null;

  galleryAdd: GalleryImage;
  galleryList: GalleryImage[];
  galleryListTotalCount: number;
  galleryListLoading: boolean;
  galleryListError: string | null;
}

const initialState: ModelState = {
  votingModels: [],
  enabledModels: [],
  enabledTotalCount: 0,
  totalCount: 0,
  isLoading: false,
  error: null,
  currentPage: 1,
  pageSize: 10,
  currentModel: null,
  modelLoading: false,
  modelError: null,
  galleryImages: [],
  galleryPage: 1,
  galleryTotalCount: 0,
  galleryLoading: false,
  galleryError: null,
  galleryAdd: {
    id: -1,
    isAddCard: true,
    task_id: 'add'
  },
  galleryList: [],
  galleryListTotalCount: 0,
  galleryListLoading: false,
  galleryListError: null,
};

export const fetchVotingModels = createAsyncThunk(
  'model/fetchVotingModels',
  async ({ page, pageSize, batch }: { page: number; pageSize: number; batch?: number }, { getState }) => {
    const state = getState() as RootState;
    const walletAddress = state.wallet.address;

    // 首先获取投票模型列表
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(batch !== undefined && { batch: batch.toString() }),
    });

    const response = await fetch(`/niyoko-api/model/list/voting?${params}`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN0dWRpbyIsImlhdCI6MTczNjA4MzA3MX0.nBfMsRYqjOkOfjFqCEbmBJWjz1I_CkIr5emwdMS2nXo'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch voting models');
    const votingModelsData = await response.json();

    // 如果用户已登录，获取投票状态
    if (walletAddress && votingModelsData.data.models?.length > 0) {
      const modelIds = votingModelsData.data.models.map((model: Model) => model.id);
      const voteParams = new URLSearchParams({
        user: walletAddress,
        ids: modelIds.join(','),
      });

      const voteResponse = await fetch(`/niyoko-api/model/vote/state_batch?${voteParams}`, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN0dWRpbyIsImlhdCI6MTczNjA4MzA3MX0.nBfMsRYqjOkOfjFqCEbmBJWjz1I_CkIr5emwdMS2nXo'
        }
      });

      if (voteResponse.ok) {
        const voteData = await voteResponse.json();
        // 将投票状态合并到模型数据中
        votingModelsData.data.models = votingModelsData.data.models.map((model: Model) => {
          const voteState = voteData.data.find((vote: { model_id?: number }) => vote.model_id === model.id);
          return {
            ...model,
            model_vote: {
              ...model.model_vote,
              state: voteState?.state
            }
          };
        });
      }
    }

    return votingModelsData;
  }
);

export const fetchEnabledModels = createAsyncThunk(
  'model/fetchEnabledModels',
  async ({ 
    page, 
    pageSize, 
    order = 'created_at', 
    desc = 'desc' 
  }: { 
    page: number; 
    pageSize: number; 
    order?: 'created_at' | 'updated_at';
    desc?: 'desc' | 'asc';
  }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      order,
      desc,
    });

    const response = await fetch(`/niyoko-api/model/list/enabled?${params}`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN0dWRpbyIsImlhdCI6MTczNjA4MzA3MX0.nBfMsRYqjOkOfjFqCEbmBJWjz1I_CkIr5emwdMS2nXo'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch enabled models');
    return await response.json();
  }
);

export const fetchModelDetail = createAsyncThunk(
  'model/fetchModelDetail',
  async (id: number) => {
    const response = await fetch(`/niyoko-api/model/detail?id=${id}`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN0dWRpbyIsImlhdCI6MTczNjA4MzA3MX0.nBfMsRYqjOkOfjFqCEbmBJWjz1I_CkIr5emwdMS2nXo'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch model detail');
    return await response.json();
  }
);

export const fetchGalleryImages = createAsyncThunk(
  'model/fetchGalleryImages',
  async ({
    page = 1, 
    pageSize = 10,
    order = 'created_at',
    desc = 'desc',
    model_id,
    state
  }: {
    page?: number;
    pageSize?: number;
    order?: 'created_at' | 'updated_at';
    desc?: 'desc' | 'asc';
    model_id?: number;
    state?: 'success' | 'pending';
  }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      order,
      desc,
      ...(model_id && { model_id: model_id.toString() }),
      ...(state && { state }),
    });

    const response = await fetch(`/niyoko-api/model/list/gallery?${params}`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN0dWRpbyIsImlhdCI6MTczNjA4MzA3MX0.nBfMsRYqjOkOfjFqCEbmBJWjz1I_CkIr5emwdMS2nXo'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch gallery images');
    return await response.json();
  }
);

export const fetchGalleryList = createAsyncThunk(
  'model/fetchGalleryList',
  async ({ 
    page = 1, 
    pageSize = 10,
    order = 'created_at',
    desc = 'desc',
    state = 'success'
  }: { 
    page?: number;
    pageSize?: number;
    order?: 'created_at' | 'updated_at';
    desc?: 'desc' | 'asc';
    state?: 'success' | 'pending';
  }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      order,
      desc,
      state,
    });

    const response = await fetch(`/niyoko-api/model/list/gallery?${params}`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN0dWRpbyIsImlhdCI6MTczNjA4MzA3MX0.nBfMsRYqjOkOfjFqCEbmBJWjz1I_CkIr5emwdMS2nXo'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch gallery list');
    return await response.json();
  }
);

const modelSlice = createSlice({
  name: 'model',
  initialState,
  reducers: {
    clearCurrentModel: (state) => {
      state.currentModel = null;
      state.modelError = null;
    },
    clearGallery: (state) => {
      state.galleryImages = [];
      state.galleryTotalCount = 0;
      state.galleryError = null;
    },
    clearGalleryList: (state) => {
      state.galleryList = [];
      state.galleryListTotalCount = 0;
      state.galleryListError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVotingModels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVotingModels.fulfilled, (state, action) => {
        state.votingModels = action.payload.data.models;
        state.totalCount = action.payload.data.totalCount || 0;
        state.isLoading = false;
      })
      .addCase(fetchVotingModels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'get voting models failed';
      })
      .addCase(fetchEnabledModels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnabledModels.fulfilled, (state, action) => {
        state.enabledModels = action.payload.data.models;
        state.enabledTotalCount = action.payload.data.totalCount || 0;
        state.isLoading = false;
      })
      .addCase(fetchEnabledModels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'get enabled models failed';
      })
      .addCase(fetchModelDetail.pending, (state) => {
        state.modelLoading = true;
        state.modelError = null;
      })
      .addCase(fetchModelDetail.fulfilled, (state, action) => {
        state.currentModel = action.payload.data;
        state.modelLoading = false;
      })
      .addCase(fetchModelDetail.rejected, (state, action) => {
        state.modelLoading = false;
        state.modelError = action.error.message || 'get model detail failed';
      })
      .addCase(fetchGalleryImages.pending, (state) => {
        state.galleryLoading = true;
        state.galleryError = null;
      })
      .addCase(fetchGalleryImages.fulfilled, (state, action) => {
        if (action.meta.arg.page === 1) {
          state.galleryImages = action.payload.data.images || [];
        } else {
          const existingIds = new Set(state.galleryImages.map(img => img.id));
          // @ts-ignore
          const newImages = (action.payload.data.images || []).filter(img => !existingIds.has(img.id));
          state.galleryImages = [...state.galleryImages, ...newImages];
        }
        state.galleryTotalCount = action.payload.data.totalCount || 0;
        state.galleryLoading = false;
      })
      .addCase(fetchGalleryImages.rejected, (state, action) => {
        state.galleryLoading = false;
        state.galleryError = action.error.message || 'get gallery images failed';
      })
      .addCase(fetchGalleryList.pending, (state) => {
        state.galleryListLoading = true;
        state.galleryListError = null;
      })
      .addCase(fetchGalleryList.fulfilled, (state, action) => {
        if (action.meta.arg.page === 1) {
          state.galleryList = [state.galleryAdd, ... (action.payload.data.images || [])];
        } else {
          const existingIds = new Set(state.galleryList.map(img => img.id));
          // @ts-ignore
          const newImages = (action.payload.data.images || []).filter(img => !existingIds.has(img.id));
          state.galleryList = [...state.galleryList, ...newImages];
        }
        state.galleryListTotalCount = action.payload.data.totalCount || 0;
        state.galleryListLoading = false;
      })
      .addCase(fetchGalleryList.rejected, (state, action) => {
        state.galleryListLoading = false;
        state.galleryListError = action.error.message || '获取图片列表失败';
      });
  },
});

export const { clearCurrentModel, clearGallery, clearGalleryList } = modelSlice.actions;

export default modelSlice.reducer;

export const selectVotingModels = (state: RootState) => state.model.votingModels;
export const selectVotingModelsLoading = (state: RootState) => state.model.isLoading;
export const selectVotingModelsTotalCount = (state: RootState) => state.model.totalCount;
export const selectEnabledModels = (state: RootState) => state.model.enabledModels;
export const selectEnabledModelsTotalCount = (state: RootState) => state.model.enabledTotalCount;
export const selectCurrentModel = (state: RootState) => state.model.currentModel;
export const selectModelLoading = (state: RootState) => state.model.modelLoading;
export const selectModelError = (state: RootState) => state.model.modelError;
export const selectGalleryImages = (state: RootState) => state.model.galleryImages;
export const selectGalleryTotalCount = (state: RootState) => state.model.galleryTotalCount;
export const selectGalleryLoading = (state: RootState) => state.model.galleryLoading;
export const selectGalleryError = (state: RootState) => state.model.galleryError;
export const selectGalleryList = (state: RootState) => state.model.galleryList;
export const selectGalleryListTotalCount = (state: RootState) => state.model.galleryListTotalCount;
export const selectGalleryListLoading = (state: RootState) => state.model.galleryListLoading;
export const selectGalleryListError = (state: RootState) => state.model.galleryListError;
