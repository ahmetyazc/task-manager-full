import api from '../utils/axios';

export const authService = {
  // Giriş işlemi
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/local', {
        identifier: email,
        password,
      });

      // Token'ı kaydet
      localStorage.setItem('jwt', response.data.jwt);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.jwt}`;

      // Kullanıcı detaylarını al
      const userResponse = await api.get('/users/me', {
        params: {
          populate: ['role', 'teams', 'notifications']
        }
      });

      return {
        jwt: response.data.jwt,
        user: {
          ...response.data.user,
          ...userResponse.data
        }
      };
    } catch (err) {
      throw new Error(err.response?.data?.error?.message || 'Giriş başarısız');
    }
  },

  // Kayıt işlemi
  register: async (userData) => {
    try {
      // Kullanıcı kaydı
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

      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error?.message || 'Kayıt başarısız');
    }
  },

  // Çıkış işlemi
  logout: async () => {
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
    } catch (err) {
      console.error('Logout error:', err);
    }
  },

  // Kullanıcı bilgilerini güncelle
  updateProfile: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error?.message || 'Profil güncellenemedi');
    }
  },

  // Şifre değiştirme
  changePassword: async (userId, currentPassword, newPassword) => {
    try {
      const response = await api.post(`/auth/change-password`, {
        currentPassword,
        newPassword,
        confirmPassword: newPassword,
      });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error?.message || 'Şifre değiştirilemedi');
    }
  },

  // Şifremi unuttum
  forgotPassword: async (email) => {
    try {
      await api.post('/auth/forgot-password', {
        email: email
      });
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.error?.message || 'Şifre sıfırlama isteği gönderilemedi');
    }
  },

  // Şifre sıfırlama
  resetPassword: async (code, password, passwordConfirmation) => {
    try {
      const response = await api.post('/auth/reset-password', {
        code,
        password,
        passwordConfirmation,
      });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error?.message || 'Şifre sıfırlanamadı');
    }
  },

  // Kullanıcı doğrulama
  verifyEmail: async (token) => {
    try {
      const response = await api.get(`/auth/email-confirmation?confirmation=${token}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error?.message || 'Email doğrulanamadı');
    }
  },

  // Oturum kontrolü
  checkAuth: async () => {
    try {
      const response = await api.get('/users/me', {
        params: {
          populate: ['role', 'teams', 'notifications']
        }
      });
      return response.data;
    } catch (err) {
      throw new Error('Oturum geçersiz');
    }
  },

  // Bildirim token'ı kaydetme
  saveNotificationToken: async (token) => {
    try {
      await api.post('/notification-tokens', {
        data: {
          token,
          user: localStorage.getItem('userId')
        }
      });
      localStorage.setItem('notificationToken', token);
    } catch (err) {
      console.error('Notification token save error:', err);
    }
  }
};