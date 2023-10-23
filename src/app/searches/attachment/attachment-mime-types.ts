export class AttachmentMimeTypes {
  private static mimeTypes = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    png: 'image/png',
    tif: 'image/tiff',
    tiff: 'image/tiff',

    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/application/vnd.openxmlformats-officedocument.presentationml.presentation',
    vsd: 'application/vnd.visio',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xml: 'application/xml',

    rar: 'application/x-rar-compressed',
    zip: 'application/zip',

    wav: 'audio/wav',

    txt: 'text/plain',
    csv: 'text/plain'
  };

  static getMimeType(extension: string): string {
    if (this.mimeTypes[extension] != null) {
      return this.mimeTypes[extension];
    } else {
      return 'application/octet-stream';
    }
  }
}
