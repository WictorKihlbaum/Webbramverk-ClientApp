angular
    .module('app')
    .controller('Login', LoginCtrl);

    LoginCtrl.$inject = ['user', 'auth', '$mdToast', '$mdDialog', '$window'];

    function LoginCtrl(user, auth, $mdToast, $mdDialog, $window) {
        const self = this;

        function isJWTokenRetrieved(res) {
            const token = res.data.jwt ? res.data.jwt : null;
            if (token) {
                self.userEmail = res.config.data.auth.email;
                user.getAllCreators().then(secondRes => {
                    const creator = secondRes.data.find(element => element.email == self.userEmail);
                    $window.localStorage['currentUserID'] = creator.id;
                    self.showUserMessage(`Welcome ${creator.name}!`);
                });
            }
        }

        self.login = () => {
            if (self.email && self.password) {
                $window.localStorage['currentUserEmail'] = self.email;
                user.login(self.email, self.password)
                    .then(res => {
                        $mdDialog.hide();
                        isJWTokenRetrieved(res);
                    });
            }
        };

        self.logout = () => {
            auth.logout && auth.logout();
            self.showUserMessage('Goodbye!');
        };

        self.showUserMessage = message => {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(message)
                    .position('top')
                    .theme('success-toast')
                    .hideDelay(5000)
            );
        };

        self.isAuthed = () => {
            return auth.isAuthed ? auth.isAuthed() : false
        };

        self.openLoginDialog = () => {
            $mdDialog.show({
                controller: 'Login',
                controllerAs: 'login',
                templateUrl: 'partials/login.tmpl.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true
            })
        };

        self.closeLoginDialog = () => {
            $mdDialog.hide();
        };

    }