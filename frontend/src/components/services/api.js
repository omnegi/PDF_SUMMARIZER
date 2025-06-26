const API_BASE_URL = 'https://pdf-summarizer-rddj.onrender.com';

export const uploadPDF = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to upload PDF');
  }

  const data = await response.json();
  return data.summary;
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
