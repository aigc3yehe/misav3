import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { showToast } from './toastSlice';
import { updateMessageUrls } from './chatSlice';
import { RootState } from '..';

// S3 配置
const S3_CONFIG = {
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
  bucketName: import.meta.env.VITE_AWS_S3_BUCKET
};

// 状态接口
interface ImagesState {
  isUploading: boolean;
  error: string | null;
}

const initialState: ImagesState = {
  isUploading: false,
  error: null
};

// 上传单个文件到 S3
const uploadFileToS3 = async (s3Client: S3Client, file: File, key: string) => {
  console.log('📝 Preparing file for upload:', file.name);
  
  try {
    // 将 File 转换为 Blob
    const response = await fetch(URL.createObjectURL(file));
    const arrayBuffer = await response.arrayBuffer();
    const fileContent = new Uint8Array(arrayBuffer);
    
    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.bucketName,
      Key: key,
      Body: fileContent,  // 使用 Buffer 来处理二进制数据
      ContentType: file.type
    });

    console.log('🚀 Starting upload to S3:', key);
    const result = await s3Client.send(command);
    console.log("✨ Upload completed:", result);

    const fileUrl = `https://${S3_CONFIG.bucketName}.s3.amazonaws.com/${key}`;
    console.log('🔗 Generated URL:', fileUrl);
    return fileUrl;
  } catch (error) {
    console.error('⚠️ Error uploading file:', file.name, error);
    throw error;
  }
};

// 上传图片到 S3
export const uploadImages = createAsyncThunk(
  'images/uploadImages',
  async ({ messageId, files }: { messageId: string | number, files: File[] }, { dispatch, getState }) => {
    console.log('📤 Starting image upload process', { messageId, fileCount: files.length });
    try {
      const s3Client = new S3Client({
        region: S3_CONFIG.region,
        credentials: S3_CONFIG.credentials,
      });

      const uploadedUrls: string[] = [];

      // 并行上传所有文件
      const uploadPromises = files.map(file => {
        const fileName = `${Date.now()}-${file.name}`;
        const key = `images/chat/${fileName}`;
        console.log('🖼️ Processing file:', file.name);
        return uploadFileToS3(s3Client, file, key);
      });

      const results = await Promise.all(uploadPromises);
      uploadedUrls.push(...results);

      // 更新消息中的 URLs
      const state = getState() as RootState;
      const currentAgent = state.agent.currentAgent;
      
      console.log('👤 Current agent:', currentAgent?.id);
      dispatch(updateMessageUrls({ messageId, urls: uploadedUrls }));

      dispatch(showToast({ message: 'Images uploaded successfully', severity: 'success' }));
      console.log('✅ Upload process completed successfully');

      return uploadedUrls;
    } catch (error: any) {
      console.error('❌ Upload process failed:', error);
      dispatch(showToast({ message: 'Failed to upload images', severity: 'error' }));
      throw error;
    }
  }
);

const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(uploadImages.pending, (state) => {
        console.log('⏳ Upload pending');
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadImages.fulfilled, (state) => {
        console.log('✅ Upload fulfilled');
        state.isUploading = false;
      })
      .addCase(uploadImages.rejected, (state, action) => {
        console.log('❌ Upload rejected:', action.error);
        state.isUploading = false;
        state.error = action.error.message || 'Upload failed';
      });
  },
});

export default imagesSlice.reducer; 