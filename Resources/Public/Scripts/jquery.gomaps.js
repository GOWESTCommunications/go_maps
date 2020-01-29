/**
 * Created by mhirdes on 27.11.13.
 */
(function ($) {
    var GoMaps = window.GoMaps = window.GoMaps || {};

    GoMaps.Data = {
        mapSettings: {
            markerSearch: null,
            defaultZoom: null,
            doubleClickZoom: null,
            scrollZoom: null,
            scaleControl: null,
            streetviewControl: null,
            fullscreenControl: null,
            zoomControl: null,
            defaultType: null,
            mapTypeControl: null,
            mapTypes: null,
            showRoute: null,
            calcRoute: null,
            styledMapName: null,
            styledMapCode: null,
            tooltipTitle: null,
            kmlUrl: null,
            kmlLocal: null,
            showForm: null,
            lat: null,
            lng: null,
            geolocation: null,
            infowindowStyle: null,
            maxFilteredAddresses: null,
        },
        zoomTypes: [],
        defaultMapTypes: [],
        addresses: []
    };

    /**
     * Controller for Map functionality
     *
     * @param {HTMLElement} element
     * @param {GoMaps.Data} gme
     * @constructor
     */
    GoMaps.Controller = function (element, gme) {
        this.element = $(element);
        this.gme = gme;
        this.data = gme;

        if(typeof google !== "undefined") {
            this.initialize();
        }
    };

    GoMaps.Controller.prototype = {

        initialize: function() {
            var $element = this.element;
	        this.route = [];
	        this.infoWindow = new google.maps.InfoWindow();
	        this.bounds = new google.maps.LatLngBounds();
            this.markers = [];

            if (this.gme.mapSettings.mapselector) {
                this.map = new google.maps.Map(document.getElementById(this.gme.mapSettings.mapselector), this._createMapOptions());
            } else {
                this.map = new google.maps.Map(document.getElementById(this.gme.mapSettings.id), this._createMapOptions());
            }

            if(this.gme.mapSettings.formselector) {
                $('#' + this.gme.mapSettings.formselector).append($('#' + this.gme.mapSettings.id + '-form'));
            }
            if(this.gme.mapSettings.locationlistselector) {
                $('#' + this.gme.mapSettings.locationlistselector).append($('.gme-addresses'));
            }
            if(this.gme.mapSettings.categoryselector) {
                $('#' + this.gme.mapSettings.categoryselector).append($('.gme-cats'));
            }
            if(this.gme.mapSettings.infowindowselector) {
                $('#' + this.gme.mapSettings.infowindowselector).append($('#' + this.gme.mapSettings.id + '-infowindow'));
            }
            
	        this._initializeCss();
	        this._initializeData();
	        this._initializeKmlImport();
            this._initializeGeolocation();

	        this._initializeSearch();
	        this._initializeBackendAddresses();
	        this._initializeRoute();
	        this._initializeResizeListener();
	        this._initializeCheckboxListener();
	        this._initializeAddressListener();

	        // open info window
	        window.setTimeout(function () {
		        $element.trigger("openinfo");
	        }, 2000);

	        this.setCategoriesFromRequest();
            this.focusAddressFromRequest();

            if(this.gme.mapSettings.zoomControl == 0 && this.gme.mapSettings.zoomControlConfig) {
                var idSelector;
                if(this.gme.mapSettings.selector) {
                    idSelector = this.gme.mapSettings.selector;
                } else {
                    idSelector = this.gme.mapSettings.id;
                }
                
                $('.tx-go-maps #'+ idSelector +'').append('<div class="zoomControls" unselectable="on" onselectstart="return false;" onmousedown="return false;"><ul><li>'+
                '<div id="' + idSelector + '-zoomIn' + '"  class="button zoomIn"><span></span></div></li><li>'+
                '<div id="' + idSelector + '-zoomOut' + '" class="button zoomOut"><span></span></div></li></ul></div>'
                );

                $('#' + idSelector + '-zoomIn').on('click',function() {
                    var zoom = $element.data("map").getZoom();
                    $element.data("map").setZoom(zoom + 1);
                });
                
                $('#' + idSelector + '-zoomOut').on('click',function(){
                    var zoom = $element.data("map").getZoom();
                    $element.data("map").setZoom(zoom - 1);
                });
            }

            $('.locationList .close').on('click', function(){
                $('.leftSide').removeClass('open');
                $('.js-gme-sword').val('');
                $('.js-gme-sword').focus();
                $('.routeTable').empty();
            });
           
            
	        // trigger mapcreated on map
	        $element.trigger("mapcreated");

	        this.refreshMap($element, this.gme);
        },

        // categories checkboxes
        setCategories: function (selectedCats) {
            var gme = this.data,
                $element = this.element;


            $.each(this.markers, function (key, marker) {
                marker.setVisible(false);
                var matches = 0;
                $.each(marker.categories, function (keyM, category) {
                    if ($.inArray(category, selectedCats) != -1) {
                        matches += 1;
                    }
                });
                var showMarker = (matches > 0);
                if (gme.mapSettings.logicalAnd) {
                    showMarker = (matches == selectedCats.length);
                }
                if (showMarker) {
                    marker.setVisible(true);
                    if ($('#gme-address'+marker.uid).parent().is('del')) {
                        $('#gme-address'+marker.uid).unwrap();
                    }
                    return true;
                } else {
                    if (! $('#gme-address'+marker.uid).parent().is('del')) {
                        $('#gme-address'+marker.uid).wrap('<del></del>');
                    }
                }
            });
            if ($element.markerCluster) {
                $element.markerCluster.repaint();
            }
        },

        setCategoriesFromRequest: function () {
            // set categories
            var getCats = this.getURLParameter('tx_gomaps_show\\[cat\\]');
            if (getCats) {
                getCats = getCats.split(",");
                this.setCategories(getCats);
                $('.js-gme-cat').each(function (key, checkbox) {
                    if ($.inArray($(checkbox).val(), getCats) != -1) {
                        $(checkbox).attr('checked', true);
                        return true;
                    }
                });
            }
        },

        focusAddressFromRequest: function () {
            var getAddress = this.getURLParameter('tx_gomaps_show\\[address\\]'),
                $element = this.element,
                gme = this.data;

                console.log('test');
                console.log(getAddress + 'address');

            if (getAddress) {
                this.focusAddress(getAddress, $element, gme);
            }
        },



        // add a point
        addMapPoint: function (pointDescription, Route, $element, infoWindow, gme) {
            var _this = this,
                latitude = pointDescription.latitude,
                longitude = pointDescription.longitude;

            Route.push(pointDescription.address);

            if (Math.round(latitude) == 0 && Math.round(longitude) == 0) {
                $element.data("geocoder").geocode({"address": pointDescription.address}, function (point, status) {
                    //Übergangslösung, bis ich einen Weg gefunden habe, alle neuen Adressen auf einmal Geocoden zu können ohne Fehler --> JR 23.10.2019
                    if(status == 'OVER_QUERY_LIMIT') {
                        return;
                    } else {
                        if(point.length > 0) {
                            latitude = point[0].geometry.location.lat();
                            longitude = point[0].geometry.location.lng();
                            var position = new google.maps.LatLng(latitude, longitude);
                            _this.setMapPoint(pointDescription, Route, $element, infoWindow, position, gme);
                        }
                    }
                });
                return;   
            }

            

            var position = new google.maps.LatLng(latitude, longitude);

            this.setMapPoint(pointDescription, Route, $element, infoWindow, position, gme);
        },

        focusAddress: function (addressUid, $element, gme) {
            var _this = this,
                _map = this.map;


            $('#' + gme.mapSettings.id + '-infowindow .infowindow-content').css('display', 'block');

            
            if(gme.mapSettings.infowindowStyle == 1) {
                $.each(this.markers, function(key, marker) {
                    if (marker.uid == addressUid) {
                        $element.data("center", marker.position);
                        if (marker.infoWindow) {
                            if($('#' + gme.mapSettings.id + '-infowindow').length) {
                                if(marker.infoWindowImage) {
                                    $('#' + gme.mapSettings.id + '-infowindow .infowindow-image').html(marker.infoWindowImage);

                                } else {
                                    $('#' + gme.mapSettings.id + '-infowindow .infowindow-image').html("");  
                                }
                                $('#' + gme.mapSettings.id + '-infowindow .infowindow-content').html(marker.infoWindowContent);
                                $('#' + gme.mapSettings.id + '-infowindow').addClass('open');
                                $('.tx-go-maps .leftSide').removeClass('open');

                                setTimeout(function() {
                                    $('.tx-go-maps .infowindow .infowindow .infowindow-content').append($('.routeLink'));
                                }, 300);

                                $('.tx-go-maps .formcontainer form .back').on('click', function() {
                                    $('.locationList').addClass('act');
                                    $('.tx-go-maps .infowindow').removeClass('open');
                                });

                                $('#' + gme.mapSettings.id + '-infowindow .close').on('click', function() {
                                    if(typeof(window.goTrackEvent) == 'function') {
                                        window.goTrackEvent('gmap - close info window', 'click',  ' - "' + marker.title + '"');
                                    }
                                
                                    //$('.tx-go-maps').removeClass('infowindowActive');
                                    $(window).trigger('resize');
                                    $('#' + gme.mapSettings.id + '-infowindow .infowindow-content').css('display', 'none');
                                    $('#' + gme.mapSettings.id + '-infowindow').removeClass('open');
                                    $('.leftSide').addClass('open');
                                });
                                if($('.tx-go-maps .infowindow .infowindow-content .infowindow .infowindow-image').length <= 0) {
                                    $('.tx-go-maps .infowindow .infowindow-content .infowindow .infowindow-content').addClass('no-img');
                                }

                            } else {
                                
                                marker.infoWindow.setContent(marker.infoWindowContent);
                                marker.infoWindow.open(_this.map, marker);
                            }
                        }
                        gme.mapSettings.zoom = gme.mapSettings.focusZoom ? gme.mapSettings.focusZoom : 17;
                        _map.setZoom(gme.mapSettings.zoom);
                        _this.refreshMap($element, gme);
                        return true;
                    }
                });
            } else {
                $.each(this.markers, function (key, marker) {
                    if (marker.uid == addressUid) {
                        $element.data("center", marker.position);
                        if (marker.infoWindow) {
                            marker.infoWindow.setContent(marker.infoWindowContent);
                            marker.infoWindow.open(_this.map, marker);
                        }
                        gme.mapSettings.zoom = gme.mapSettings.focusZoom ? gme.mapSettings.focusZoom : 14;
                        _map.setZoom(gme.mapSettings.zoom);
                        _this.refreshMap($element, gme);
                        setTimeout(function() {
                            $('.gm-style-iw-d div #' + gme.mapSettings.id + '-infowindow').css('display', 'block');
                            $('.gm-style-iw-d div #' + gme.mapSettings.id + '-infowindow').css('position', 'relative');
                            $('.gm-style-iw-d div #' + gme.mapSettings.id + '-infowindow .close').css('display', 'none');
                        }, 200);
                        
                        return true;
                    }
                });
            }
            
            if ($element.markerCluster) {
                $element.markerCluster.repaint();
            }
        },

        /**
         * decode URL Parameter go_maps[cat]
         *
         * @param name
         * @returns {string|null}
         */
        getURLParameter: function (name) {
            var uri = decodeURI(location.search);
            return (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(uri) || ["", ""])[1].replace(/\+/g, '%20') || null;
        },

        /**
         * get the travel mode
         *
         * @param $travelMode
         * @returns {string}
         */
        getTravelMode: function ($travelMode) {
            var travelMode = google.maps.TravelMode.DRIVING;
            switch ($travelMode) {
                case 2:
                    travelMode = google.maps.TravelMode.BICYCLING;
                    break;
                case 3:
                    travelMode = google.maps.TravelMode.TRANSIT;
                    break;
                case 4:
                    travelMode = google.maps.TravelMode.WALKING;
                    break;
            }
            return travelMode;
        },

        /**
         * get the unit system
         *
         *  @param $unitSystem
         * @returns {number}
         */
        getUnitSystem: function ($unitSystem) {
            var unitSystem = 0;
            switch ($unitSystem) {
                case 2:
                    unitSystem = google.maps.UnitSystem.METRIC;
                    break;
                case 3:
                    unitSystem = google.maps.UnitSystem.IMPERIAL;
                    break;
            }
            return unitSystem;
        },

        /**
         * insert the point on the map
         *
         * @param pointDescription
         * @param Route
         * @param $element
         * @param infoWindow
         * @param position
         * @param gme
         */
        setMapPoint: function (pointDescription, Route, $element, infoWindow, position, gme) {

            var _map = this.map,
                markerOptions = {
                    position: position,
                    map: _map,
                    title: pointDescription.title
                },
                _this = this;

            if (pointDescription.marker) {
                if (pointDescription.imageSize == 1) {
                    var Icon = {
                        url: pointDescription.marker,
                        size: new google.maps.Size(pointDescription.imageWidth * 2, pointDescription.imageHeight * 2),
                        scaledSize: new google.maps.Size(pointDescription.imageWidth, pointDescription.imageHeight),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(pointDescription.imageWidth / 2, pointDescription.imageHeight)
                    };

	                var Shape = {
		                type: 'rect',
		                coord: [0, 0, pointDescription.imageWidth, pointDescription.imageHeight]
	                };

                    var anchorPoint = new google.maps.Point(0, -pointDescription.imageHeight);

	                $.extend(markerOptions, {icon: Icon, shape: Shape, anchorPoint: anchorPoint});
                } else {
	                $.extend(markerOptions, {icon: pointDescription.marker});
                }
            } else if (gme.mapSettings.markerImage) {
                $.extend(markerOptions, {icon: gme.mapSettings.markerImage});
            }
            var marker = new google.maps.Marker(markerOptions);

            if (gme.mapSettings.markerCluster == 1) {
                google.maps.event.addListener(marker, 'visible_changed', function () {
                    if (marker.getVisible()) {
                        $element.markerCluster.addMarker(marker, true);
                    } else {
                        $element.markerCluster.removeMarker(marker, true);
                    }
                });
            }

            if (pointDescription.infoWindowContent != "" || pointDescription.infoWindowLink > 0) {
                var infoWindowContent = pointDescription.infoWindowContent;
                if (pointDescription.infoWindowLink > 0) {
                    var daddr = (pointDescription.infoWindowLink == 2) ? pointDescription.latitude + ", " + pointDescription.longitude : pointDescription.address;
                    infoWindowContent += '<p class="routeLink btn"><a class="routeLinklink" href="//www.google.com/maps/dir/?api=1&destination=' + encodeURI(daddr) + '" target="_blank">' + gme.ll.infoWindowLinkText + '<\/a><\/p>';
                    setTimeout(function() {
                        $('.tx-go-maps .infowindow .infowindow .infowindow-content').append($('.routeLink'));
                    }, 300);
                }
                //infoWindowContent = '<div class="gme-info-window">' + infoWindowContent + '</div>';

                if (pointDescription.openByClick) {
                    google.maps.event.addListener(marker, "click", function () {
                        if (!infoWindow.getMap() || gme.infoWindow != this.getPosition()) {
                           /*infoWindow.setContent(infoWindowContent);*/
                            /*infoWindow.open(_map, this);             */
                            /*gme.infoWindow = this.getPosition();     */
                            
                            if(typeof(window.goTrackEvent) == 'function') {
                                window.goTrackEvent('gmap - open info window', 'click',  '"' + marker.title + '"');
                            }

                            //$('.tx-go-maps').addClass('infowindowActive');
                            $(window).trigger('resize');
                            
                            _this.focusAddress(pointDescription.uid, $element, gme);
                        }
                    });
                } else {
                    google.maps.event.addListener(marker, "mouseover", function () {
                        if (!infoWindow.getMap() || gme.infoWindow != this.getPosition()) {
                            /*infoWindow.setContent(infoWindowContent);  */
                            /*infoWindow.open(_map, this);               */
                            //gme.infoWindow = this.getPosition();       */
                            
                            if(typeof(window.goTrackEvent) == 'function') {
                                window.goTrackEvent('gmap - open info window', 'mouseover',  '"' + marker.title + '"');
                            }
                            
                            _this.focusAddress(pointDescription.uid, $element, gme);
                        }
                    });
                }
                if (!pointDescription.closeByClick) {
                    google.maps.event.addListener(marker, "mouseout", function () {

                        if(typeof(window.goTrackEvent) == 'function') {
                            window.goTrackEvent('gmap - close info window', 'mouseout',  ' - "' + marker.title + '"');
                        }
                    
                        //$('.tx-go-maps').removeClass('infowindowActive');
                        $(window).trigger('resize');

                        infoWindow.close();
                    });
                }
                if (pointDescription.opened) {

                    $element.off("openinfo").on("openinfo", function () {
                        //infoWindow.setContent(infoWindowContent);
                        //infoWindow.open(_map, marker);
                        
                        if(typeof(window.goTrackEvent) == 'function') {
                            window.goTrackEvent('gmap - open info window', 'initialOpen',  '"' + pointDescription.title + '"');
                        }

                        //$('.tx-go-maps').addClass('infowindowActive');
                        $(window).trigger('resize');
                        
                        
                        _this.focusAddress(pointDescription.uid, $element, gme);
                    });
                    //gme.infoWindow = marker.getPosition();
                }


                infoWindow.setContent(infoWindowContent);
                marker.infoWindowContent = infoWindowContent;
                marker.infoWindow = infoWindow;
            }
            marker.categories = pointDescription.categories.split(",");
            marker.uid = pointDescription.uid;
            this.markers.push(marker);
            this.bounds.extend(position);
        },

        resize: function() {
            var _map = this.map,
                gme = this.data;

            google.maps.event.trigger(_map, 'resize');
            _map.fitBounds(this.bounds);
            if (gme.mapSettings.zoom > 0) {
                _map.setZoom(gme.mapSettings.zoom);
            }
            this.refreshMap(this.element, gme);
            google.maps.event.trigger(this.infoWindow, 'content_changed');
        },

        /**
         * Set zoom, center and cluster
         *
         * @param $element
         * @param gme
         */
        refreshMap: function ($element, gme) {
            var _map = this.map;
            if (gme.mapSettings.zoom > 0 || gme.addresses.length == 1) {
                google.maps.event.addListener(_map, "zoom_changed", function () {
                    var zoomChangeBoundsListener = google.maps.event.addListener(_map, "bounds_changed", function () {
                        if (this.initZoom == 1) {
                            this.setZoom((gme.mapSettings.zoom > 0) ? gme.mapSettings.zoom : gme.mapSettings.defaultZoom);
                            this.initZoom = 0;
                        }
                        google.maps.event.removeListener(zoomChangeBoundsListener);
                    });
                });
                _map.initZoom = 1;
            }

            if ($element.data("center")) {
                _map.setCenter($element.data("center"));
            } else if(gme.mapSettings.lat && gme.mapSettings.lng) {
                _map.setCenter(new google.maps.LatLng(gme.mapSettings.lat, gme.mapSettings.lng));
                _map.setZoom(gme.mapSettings.zoom);
            } else {
                _map.fitBounds(this.bounds);
            }

            this.refreshCluster($element, gme);
        },

        /**
         * refresh the cluster
         *
         * @param $element
         * @param gme
         */
        refreshCluster: function ($element, gme) {
            if (gme.mapSettings.markerCluster == 1) {
                if ($element.markerCluster != null) {
                    $element.markerCluster.clearMarkers();
                }

                $element.markerCluster = new MarkerClusterer(this.map, this.markers, {
                    imagePath: gme.mapSettings.markerClusterImage,
                    styles: gme.mapSettings.markerClusterStyle,
                    maxZoom: gme.mapSettings.markerClusterZoom,
                    gridSize: gme.mapSettings.markerClusterSize
                });
            }
        },

        _initializeCss: function () {
            this.element
                .css("width", this.gme.mapSettings.width)
                .css("height", this.gme.mapSettings.height);
        },
        _initializeData: function () {
            var $element = this.element,
                gme = this.data,
                _map = this.map;

            $element.data("map", _map);

            // styled map
            if (gme.mapSettings.styledMapCode) {
                var myStyle = gme.mapSettings.styledMapCode,
                    styledMapOptions = {
                        name: gme.mapSettings.styledMapName,
                        alt: gme.mapSettings.tooltipTitle
                    },
                    myMapType = new google.maps.StyledMapType(
                        myStyle,
                        styledMapOptions
                    );
                _map.mapTypes.set(gme.mapSettings.styledMapName, myMapType);
            }

            if (gme.mapSettings.defaultType == 3 && gme.mapSettings.styledMapName) {
                _map.setMapTypeId(gme.mapSettings.styledMapName);
            }

        },

        _createMapOptions: function () {
            var gme = this.gme;
            return {
                zoom: gme.mapSettings.defaultZoom,
                minZoom: gme.mapSettings.minZoom,
                maxZoom: gme.mapSettings.maxZoom,
                center: new google.maps.LatLng(0, 0),
                geolocation: gme.mapSettings.geolocation,
                draggable: gme.mapSettings.draggable,
                disableDoubleClickZoom: gme.mapSettings.doubleClickZoom,
                scrollwheel: gme.mapSettings.scrollZoom,
                scaleControl: gme.mapSettings.scaleControl,
                streetViewControl: gme.mapSettings.streetviewControl,
                fullscreenControl: gme.mapSettings.fullscreenControl,
                zoomControl: gme.mapSettings.zoomControl,
                mapTypeId: gme.defaultMapTypes[gme.mapSettings.defaultType],
                mapTypeControl: gme.mapSettings.mapTypeControl,
                mapTypeControlOptions: {mapTypeIds: gme.mapSettings.mapTypes},
                infowindowStyle: gme.mapSettings.infowindowStyle
            };
        },

        _initializeKmlImport: function () {
            var _this = this,
                _map = this.map,
                gme = this.data,
                Route = this.route,
                $element = this.element;

            // KML import
            if (gme.mapSettings.kmlUrl != '' && gme.mapSettings.kmlLocal == 0) {
                var kmlLayer = new google.maps.KmlLayer(gme.mapSettings.kmlUrl, {preserveViewport: gme.mapSettings.kmlPreserveViewport});
                kmlLayer.setMap(_map);
            }

            // KML import local
            if (gme.mapSettings.kmlUrl != '' && gme.mapSettings.kmlLocal == 1) {
                $.get(gme.mapSettings.kmlUrl, function (data) {

                    //loop through placemarks tags
                    $(data).find("Placemark").each(function () {
                        //get coordinates and place name
                        var coords = $(this).find("coordinates").text(),
                            place = $(this).find("name").text(),
                            description = $(this).find("description").text(),
                            c = coords.split(","),
                            address = {
                                title: place,
                                latitude: c[1],
                                longitude: c[0],
                                address: place,
                                marker: '',
                                imageSize: 0,
                                imageWidth: 0,
                                imageHeight: 0,
                                infoWindowContent: description,
                                infoWindowLink: 0,
                                openByClick: 1,
                                closeByClick: 1,
                                opened: 0,
                                categories: ''
                            };
                        _this.addMapPoint(address, Route, $element, _this.infoWindow, gme);
                        gme.addresses.push(address);
                    });
                });
            }
        },

        _initializeGeolocation: function () {
            var _this = this,
                _map = this.map,
                gme = this.data;

            // geolocation
            if (gme.mapSettings.geolocation == 1) {
                var myloc = new google.maps.Marker({
                    clickable: false,
                    icon: {
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 9,
                      fillColor: '#408fff',
                      fillOpacity: 1,
                      strokeColor: 'white',
                      strokeWeight: 3
                    },
                    zIndex: 999,
                    map: _map
                });

                if (navigator.geolocation) navigator.geolocation.getCurrentPosition(function(pos) {
                    var me = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                    myloc.setPosition(me);
                    var mycenter = {
                        lat: pos.coords.latitude, 
                        lng: pos.coords.longitude
                    };
                    _map.setCenter(mycenter);
                }, function(error) {
                    console.log('could not get position');
                });
            }
        },

        _initializeSearch: function () {
            var _this = this,
                gme = this.data,
                $element = this.element,
                $myForm = $('#' + gme.mapSettings.id + '-form'),
                searchParameter = this.getURLParameter('sword'),
                searchIn = $myForm.find('.js-gme-saddress').get(0);

                console.log('search init');

            if(typeof(searchIn) != "undefined") {
                searchIn.value = searchParameter ? searchParameter : '';
                $('.js-gme-saddress').val(decodeURIComponent(searchIn.value));
            }
          
            // Search
            // Create the search box and link it to the UI element.
            var autocompleteOptions = {
                //componentRestrictions: {country: ['de','at','it','ch','sl','cs','hu','hr']}
            };
            
            if(typeof(searchIn) != 'undefined') {
                var searchBox = new google.maps.places.Autocomplete(searchIn, autocompleteOptions);
                searchBox.bindTo('bounds', _this.map);
                
                google.maps.event.addListener(searchBox, 'place_changed', function() {
                    
                    //searchBox.addListener('places_changed', function() {
                    //_this._searchBoxPlacesChanged(searchBox);
                    _this._searchAddressByInput(searchIn.value);
                });
            }
            
            
            $myForm.on('submit', function(e) {
                e.preventDefault();
                log("searchBox 2");
                log(searchIn.value);
                
                if(typeof(window.goTrackEvent) == 'function') {
                    window.goTrackEvent('gmap - search form', 'submit', '"' + $('#' + gme.mapSettings.id + '-search').find('.js-gme-sword').val() + '"');
                }
                
                if(typeof(searchIn) != 'undefined') {
                    //google.maps.event.trigger(searchIn, 'focus');
                    //google.maps.event.trigger(searchIn, 'keydown', {
                    //    keyCode: 13
                    //});
                    
                    _this._searchAddressByInput(searchIn.value);
                }
            });
            
            
            window.setTimeout(function() {
                if(typeof(searchParameter) != 'undefined' && searchParameter) {
                    $myForm.trigger('submit');
                }
                var supportsOrientationChange = "onorientationchange" in window;
                var orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";
                
                $(window).trigger(orientationEvent);
            }, 500);

        },

        _searchAddressByInput: function(addressInput) {
            var _this = this,
                gme = this.data,
                $element = this.element,
                _map = this.map,
                $myForm = $('#' + gme.mapSettings.id + '-search'),
                searchIn = $myForm.find('.js-gme-sword').get(0);

            if(typeof(window.goTrackEvent) == 'function') {
                window.goTrackEvent('gmap - address search', 'submit', '"' + addressInput + '"');
            }
                
            $element.data("geocoder").geocode(
                {
                    "address": addressInput
                },
                function(point, status) {
                    
                    var searchedAddressObj;
                    
                    $(point).each(function(key, curResult){
                            var curAddressComponent = curResult.address_components[0];
                            searchedAddressObj = curResult;
                            
                            $(curAddressComponent.types).each(function(key, curType){
                                if (curType == 'country') {
                                    searchedCountry = true;
                                }
                            });
                    });
                    
                    var coordsOrigin = new Array(searchedAddressObj.geometry.location.lat(), searchedAddressObj.geometry.location.lng());
                   
                    $('.gme-addresses > li').slideUp();

                    //Anpassungen vornehmen:
                    for (var addressIndex in gme.addresses) {
                        gme.addresses[addressIndex].distance = _this._calcDistance(coordsOrigin, new Array(gme.addresses[addressIndex].latitude, gme.addresses[addressIndex].longitude)).toFixed(2) + ' km';

                        //console.log(gme.addresses[addressIndex]);
            
                        //das alles verwerfen und die address Json (gme.addresses[addressIndex]) on the fly mit distance bestücken.
                        //Pseudo Code: gme.addresses[addressIndex].distance = _this._calcDistance(coordsOrigin, markerLocation);
                        
                        //var address = gme.addresses[addressIndex];
                        //var $addressElement = $('.js-gme-address[data-address="' + address.uid + '"]');
                        //var markerLocation = new Array(address.latitude, address.longitude);
                        //var distance = _this._calcDistance(coordsOrigin, markerLocation);
                        //$addressElement.attr('data-distance', distance);
                        //$addressElement.parent().find('.distance').text(distance.toFixed(2) + 'km');
                        //$addressElement.parent().attr('data-distance', distance);


                    }
                    gme.addresses.sort(function(a, b) {
                        return parseFloat(a.distance) - parseFloat(b.distance);
                    });

                    addressList = gme.addresses.slice(0, 20);

                    var addressUids = new Array();

                    //ausleeren
                    $('.gme-addresses > li').remove();
                    for(var addressIndex in addressList) {
                        $('.gme-addresses').append('<li><a data-address="'+ addressList[addressIndex].uid +'" class="js-gme-address" href="#"><span class="title">' + addressList[addressIndex].title + '</span><br>' + addressList[addressIndex].address + ' . ' + addressList[addressIndex].zip + ' ' + addressList[addressIndex].city + ' . ' + addressList[addressIndex].country  +'<br><span class="distance">' + addressList[addressIndex].distance + '</span></a></li>');                   
                        addressUids.push(addressList[addressIndex].uid+ '');
                    }

                   $('.gme-addresses > li').slideDown();
                   
                   
                    var newBounds = new google.maps.LatLngBounds();
            
                    // Clear out the old markers.
                    $.each(_this.markers, function(key, marker) {
                        if ($.inArray(marker.uid.toString(), addressUids) > -1) {
                            marker.setVisible(true);
                            newBounds.extend(marker.position);
                        } else {
                            marker.setVisible(false);
                        }
                    });
            
                    _this.bounds = newBounds;
                    _map.fitBounds(_this.bounds);
                    
                    $('.locationList').addClass('act');
                    $('.tx-go-maps .leftSide').addClass('open');
                    $('.tx-go-maps .leftSide').addClass('open');
                    $('#' + gme.mapSettings.id + '-infowindow').removeClass('open');

                    $('.gme-addresses > li a').on('click', function() {
                        var uid = $(this).attr("data-address");
                        _this.focusAddress(uid, $element, gme);
                    });

                    return;
                    
                }
            );
        },

        _initializeBackendAddresses: function () {
            var _this = this,
                gme = this.data,
                $element = this.element,
                Route = this.route,
                infoWindow = this.infoWindow;

            // Add backend addresses
            if (gme.mapSettings.showRoute == 0) {
                $element.data("geocoder", new google.maps.Geocoder());
                if ($element.data("geocoder")) {
                    for (var addressIndex in gme.addresses) {
                        var address = gme.addresses[addressIndex];
                        _this.addMapPoint(address, Route, $element, infoWindow, gme);
                    }

                }
            }
        },

        _initializeRoute: function () {
            var _this = this,
                _map = this.map,
                gme = this.data,
                $element = this.element;

            // init Route function
            if (gme.mapSettings.calcRoute == 1) {
                var panelHtml = $('<div id="dPanel-' + gme.mapSettings.id + '"><\/div>'),
                    directionsService = new google.maps.DirectionsService(),
                    directionsDisplay = new google.maps.DirectionsRenderer();

                panelHtml.insertAfter($element);

                var renderRoute = function ($start, $end, $travelMode, $unitSystem) {
                    var unitSystem = _this.getUnitSystem($unitSystem),
                        request = {
                            origin: $start,
                            destination: $end,
                            travelMode: _this.getTravelMode($travelMode)
                        };

                    directionsDisplay.setMap(_map);
                    directionsDisplay.setPanel(document.getElementById("dPanel-" + gme.mapSettings.id));

                    if (unitSystem != 0) {
                        request.unitSystem = unitSystem;
                    }

                    directionsService.route(request, function (response, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            directionsDisplay.setDirections(response);
                        } else {
                            alert(gme.ll.alert);
                        }
                    });
                };
            }

            // show route from backend
            if (gme.mapSettings.showRoute == 1) {
                renderRoute(gme.addresses[0].address, gme.addresses[1].address, gme.mapSettings.travelMode, gme.mapSettings.unitSystem);
            }

            // show route from frontend
            if (gme.mapSettings.showForm == 1) {
                var $mapForm = $('#' + gme.mapSettings.id + '-form'),
                    searchIn = $mapForm.find('.js-gme-saddress').get(0);
            
                $mapForm.on('submit', function(e) {
                    e.preventDefault();
                    
                    var formStartAddress = $mapForm.find('.js-gme-saddress').val(),
                        endAddressIndex = $mapForm.find('.js-gme-eaddress option:selected').val();
                        
                    if(typeof(endAddressIndex) != 'undefined') {
                        var formEndAddress = gme.addresses[parseInt(endAddressIndex)].address;
                    } else {
                        for (var addressIndex in gme.addresses) {
                            var address = gme.addresses[addressIndex];
                            if(address && !formEndAddress) {
                                var formEndAddress = address.address;
                            }
                        }
                    }
                    
                    var formTravelMode = $mapForm.find('.js-gme-travelmode').val(),
                        formUnitSystem = $mapForm.find('.js-gme-unitsystem').val();

                    if (formStartAddress == null) {
                        formStartAddress = gme.addresses[0].address;
                        formEndAddress = gme.addresses[1].address;
                    }

                    if (formTravelMode == null) {
                        formTravelMode = gme.mapSettings.travelMode;
                    } else {
                        formTravelMode = parseInt(formTravelMode);
                    }
                    if (formUnitSystem == null) {
                        formUnitSystem = gme.mapSettings.unitSystem;
                    } else {
                        formUnitSystem = parseInt(formUnitSystem);
                    }

                    renderRoute(formStartAddress, formEndAddress, formTravelMode, formUnitSystem);
                    return false;
                });
            }
        },

        _initializeResizeListener: function () {
            var _this = this,
                width = $(this.element).width();

            // eventHandler resize can be used
            this.element.bind('mapresize', function () {
                // resize only when the window width changes, not while hiding a browser bar
                if($(this).width() != width) {
                    width = $(this).width();
                    _this.resize();
                }
            });
        },

        _initializeCheckboxListener: function () {
            var _this = this,
                $element = this.element,
                gme = this.gme;

            // categories checkboxes
            $('.js-gme-cat').change(function () {
                var selectedCats = $('.js-gme-cat:checked').map(function () {
                    return this.value;
                });
                if(selectedCats.length > 0) {
                    _this.setCategories(selectedCats);
                } else {
                    $.each(_this.markers, function (key, marker) {
                        marker.setVisible(true);
                    }); 
                    
                }
                _this.refreshMap($element, gme);
            });
        },

        _initializeAddressListener: function () {
            var _this = this,
                $element = this.element,
                gme = this.gme;

            $('.js-gme-address').click(function (e) {
                var selectedAddress = [$(this).attr('data-address')];

                if(typeof(window.goTrackEvent) == 'function') {
                    window.goTrackEvent('gmap - address list', 'click', '"' + gme.addresses[parseInt($(this).attr('data-address'))].title + '"');
                }

                //$('.tx-go-maps').addClass('infowindowActive');
                $(window).trigger('resize');

                _this.focusAddress(selectedAddress, $element, gme);
                return false;
            });
        },
        

        _calcDistance: function(origin, destination, factor, type) {
            var _this = this,
                $element = this.element,
                gme = this.gme;

            // 0 = lat; 1 = lon
            origin = (typeof(origin) != 'undefined') ? origin : [0, 0];
            destination = (typeof(destination) != 'undefined') ? destination : [0, 0];
            factor = (typeof(factor) != 'undefined') ? factor : 0.001;
            type = (typeof(type) != 'undefined') ? type : 'spherical';
            // values using WGS84 epllipsoid
            var earth = [];
            earth['semi-major_axis'] = 6378137.000; // Semi-major axis (a) of earth
            earth['semi-minor_axis'] = 6356752.314245; // Semi-major axis (b) of earth
            earth['flattening'] = 1 / 298.257223563; // inverse flattening
            earth['volumetric_radius'] = 6371000.789974; // volumetric earth radius (R3) = cuberoot(aÂ²b)

            var distance = earth['volumetric_radius'] * Math.acos(
                Math.sin(_this._toRadians(origin[0])) * Math.sin(_this._toRadians(destination[0])) + Math.cos(_this._toRadians(origin[0])) * Math.cos(_this._toRadians(destination[0])) * Math.cos(_this._toRadians(origin[1] - destination[1])));
            return parseFloat(distance * factor);
        },


        _toRadians: function(angle) {
            return angle * (Math.PI / 180);
        },

        _toDegrees: function(angle) {
            return angle * (180 / Math.PI);
        },

        _sortAddressListByDistance: function() {
            $('.gme-addresses').find('> li').sort(function(a, b) {
                return +a.getAttribute('data-distance') - +b.getAttribute('data-distance');
            }).appendTo($('.gme-addresses'));
        }
    };

    // create a new Google Map
    $.fn.gomaps = function (gme) {
        var $element = $(this);
        if (!$element.data('gomapscontroller')) {
            $element.data('gomapscontroller', new GoMaps.Controller($element, gme));
        }
    };
}(jQuery));