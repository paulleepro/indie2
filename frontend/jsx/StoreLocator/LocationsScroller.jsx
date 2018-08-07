'use strict';

const {h, render, Component} = require('preact');

const LocationsScrollerItem = require('./LocationsScrollerItem.jsx');

class LocationsScroller extends Component {
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
        const offset = $(`.locationsScrollerItem[data-ref='${e.detail.id}']`).offset().left -  $(".locationsScroller__inner").offset().left + $(".locationsScroller__inner").scrollLeft();
        $(".locationsScroller__inner").animate({ scrollLeft: offset}, 250, 'swing');
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
      <div className="locationsScroller db dn-l pt3 ph3">
        <div class="locationsScroller__inner hzScroller pl3 mv1 overflow-x-scroll overflow-y-hidden">
          {locations.map((location, i) => {
            return (
              <LocationsScrollerItem 
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
    );
  }
}

module.exports = LocationsScroller;