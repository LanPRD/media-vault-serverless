export interface DownloadFileInput {
  fileId: string;
  ownerId: string;
  createdAt: string;
}

export interface DownloadFileOutput {
  downloadUrl: string;
  expiresIn: number;
  fileName: string;
}
