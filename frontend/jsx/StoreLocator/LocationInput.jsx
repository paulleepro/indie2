'use strict';

const {h, render, Component} = require('preact');
const {find} = require('lodash');

class LocationInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inputValue: null
    };

    this.onChange = this.onChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  componentDidMount() {
    // enable enter key press as submit
    this.input.addEventListener("keyup", (e) => {
      e.preventDefault();

      if (e.keyCode === 13) {
        this.setState({inputValue: this.input.value}, this.submit);
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    // if selectedOrigin is being set by clientLocation, get zipcode and set input value
    if (!this.state.inputValue && !!nextProps.selectedOrigin) {
      this.props.mapboxClient.geocodeReverse(
        {
          latitude: nextProps.selectedOrigin.lat, 
          longitude: nextProps.selectedOrigin.lng
        }, (err, data, res) => {
          // data.features is a list of location subsets
          const zipcodeData = find(data.features, (feature) => {
            return feature.id.includes('postcode');
          });

          this.setState({inputValue: zipcodeData.text});
        }
      );
    }
  }

  onChange(e) {
    this.setState({inputValue: e.target.value});
  }

  submit() {
    const {mapboxClient, onSubmit} = this.props;
    const {inputValue} = this.state;

    mapboxClient.geocodeForward(inputValue+", us", (err, data, res) => {
      onSubmit({
        lng: data.features[0].center[0],
        lat: data.features[0].center[1]
      });
    });
  }

  render() {
    const {inputValue} = this.state;

    return (
      <div className="locationInput db pv3 ph3 bg-white ba br2 b--moon-gray">
        <label className="mb2 f5 b black ttu tracked" for="locationInput">Search by location</label>
        <input 
          ref={el => this.input = el}
          className="locationInput__field w-100 ph0 mt1 f4 bg-white navy outline-0 bn"
          id="locationInput"
          type="text" 
          placeholder="Enter city or zip code"
          value={inputValue} 
          onChange={this.onChange} 
        />
      </div>
    );
  }
}

module.exports = LocationInput;