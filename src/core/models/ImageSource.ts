export interface ImageSource {
  id: string;
  data: string; // base64-encoded image data
  timestamp: Date;
  source: string; // e.g., 'screen-capture', 'file-import', 'camera'
  path?: string; // optional file path if imported from file system
}