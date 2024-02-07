import axios from 'axios';

const getSession = async () => {
  try {
    const response = await axios.get('http://localhost:5000/auth/info/session', {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });

    return response.data.user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getSession;
