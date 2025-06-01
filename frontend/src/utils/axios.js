import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json'
    }
});

// İstek interceptor'ı
instance.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            config.headers['X-User-Email'] = user.email;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Yanıt interceptor'ı
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default instance; 