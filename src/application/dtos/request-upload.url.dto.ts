export interface RequestUploadUrlInput {
  ownerId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface RequestUploadUrlOutput {
  uploadUrl: string;
  fileId: string;
  expiresIn: number;
}
