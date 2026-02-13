export interface DownloadFileInput {
  fileId: string;
  ownerId: string;
}

export interface DownloadFileOutput {
  downloadUrl: string;
  experiresIn: number;
  fileName: string;
}
