declare module 'downloadjs' {
  export default function download(data: BlobPart, filename: string, mimeType?: string): void;
}