'use strict';

const {h, render, Component} = require('preact');

const LocationsListItem = require('./LocationsListItem.jsx');

class LocationsList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedLocation: null
    };

    this.toggleLocation = this.toggleLocation.bind(this);
  }

  componentDidMount() {
    //This event is either fired inside toggleLocation (list click) or via the map (pin click)
    window.addEventListener("location-selected", (e) => {
      this.setState({selectedLocation: e.detail});
      if (e.detail.id) {
        const offset = $(`.locationsListItem[data-ref='${e.detail.id}']`).offset().top -  $(`.locationsListItem[data-ref='${e.detail.id}']`).parent().offset().top;

        $(".locationsList__inner").animate({ scrollTop: offset}, 250, 'swing');
      }
    });
  }

  toggleLocation(location) {
    const {selectedLocation} = this.state;

    if (!selectedLocation || selectedLocation.id !== location.id) {
      // trigger event to map for new flyTo center
      window.dispatchEvent(new CustomEvent('location-selected', {
        detail: {lng: location.lng, lat: location.lat, id: location.id}
      }));
    } else {
      this.setState({selectedLocation: null});
    }
  }

  render() {
    const {locations, selectedOrigin} = this.props;
    const {selectedLocation} = this.state;

    return (
      <div className="locationsList h-100">
        <h5 className="ph3 ph4-l navy">Stockists near you</h5>
        <div class="locationsList__inner h-100 mv1 overflow-x-hidden overflow-y-scroll">
          <div>
            {locations.map((location, i) => {
              return (
                <LocationsListItem 
                  index={i}
                  location={location} 
                  selectedLocation={selectedLocation}
                  selectedOrigin={selectedOrigin}
                  onToggle={this.toggleLocation}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = LocationsList;