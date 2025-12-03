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
  flow: Flow;
  prompt?: string;
  width?: number;
  height?: number;
  batch?: number;
  strength?: number;
  resolution?: number;
  template?: string;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  projectId: string;
  imageUrl?: string;
}
