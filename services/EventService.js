angular
    .module('app')
    .service('EventService', EventService);

    EventService.$inject = ['API', '$http', 'auth', '$window'];

    function EventService(API, $http, auth, $window) {
        const self = this;

        self.getAllEvents = () => {
            const req = {
                method: 'GET',
                url: API.baseURL + '/api/v1/events',
                headers: {
                    'X-APIKey': API.apiKey
                }
            };
            return $http(req);
        };

        self.getNearbyEvents = params => {
            const req = {
                method: 'GET',
                url: API.baseURL + API.eventsPath,
                params: {
                    address: params.address,
                    lat: params.latitude,
                    long: params.longitude,
                    dist: params.distance
                },
                headers: {
                    'X-APIKey': API.apiKey
                }
            };
            return $http(req);
        };

        self.editEvent = params => {
            const url = API.baseURL + API.eventsPath + '/' + self.event.id;

            const data = {
                event: {
                    'id': self.event.id,
                    'category': params.category,
                    'description': params.description,
                    'creator_id': $window.localStorage['currentUserID'],
                    'position_id': params.positionID
                }
            };

            const config = {
                method: 'PUT',
                headers: {
                    'Content-Type': API.format,
                    'X-APIKey': API.apiKey,
                    'Authorization': auth.getToken()
                }
            };

            return $http.put(url, data, config);
        };

        self.createEvent = params => {
            const url = API.baseURL + API.eventsPath;

            const data = {
                event: {
                    'category': params.category,
                    'description': params.description,
                    'creator_id': $window.localStorage['currentUserID'],
                    'position_id': params.positionID
                }
            };

            console.log(data);

            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': API.format,
                    'X-APIKey': API.apiKey,
                    'Authorization': auth.getToken()
                }
            };
            return $http.post(url, data, config);
        };

        self.createPosition = params => {
            const url = API.baseURL + '/api/v1/positions';
            const data = {
                position: {
                    'address': params.address,
                    'latitude': params.latitude,
                    'longitude': params.longitude
                }
            };

            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': API.format,
                    'X-APIKey': API.apiKey,
                    'Authorization': auth.getToken()
                }
            };
            return $http.post(url, data, config);
        };

        self.deleteEvent = event => {
            const url = API.baseURL + API.eventsPath + '/' + event.id;
            const config = {
                method: 'DELETE',
                headers: {
                    'Content-Type': API.format,
                    'X-APIKey': API.apiKey,
                    'Authorization': auth.getToken()
                }
            };
            return $http.delete(url, config);
        };

        self.getEventsByParams = params => {
            const req = {
                method: 'GET',
                url: API.baseURL + API.eventsPath,
                params: {
                    creator: params.creator,
                    position: params.position,
                    category: params.category
                },
                headers: {
                    'X-APIKey': API.apiKey
                }
            };
            return $http(req);
        };

    }