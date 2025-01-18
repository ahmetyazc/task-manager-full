import { createContext, useState, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess, logout as logoutAction } from '../store/slices/authSlice';
import api from '../utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('jwt');
        if (token) {
          // Token'ı API instance'ına ekle
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Kullanıcı bilgilerini al
          const response = await api.get('/users/me', {
            params: {
              populate: ['role', 'teams']
            }
          });

          // Redux store'u güncelle
          dispatch(loginSuccess({
            jwt: token,
            user: response.data
          }));
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [dispatch]);

  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      
      // Strapi login
      const response = await api.post('/auth/local', {
        identifier: credentials.email,
        password: credentials.password,
      });

      // Token'ı kaydet
      localStorage.setItem('jwt', response.data.jwt);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.jwt}`;

      // Kullanıcı detaylarını al
      const userResponse = await api.get('/users/me', {
        params: {
          populate: ['role', 'teams']
        }
      });

      // Redux store'u güncelle
      dispatch(loginSuccess({
        jwt: response.data.jwt,
        user: {
          ...response.data.user,
          ...userResponse.data
        }
      }));

      navigate('/my-tasks');
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.error?.message || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Bildirim token'ını sil (varsa)
      const notificationToken = localStorage.getItem('notificationToken');
      if (notificationToken) {
        await api.delete('/notification-tokens', {
          data: { token: notificationToken }
        });
      }

      // Temizlik işlemleri
      localStorage.removeItem('jwt');
      localStorage.removeItem('notificationToken');
      delete api.defaults.headers.common['Authorization'];
      
      // Redux store'u temizle
      dispatch(logoutAction());
      
      navigate('/auth');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleRegister = async (userData) => {
    try {
      setLoading(true);
      
      // Strapi register
      const response = await api.post('/auth/local/register', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
      });

      // Kullanıcı rolünü güncelle
      await api.put(`/users/${response.data.user.id}`, {
        role: userData.userType === 'corporate' ? 2 : 3 // 2: Corporate, 3: Individual
      });

      // Kurumsal kullanıcı için otomatik takım oluştur
      if (userData.userType === 'corporate' && userData.companyName) {
        await api.post('/teams', {
          data: {
            name: userData.companyName,
            description: `${userData.companyName} şirket takımı`,
            leader: response.data.user.id,
            members: [response.data.user.id]
          }
        });
      }

      return handleLogin({
        email: userData.email,
        password: userData.password
      });
    } catch (err) {
      throw new Error(err.response?.data?.error?.message || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await api.get('/users/me');
      return !!response.data;
    } catch {
      handleLogout();
      return false;
    }
  };

  const contextValue = {
    isAuthenticated,
    loading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    checkAuth
  };

  if (loading) {
    // Burada loading component'i gösterilebilir
    return null;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};