 export const getFileName = (url: string): string => {
    return url.split('/').pop() || url;
  };
