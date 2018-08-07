'use strict';

const {h, render, Component} = require('preact');
const {round, filter, isEqual} = require('lodash');

class LocationsScrollerItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {index, location, onToggle, selectedLocation} = this.props;
    const isSelected = !!selectedLocation && selectedLocation.id === location.id;

    return (
      <div 
        className="locationsScrollerItem hzScroller__item relative border-box w-80 w-40-m pt5 ph3 pb3 mt2 mr3 mb4 bg-white pointer"
        data-ref={location.id} 
        onClick={e=>onToggle(location)}
      >
        <div>
          <h3 className="super-clarendon f4 black">{location.title}</h3>
          <p className="mb0 fw1 mid-gray">{location.address}</p>
          <p className="mb0 fw1 black">{location.phone}</p>
        </div>
      </div>
    );
  }
}

module.exports = LocationsScrollerItem;