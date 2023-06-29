export function saveAs(blobContent: Blob | string, fileName: string): void {
  const link = document.createElement("a");
  if (blobContent instanceof Blob) {
    link.href = URL.createObjectURL(blobContent);
  } else {
    link.href = blobContent;
  }
  link.download = fileName;
  // Add the link to the document
  document.body.appendChild(link);
  // Trigger the download
  link.click();
  // Clean up the object URL
  link.remove();
  URL.revokeObjectURL(link.href);
}