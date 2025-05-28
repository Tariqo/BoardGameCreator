export const uploadSprite = async (file: File, token?: string): Promise<string> => {
  const formData = new FormData();
  formData.append('sprite', file);

  const response = await fetch('http://localhost:5000/api/assets/upload', {
    method: 'POST',
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : undefined,
    body: formData,
  });

  const result = await response.json();
  if (!result.success) throw new Error(result.message);
  return result.url;
};
