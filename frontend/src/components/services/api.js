const API_BASE_URL = 'http://localhost:8000';

export const uploadPDF = async (file, length = 'medium') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('length', length);

  console.log('API: Sending POST request to /upload/ with length:', length);
  
  const response = await fetch(`${API_BASE_URL}/upload/`, {
    method: 'POST',
    body: formData,
  });

  console.log('API: Response status:', response.status);

  if (!response.ok) {
    let errorMessage = 'Failed to upload PDF';
    try {
      const error = await response.json();
      errorMessage = error.detail || errorMessage;
    } catch (e) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log('API: Response data:', data);
  return data;
};

export const getSummaryOptions = async () => {
  const response = await fetch(`${API_BASE_URL}/summary-options/`);
  if (!response.ok) {
    throw new Error('Failed to fetch summary options');
  }
  return await response.json();
};

export const sendMessage = async (message) => {
  const response = await fetch(`${API_BASE_URL}/chat/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get response');
  }

  const data = await response.json();
  return data.response;
};

export const resetConversation = async () => {
  await fetch(`${API_BASE_URL}/reset/`, {
    method: 'POST',
  });
};
