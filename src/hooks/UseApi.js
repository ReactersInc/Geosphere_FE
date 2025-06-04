import { useContext, useRef, useEffect } from 'react';
import { UserContext } from '../context/userContext';
import { LoadingContext } from '../context/LoadingProvider';
import { useToast } from '../component/ToastProvider';
import { API_BASE_URL } from '../config/constant';

// List of URLs where loading should NOT be shown
const SKIP_LOADING_URLS = [
  '/geofence/locations/update',
  ,
];

export const UseApi = () => {
  const { token, logout, setError } = useContext(UserContext);
  const { setLoading } = useContext(LoadingContext);
  const interceptorsAdded = useRef(false);
  const { showToast } = useToast();

  const shouldSkipLoading = (url) => {
    return SKIP_LOADING_URLS.some(skipUrl => url.startsWith(skipUrl));
  };

  const fetchWithInterceptors = async (url, options = {}) => {
    try {
      // Skip loading for specific URLs
      if (!shouldSkipLoading(url)) {
        setLoading(true);
      }

      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const fullUrl = `${API_BASE_URL}${url}`;
      
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

      console.log('🔵 [API Header]', headers);
      console.log('🟢 [API Response]');
      console.log('✅ Status:', response.status);
      
      const data = await response.json();
      console.log("API Response Data:", data);
      
      // Skip loading for specific URLs
      if (!shouldSkipLoading(url)) {
        setLoading(false);
      }
      
      return data;
    } catch (error) {
      // Skip loading for specific URLs
      if (!shouldSkipLoading(url)) {
        setLoading(false);
      }

      console.error('❌ [API Error]:', error);
      const statusCode = error?.response?.status || error?.status || null;
      console.log("Status Code:", statusCode);
      
      if (statusCode === 401) {
        console.log('Token expired');
        showToast({
          message: 'Session expired. Please log in again.',
          type: 'error',
          duration: 3000,
          position: 'top',
        });
        logout();
      } else if (statusCode === 400) {
        setError('Bad Request. Please check your input.');
      } else if (statusCode === 404) {
        setError('Resource not found.');
      } else if (statusCode === 500) {
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