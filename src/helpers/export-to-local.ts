export const exportDataToLocal = (data: unknown, fileName: string) => {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  const a = document.createElement('a');
  a.download = fileName;
  a.href = URL.createObjectURL(
    new Blob([content], { type: 'application/json' })
  );
  a.click();
};
