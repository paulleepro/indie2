'use strict';

const {h, render, Component} = require('preact');
const {forEach, isEqual} = require('lodash');

class LocationsMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      locations: props.locations || [],
      lng: props.lng || -81.58559917499997,
      lat: props.lat || 40.49386275928866,
      searchExpanded: props.searchExpanded,
      zoom: 10,
      map: null,
      markers: [],
      country: 'us',
      activeMarker: null
    };

    this.setMap = this.setMap.bind(this);
    this.setMarkers = this.setMarkers.bind(this);
  }

  componentDidMount() {
    this.setMap();

    window.addEventListener("location-selected", (e) => {
      const {map} = this.state;
      if (!!map) map.flyTo({center: [e.detail.lng, e.detail.lat]});

      this.setState({activeMarker: e.detail.id}, this.setMarkers);
    });
  }

  componentWillReceiveProps(nextProps) {
    // if selected origin has changed, reset map center
    if (!isEqual(this.props, nextProps)) {
      this.setState(nextProps, this.setMap);
    }
  }

  setMap() {
    const {lng, lat, zoom, map, locations, searchExpanded} = this.state;

    // make new Mapbox GL client if not yet set
    if (!map) {
      let newMap = new mapboxgl.Map({
        container: this.mapContainer,
        style: 'mapbox://styles/kwukasch/cjf8rsit25bl82rpazfmoj4jf',
        center: [lng, lat],
        zoom
      });

      newMap.addControl(new mapboxgl.NavigationControl(), 'bottom-left');
      newMap.scrollZoom.disable();

      this.setState({map: newMap}, this.setMarkers);
    } else {
      // zoom required in case user manually updated zoom
      if (searchExpanded < 1) {
        map.flyTo({center: [lng, lat], zoom: zoom});
      } else {
        map.flyTo({center: [locations[0].lng, locations[0].lat], zoom: zoom - 1 - searchExpanded});
      }

      this.setMarkers();
    }
  }

  // setMarkers need to run after setMap
  setMarkers() {
    const {locations, map, markers, activeMarker} = this.state;

    // first remove markers if any
    forEach(markers, marker => marker.remove());

    let newMarkers = [];

    forEach(locations, (location, i) => {
      let div = document.createElement('div');

      div.className = 'storeLocator__marker';

      if (activeMarker && (activeMarker === location.id)) {
        div.className += " active";
      }

      div.addEventListener("click", (e) => {
        window.dispatchEvent(new CustomEvent('location-selected', {
          detail: {lng: location.lng, lat: location.lat, id: location.id}
        }));
      });

      let marker = new mapboxgl.Marker(div)
          .setLngLat([parseFloat(location.lng), parseFloat(location.lat)]) 
          .addTo(map);

      newMarkers.push(marker);
    });

    this.setState({markers: newMarkers});
  }

  render() {
    return (<div ref={el => this.mapContainer = el} className="locationsMap vh-50 vh-100-l z-0"></div>);
  }
}

module.exports = LocationsMap;