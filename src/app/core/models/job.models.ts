export type Flow = 'txt2img' | 'img2img' | 'upscale' | 'mockup';
export type JobStatus = 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED';

export interface JobAssetDto {
  url: string;
  width: number;
  height: number;
}

export interface JobResponseDto {
  id: string;
  status: JobStatus;
  flow: Flow;
  assets: JobAssetDto[];
  error?: string | null;
}

export interface CreateJobRequestDto {
  projectId: string;
  flow: Flow;

  prompt?: string;
  width?: number;
  height?: number;
  batch?: number;

  // upscale
  resolution?: number;

  // mockup
  template?: string;
  scale?: number;
  offsetX?: number;
  offsetY?: number;

  // ✅ ahora plural
  imageUrls?: string[];
}
