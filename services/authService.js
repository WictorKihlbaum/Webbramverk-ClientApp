angular
    .module('app')
    .service('auth', authService)
    .factory('authInterceptor', authInterceptor);

    function authService($window) {
        const self = this;

        self.parseJWT = token => {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace('-', '+').replace('_', '/');
            return JSON.parse($window.atob(base64));
        };

        self.saveToken = token => {
            $window.localStorage['jwtToken'] = token;
        };

        self.getToken = () => {
            return $window.localStorage['jwtToken'];
        };

        self.isAuthed = () => {
            const token = self.getToken();
            if (token) {
                const params = self.parseJWT(token);
                return Math.round(new Date().getTime() / 1000) <= params.exp;
            } else {
                return false;
            }
        };

        self.logout = () => {
            $window.localStorage.removeItem('jwtToken');
        };
    }

    function authInterceptor(API, auth) {
        return {
            // Automatically attach Authorization header.
            request: config => {
                const token = auth.getToken();
                if (config.url.includes(API.baseURL) && token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },

            // If a token was sent back, save it.
            response: res => {
                if (res.config.url.includes(API.baseURL) && res.data.jwt) {
                    auth.saveToken(res.data.jwt);
                }
                return res;
            }
        }
    }