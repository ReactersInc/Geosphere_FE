import { useContext, useRef, useEffect } from 'react';
import { UserContext } from '../context/userContext';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { LoadingContext } from '../context/LoadingProvider';

const API_URL = 'https://makemytwin.com/'; // Replace with your API URL

export const UseApi = () => {
  const { token, logout, setError } = useContext(UserContext);
  const { setLoading } = useContext(LoadingContext); 
  const navigation = useNavigation();
  const interceptorsAdded = useRef(false);

  const fetchWithInterceptors = async (url, options = {}) => {
    try {
        setLoading(true); 
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
      
      console.log('🔵 [API Request]');
      console.log('➡️ URL:', fullUrl);
      console.log('📝 Method:', options.method || 'GET');
      if (options.body) {
        console.log('📦 Request Body:', JSON.stringify(options.body, null, 2));
      }

      const response = await fetch(fullUrl, {
        ...options,
        headers,

      });

      console.log('🟢 [API Response]');
      console.log('✅ Status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          data: errorData,
        };
      }
      const data = await response.json();
      console.log("the apis data ia : ", data);
      console.log('📦 Response Data:', JSON.stringify(data, null, 2));
      setLoading(false); // Stop loading
      
      return data; // Return the parsed JSON data
    } catch (error) {
        setLoading(false); // Stop loading
      console.error('❌ [API Error]:', error);

      const statusCode = error?.data?.status;
      
      if (statusCode === 401) {
        console.log('Token expired');
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [
            {
              text: 'OK',
              onPress: () => {
                logout();
                navigation.replace('Login');
              },
            },
          ]
        );
      } else if (statusCode === 400) {
        setError('Bad Request. Please check your input.');
      } else if (statusCode === 404) {
        setError('Resource not found.');
      } else if (data.data.status === 500) {
        setError('Server error. Please try again later.');
      } else if (!statusCode) {
        setError('Network error. Please check your connection.');
      }

      throw error;
    }
  };

  useEffect(() => {
    if (!interceptorsAdded.current) {
      interceptorsAdded.current = true;
      // Global fetch interceptors would be set here if needed
    }
  }, []);

  return {
    get: (url) => fetchWithInterceptors(url, { method: 'GET' }),
    post: (url, body) => fetchWithInterceptors(url, { method: 'POST', body: JSON.stringify(body) }),
    put: (url, body) => fetchWithInterceptors(url, { method: 'PUT', body: JSON.stringify(body) }),
    patch: (url, body) => fetchWithInterceptors(url, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (url) => fetchWithInterceptors(url, { method: 'DELETE' }),
  };
};