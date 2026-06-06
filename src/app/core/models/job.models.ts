export type Flow = 'txt2img' | 'img2img' | 'upscale' | 'mockup' | 'product_scene' | 'image2video';
export type JobStatus = 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED';

export interface JobAssetDto {
  url: string;
  width: number;
  height: number;
  mimeType?: string;
}

export interface JobResponseDto {
  id: string;
  status: JobStatus;
  flow: Flow;
  progress?: number;
  phase?: string;
  assets: JobAssetDto[];
  error?: string | null;
  seed?: number | null;
}

export interface CreateJobRequestDto {
  projectId: string;
  flow: Flow;

  prompt?: string;
  width?: number;
  height?: number;
  batch?: number;
  seed?: number | null;

  // upscale
  resolution?: number;

  // mockup
  scale?: number;
  offsetX?: number;
  offsetY?: number;

  // ✅ ahora plural
  imageUrls?: string[];
}
