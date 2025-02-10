import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '..';
import { PayloadAction } from '@reduxjs/toolkit';

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

export interface Duration {
  start?: number;
  end?: number;
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

export interface VoteState {
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

export interface VoteResponse {
  message: string;
  data: {
    vote_id: number;
    vote_log_id?: number;
    like: boolean;
    likes?: number;
    dislikes?: number;
  };
}

export interface VoteStateResponse {
  message: string;
  data: number;
}

interface ModelState {
  votingModels: Model[];
  votingDuration: Duration | null;

  enabledModels: Model[];
  enabledTotalCount: number;
  totalCount: number;
  isLoading: boolean;
  isEnabledLoading: boolean;
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
  votingDuration: null,
  enabledModels: [],
  enabledTotalCount: 0,
  totalCount: 0,
  isLoading: false,
  isEnabledLoading: false,
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
    const state = getState() as RootState;
    const walletAddress = state.wallet.address;
    console.log("当前用户状态", walletAddress, votingModelsData.data.models?.length)
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
  async (id: number, { getState }) => {
    const response = await fetch(`/niyoko-api/model/detail?id=${id}`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN0dWRpbyIsImlhdCI6MTczNjA4MzA3MX0.nBfMsRYqjOkOfjFqCEbmBJWjz1I_CkIr5emwdMS2nXo'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch model detail');
    const modelData = await response.json();

    // 如果用户已登录，获取投票状态
    const state = getState() as RootState;
    const walletAddress = state.wallet.address;
    
    if (walletAddress) {
      try {
        const voteResponse = await fetch(`/niyoko-api/model/vote/state?user=${walletAddress}&id=${id}`, {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN0dWRpbyIsImlhdCI6MTczNjA4MzA3MX0.nBfMsRYqjOkOfjFqCEbmBJWjz1I_CkIr5emwdMS2nXo'
          }
        });
        
        if (voteResponse.ok) {
          const voteData = await voteResponse.json();
          // 将投票状态合并到模型数据中
          modelData.data.model_vote = {
            ...modelData.data.model_vote,
            state: voteData.data
          };
        }
      } catch (error) {
        console.error('Failed to fetch vote state:', error);
      }
    }

    return modelData;
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

export const voteModel = createAsyncThunk(
  'model/voteModel',
  async ({ 
    user, 
    model_id, 
    like 
  }: { 
    user: string; 
    model_id: number; 
    like: boolean 
  }) => {
    const response = await fetch('/niyoko-api/model/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN0dWRpbyIsImlhdCI6MTczNjA4MzA3MX0.nBfMsRYqjOkOfjFqCEbmBJWjz1I_CkIr5emwdMS2nXo'
      },
      body: JSON.stringify({
        user,
        model_id,
        like
      })
    });

    if (!response.ok) throw new Error('Vote failed');
    return await response.json();
  }
);

export const fetchModelVoteState = createAsyncThunk(
  'model/fetchModelVoteState',
  async ({ user, id }: { user: string; id: number }) => {
    const params = new URLSearchParams({
      user,
      id: id.toString(),
    });

    const response = await fetch(`/niyoko-api/model/vote/state?${params}`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN0dWRpbyIsImlhdCI6MTczNjA4MzA3MX0.nBfMsRYqjOkOfjFqCEbmBJWjz1I_CkIr5emwdMS2nXo'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch vote state');
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
    },
    updateVoteOptimistically: (state, action: PayloadAction<{
      modelId: number;
      like: boolean;
      previousState?: number;
    }>) => {
      const { modelId, like, previousState } = action.payload;
      
      // 更新投票模型列表
      // @ts-ignore
      state.votingModels = state.votingModels.map(model => {
        if (model.id === modelId) {
          const currentLikes = model.model_vote?.like || 0;
          // 如果是从未投票状态变为喜欢，likes+1
          // 如果是从不喜欢状态变为喜欢，likes+1
          // 如果是从喜欢状态变为不喜欢，likes-1
          let newLikes = currentLikes;
          if (previousState === 1) {
            // 原来是喜欢的
            if (like === false) {
              newLikes = newLikes - 1;
            }
          } else if (like) {
            // 现在点了喜欢的
            newLikes = newLikes + 1
          }
          
          return {
            ...model,
            model_vote: {
              ...model.model_vote,
              state: like ? 1 : 2,
              like: newLikes,
            }
          };
        }
        return model;
      });

      // 同样更新当前模型详情（如果存在）
      if (state.currentModel && state.currentModel.id === modelId) {
        const currentLikes = state.currentModel.model_vote?.like || 0;
        let newLikes = currentLikes;
        if (previousState === 1) {
            // 原来是喜欢的
          if (like === false) {
            newLikes = newLikes - 1;
          }
        } else if (like) {
          // 现在点了喜欢的
          newLikes = newLikes + 1
        }
        
        // @ts-ignore
        state.currentModel.model_vote = {
          ...state.currentModel.model_vote,
          state: like ? 1 : 2,
          like: newLikes,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVotingModels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVotingModels.fulfilled, (state, action) => {
        state.votingModels = action.payload.data.models;
        state.votingDuration = action.payload.data.duration;
        state.totalCount = action.payload.data.totalCount || 0;
        state.isLoading = false;
      })
      .addCase(fetchVotingModels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'get voting models failed';
      })
      .addCase(fetchEnabledModels.pending, (state) => {
        state.isEnabledLoading = true;
        state.error = null;
      })
      .addCase(fetchEnabledModels.fulfilled, (state, action) => {
        if (action.meta.arg.page === 1) {
          state.enabledModels = action.payload.data.models || [];
        } else {
          const existingIds = new Set(state.enabledModels.map(model => model.id));
          // @ts-ignore
          const newModels = (action.payload.data.models || []).filter(model => !existingIds.has(model.id));
          state.enabledModels = [...state.enabledModels, ...newModels];
        }
        state.enabledTotalCount = action.payload.data.totalCount || 0;
        state.isEnabledLoading = false;
      })
      .addCase(fetchEnabledModels.rejected, (state, action) => {
        state.isEnabledLoading = false;
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
      })
      .addCase(voteModel.fulfilled, (state, action) => {
        // 使用实际的服务器响应更新状态
        if (state.currentModel && state.currentModel.id === action.meta.arg.model_id) {
          state.currentModel.model_vote = {
            ...state.currentModel.model_vote,
            state: action.meta.arg.like ? 1 : 2,
            like: action.payload.data.likes || 0,
            dislike: action.payload.data.dislikes || 0
          };
        }
        
        state.votingModels = state.votingModels.map(model => {
          if (model.id === action.meta.arg.model_id) {
            return {
              ...model,
              model_vote: {
                ...model.model_vote,
                state: action.meta.arg.like ? 1 : 2,
                like: action.payload.data.likes || 0,
                dislike: action.payload.data.dislikes || 0
              }
            };
          }
          return model;
        });
      })
      .addCase(fetchModelVoteState.fulfilled, (state, action) => {
        if (state.currentModel) {
          // @ts-ignore
          state.currentModel.model_vote = {
            ...state.currentModel.model_vote,
            state: action.payload.data
          };
        }
      });
  },
});

export const { clearCurrentModel, clearGallery, clearGalleryList, updateVoteOptimistically } = modelSlice.actions;

export default modelSlice.reducer;

export const selectVotingModels = (state: RootState) => state.model.votingModels;
export const selectVotingModelsLoading = (state: RootState) => state.model.isLoading;
export const selectEnabledModelsLoading = (state: RootState) => state.model.isEnabledLoading;
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
export const selectVotingDuration = (state: RootState) => state.model.votingDuration;
