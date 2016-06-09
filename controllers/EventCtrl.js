angular
    .module('app')
    .controller('Event', EventCtrl);

    EventCtrl.$inject = [
        'EventService',
        '$scope',
        '$mdDialog',
        '$route',
        '$mdToast',
        'auth',
        '$window'
    ];

    function EventCtrl(eventService, $scope, $mdDialog, $route, $mdToast, auth, $window) {

        const self = this;
        self.selectedMethod;
        self.readonly = false;
        self.tags = [];
        self.tagOption = 'NotAllTags';
        self.eventSortOption = 'Newest';
        $scope.positionOption = 'Address';
        $scope.format = 'hh:mm:ss a';

        $scope.searchMethods = [
            'Search nearby events',
            'Search events by tags',
            'Search events by filtering parameters'
        ];


        /* Fills its purpose when editing events.
           This enables the edit-fields to be filled with the old values. */
        if (eventService.event) {
            self.event = eventService.event;
            self.category = self.event.category;
            self.description = self.event.description;
            self.address = self.event.position.address;
            self.latitude = self.event.position.latitude;
            self.longitude = self.event.position.longitude;
        }

        self.getAllEvents = () => {
            eventService.getAllEvents()
                .then(result => {
                    const events = result.data;
                    $scope.events = events;
                    self.eventsSaved = events;
                    $scope.latestEventAdded = events[0].created_at;
                    self.saveAllCreators(events);
                    self.saveAllCategories(events);
                    self.saveAllPositions(events);
                });
        };
        self.getAllEvents();

        self.saveAllCreators = events => {
            let creators = [];

            for (let event of events) {
                if (!creators.find(element => element.id == event.creator.id)) {
                    creators.push({id: event.creator.id, name: event.creator.name});
                }
            }
            $scope.creators = creators;
        };

        self.saveAllCategories = events => {
            let categories = [];

            for (let event of events) {
                if (!categories.find(element => element == event.category)) {
                    categories.push(event.category);
                }
            }
            $scope.categories = categories;
        };

        self.saveAllPositions = events => {
            let positions = [];

            for (let event of events) {
                if (!positions.find(element => element.id == event.position.id)) {
                    positions.push({
                        id: event.position.id,
                        address: event.position.address,
                        latitude: event.position.latitude,
                        longitude: event.position.longitude
                    });
                }
            }
            $scope.positions = positions;
        };

        self.getNearbyEvents = () => {
            let params = self.assemblePositionParams();

            if (params.address || params.latitude && params.longitude) {
                eventService.getNearbyEvents(params)
                    .then(res => {
                        let events = [];

                        for (let eventsArray of res.data.events) {
                            for (let event of eventsArray) {
                                events.push(event);
                            }
                        }
                        $scope.events = events;
                    });
            }
        };

        self.assemblePositionParams = () => {
            return {
                address: self.address,
                latitude: self.latitude,
                longitude: self.longitude,
                distance: self.distance
            };
        };

        $scope.showEvent = event => {
            eventService.event = event;

            $mdDialog.show({
                controller: 'Event',
                controllerAs: 'event',
                templateUrl: 'partials/event-info.tmpl.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true
            });
        };

        $scope.showHelp = () => {
            $mdDialog.show({
                controller: 'Event',
                controllerAs: 'event',
                templateUrl: 'partials/resource-help-info.tmpl.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true
            });
        };

        $scope.showEventFromMap = (mouseEvent, event) => {
            $scope.showEvent(event);
        };

        $scope.showCreateDialog = () => {
            $mdDialog.show({
                controller: 'Event',
                controllerAs: 'event',
                templateUrl: 'partials/create.tmpl.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true
            });
        };

        self.createEvent = () => {
            let params = self.assembleCreateParams();

            if (self.necessaryParamsArePresent(params)) {
                // First create the new position.
                eventService.createPosition(params)
                    .then(res => {
                        // Then create the new event when the position ID has been returned.
                        if (res.status == 200 || res.status == 201) {

                            if (res.status == 200) {
                                params['positionID'] = res.data.position.id;
                            } else {
                                params['positionID'] = res.data.id;
                            }

                            eventService.createEvent(params)
                                .then(res => {
                                    if (res.status == 201) {
                                        const message = 'Event has been successfully created!';
                                        self.showUserMessage(message, 'success');
                                        self.closeEventDialog();
                                        $route.reload();
                                    }
                                });
                        }
                    });
            } else {
                const message = `Event could not be created.
                Please fill in all missing fields and try again.`;
                self.showUserMessage(message, 'error');
            }
        };

        self.assembleCreateParams = () => {
            return {
                category: self.categoryCreate,
                description: self.descriptionCreate,
                latitude: self.latitudeCreate,
                longitude: self.longitudeCreate,
                address: self.addressCreate
            };
        };

        $scope.showEditDialog = event => {
            eventService.event = event;

            $mdDialog.show({
                controller: 'Event',
                controllerAs: 'event',
                templateUrl: 'partials/edit.tmpl.html',
                parent: angular.element(document.body),
                clickOutsideToClose:true
            });
        };

        self.editEvent = () => {
            let params = self.assembleEditParams();

            if (self.necessaryParamsArePresent(params)) {
                eventService.createPosition(params)
                    .then(res => {
                        if (res.status == 200 || res.status == 201) {

                            if (res.status == 200) {
                                params['positionID'] = res.data.position.id;
                            } else {
                                params['positionID'] = res.data.id;
                            }

                            eventService.editEvent(params)
                                .then(res => {
                                    if (res.status == 200) {
                                        self.closeEventDialog();
                                        $route.reload();
                                        const message = 'Event has been successfully updated!';
                                        self.showUserMessage(message, 'success');
                                    }
                                });
                        }
                    });
            } else {
                const message = `Event could not be updated.
                Please fill in all missing fields and try again.`;
                self.showUserMessage(message, 'error');
            }
        };

        self.necessaryParamsArePresent = params => {
            if (params.category && params.description) {
                if (params.address || params.latitude && params.longitude) {
                    return true;
                }
            }
        };

        self.assembleEditParams = () => {
            return {
                category: self.category,
                description: self.description,
                address: self.address,
                latitude: self.latitude,
                longitude: self.longitude
            }
        };

        $scope.showDeleteDialog = event => {
            const confirmDelete = $mdDialog.confirm()
                .title(`Delete ${event.category}?`)
                .textContent('This event will forever be deleted.')
                .ariaLabel('Delete event')
                .ok('Delete!')
                .cancel('Cancel');

            $mdDialog.show(confirmDelete)
                .then(() => {
                    return eventService.deleteEvent(event);
                })
                .then(res => {
                    if (res.status == 204) {
                        const message = 'Event has been successfully deleted!';
                        self.showUserMessage(message, 'success');
                        self.getAllEvents();
                    }
                });
        };

        self.closeEventDialog = () => {
            $mdDialog.hide();
        };

        self.showUserMessage = (message, theme) => {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(message)
                    .position('top')
                    .theme(`${theme}-toast`)
                    .hideDelay(5000)
            );
        };

        $scope.isAuthed = () => {
            return auth.isAuthed ? auth.isAuthed() : false
        };

        $scope.belongsToCurrentUser = event => {
            const email = event.creator.email;
            if ($window.localStorage['currentUserEmail'] == email) {
                return true;
            }
        };

        $scope.getSelectedMethod = () => {
            if ($scope.selectedMethod !== undefined) {
                return $scope.selectedMethod;
            } else {
                return 'Select a method';
            }
        };

        self.getEventsByParams = () => {
            const params = self.assembleSearchParams();

            eventService.getEventsByParams(params)
                .then(res => {
                    if (res.status == 200) {
                        let events = [];
                        for (let event of res.data.events) {
                            events.push(event);
                        }
                        $scope.events = events;
                    } else if (res.status == 404) {
                        const message = 'No events found';
                        self.showUserMessage(message, 'notify');
                    }
                });
        };

        self.assembleSearchParams = () => {
            return {
                creator: self.creatorParam,
                position: self.positionParam,
                category: self.categoryParam
            };
        };

        self.getEventsByTags = () => {
            const amountOfTags = self.tags.length;

            if (amountOfTags > 0) {
                let events = self.eventsSaved;
                let allTagsPresent = [];
                let notAllTagsPresent = [];

                for (let event of events) {
                    let tagsFound = 0;

                    for (let tag of self.tags) {
                        if (event.tags.find(x => x.name == tag))
                            tagsFound += 1;
                    }

                    if (tagsFound > 0) {
                        if (self.userWantsAllTagsPresent() &&
                            amountOfTags == tagsFound) {
                            allTagsPresent.push(event);
                        } else {
                            notAllTagsPresent.push(event);
                        }
                    }
                }

                if (self.userWantsAllTagsPresent()) {
                    events = allTagsPresent;
                } else {
                    events = notAllTagsPresent;
                }

                $scope.events = events;

                if (events.length == 0) {
                    const message = 'No events found';
                    self.showUserMessage(message, 'notify');
                }
            }
        };

        self.eventSortChange = () => {
            $scope.events.reverse();
        };

        self.userWantsAllTagsPresent = () => {
            if (self.tagOption == 'AllTags') return true;
        }

    }