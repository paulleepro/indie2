'use strict';

const {h, render, Component} = require('preact');
const MapboxClient = require('mapbox');
const {round, filter, intersection} = require('lodash');

const LocationInput = require('./LocationInput.jsx');
const LocationsList = require('./LocationsList.jsx');
const LocationsMap = require('./LocationsMap.jsx');
const LocationsScroller = require('./LocationsScroller.jsx');
const MobileToggleButton = require('./MobileToggleButton.jsx');

const mapboxApiKey = 'pk.eyJ1IjoiaW5kaWVsZWUiLCJhIjoiY2pqNGVsdjlzMTY5MjNwcGNvdWQxYXlydSJ9.XiSB6XHZULnIAKVRDyPTuQ';    //@TODO:: update mapbox access token

class StoreLocator extends Component {
  constructor(props) {
    super(props);

    this.mapboxClient = new MapboxClient(mapboxApiKey);

    this.state = {
      focused: false,
      locationsLoading: true,
      locationsError: null,
      selectedOrigin: null,
      locations: [],
      searchExpanded: 0,
      distModifier: 4,
      mobileToggle: "map"
    };

    this.getDefaultOrigin = this.getDefaultOrigin.bind(this);
    this.getLocations = this.getLocations.bind(this);
    this.setMobileToggle = this.setMobileToggle.bind(this);
    this.setOrigin = this.setOrigin.bind(this);
  }

  componentDidMount() {
    this.getDefaultOrigin();

    window.addEventListener('location-selected', this.getDefaultOrigin);
  }

  getDefaultOrigin() {
    if (!window.localStorage.getItem('clientLocation')) {
      this.getClientLocation();
    }

    const clientLocation = window.localStorage.getItem('clientLocation');

    if (!!clientLocation) {
      this.setState({selectedOrigin: JSON.parse(clientLocation)}, this.getLocations);
    }
  }

  //Client Location Funcs
  getClientLocation() {
    const options = {
      enableHighAccuracy : true,
      timeout : Infinity,
      maximumAge : 0
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.setPosition, this.showError, options);
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }

  setPosition(position) {
    window.localStorage.setItem('clientLocation', JSON.stringify({lat: position.coords.latitude, lng: position.coords.longitude}));

    window.dispatchEvent(new CustomEvent('location-selected', {
      detail: {lng: position.coords.longitude, lat:  position.coords.latitude}
    }));
  }

  showError(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        console.error("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        console.error("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        console.error("The request to get user location timed out.");
        break;
      default:
        console.error("An unknown error occurred.");
    }
  }

  //Store Locator Funcs
  getLocations() {
    const {selectedOrigin} = this.state;

    if (!selectedOrigin || !selectedOrigin.lat || !selectedOrigin.lng) {
      console.error("Geolocation incomplete!");
      alert("There was an error geolocating your position, please use the input field to use the store locator.");
      return;
    }

    // get absolute value of longitude according to latitude
    const lngDegree = Math.abs(Math.cos(selectedOrigin.lat));

    $.get('airtable/store-locations', {
      latMin: selectedOrigin.lat - 1/this.state.distModifier,
      latMax: selectedOrigin.lat + 1/this.state.distModifier,
      lngMin: selectedOrigin.lng - lngDegree/this.state.distModifier,
      lngMax: selectedOrigin.lng + lngDegree/this.state.distModifier
    })
      .done((data) => {
        //expand search radius
        if (data.length < 1) {
          this.state.searchExpanded++;
          this.state.distModifier = this.state.distModifier/2;
          this.getLocations(this.state.distModifier);
        }
        //calc dist form origin for each row
        data.forEach((item) => {
          item.distance = round(Utils.distanceBetween(item.lat, item.lng, selectedOrigin.lat, selectedOrigin.lng, "N"), 1);
        });
        //filter data, sort by distance, take top 20 only
        data.sort((a,b) => {
          return a.distance > b.distance ? 1 : b.distance > a.distance ? -1 : 0;
        })

        data.splice(50);

        // setting state locations will trigger rerender
        this.setState({locations: data});
      })
      .catch((err) => {
        console.error(err);
      });
  }

  setOrigin(selectedOrigin) {
    this.setState({selectedOrigin}, this.getLocations);
  }

  setMobileToggle(name) {
    this.setState({mobileToggle: name});
  }

  render() {
    const {selectedOrigin, locations, searchExpanded, mobileToggle} = this.state;

    return (
      <div className="storeLocator flex flex-column flex-row-l bg-offwhite">
        <div className="storeLocator__panel flex flex-column justify-center w-100 w-third-l vh-100-l pb3 overflow-hidden">
          <div className="storeLocator__header w-100 pv3 ph3 ph4-l">
            <h1 class="super-clarendon f1">Stockists</h1>
            <LocationInput 
              onSubmit={this.setOrigin} 
              selectedOrigin={selectedOrigin} 
              mapboxClient={this.mapboxClient} 
            />
          </div>
          <div className="storeLocator__mobileToggleWrapper flex flex-row dn-l pa3">
            <MobileToggleButton
              name="map"
              onClick={this.setMobileToggle}
              active={mobileToggle === "map"}
            />
            <MobileToggleButton
              name="list"
              onClick={this.setMobileToggle}
              active={mobileToggle === "list"}
            />
          </div>
          <div className={
            "storeLocator__locationsWrapper" +
             (mobileToggle === "list" ? " storeLocator__locationsWrapper--active-mobile" : "") + 
             " relative w-100"
          }>
            <LocationsList 
              locations={locations} 
              selectedOrigin={selectedOrigin}
            />
          </div>
        </div>
        <div className={
          "storeLocator__map"  + 
          (mobileToggle === "map" ? " storeLocator__map--active-mobile" : "") + 
          " w-100 w-two-thirds-l vh-100"
        }>
          <LocationsMap 
            lng={selectedOrigin && parseFloat(selectedOrigin.lng)} 
            lat={selectedOrigin && parseFloat(selectedOrigin.lat)} 
            locations={locations}
            searchExpanded={searchExpanded}
          />
          <LocationsScroller
            locations={locations} 
            selectedOrigin={selectedOrigin}
          />
        </div>
        <div className="cf"></div>
      </div>
    );
  }
}
(() => {
  // need to listen to turbolinks:load for every page nav
  // render checkout when navigating to /stockists
  document.addEventListener('turbolinks:load', () => {
    if (window.location.pathname.indexOf("stockists") >= 0) {
      if (!!mapboxgl) mapboxgl.accessToken = mapboxApiKey;
      render(<StoreLocator />, document.getElementById("stockists__map"));
    }
  });
})();
