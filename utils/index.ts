export const saveAs = (blobContent: Blob | string, fileName: string): void => {
  const link = document.createElement("a");
  if (blobContent instanceof Blob) {
    link.href = URL.createObjectURL(blobContent);
  } else {
    link.href = blobContent;
  }
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}