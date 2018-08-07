'use strict';

/* NOTE
 *
 * This component is used to display static/edit form for a pre-existing address
 * or to submit a new address.
 */

const {h, render, Component} = require('preact');

const find = require('lodash/find');
const findIndex = require('lodash/findIndex');
const cloneDeep = require('lodash/cloneDeep');
const flow = require('lodash/fp/flow');
const map = require('lodash/fp/map');
const sortBy = require('lodash/fp/sortBy');

const FieldsetInput = require('../Form/FieldsetInput.jsx');
const FieldsetCheckbox = require('../Form/FieldsetCheckbox.jsx');
const FieldsetSelect = require('../Form/FieldsetSelect.jsx');
const FieldsetButton = require('../Form/FieldsetButton.jsx');

const {ERROR_MESSAGES} = require('../../constants.js');

class Address extends Component {
  constructor(props) {
    super(props);

    const {edit, address} = props;

    this.state = {
      edit: edit || false,
      firstname: address ? address.firstname : null,
      lastname: address ? address.lastname : null,
      street1: address ? address.street[0] : null,
      street2: address ? address.street[1] : null,
      city: address ? address.city : null,
      countryId: address ? address.country_id : null,
      regionId: address ? address.region_id : null,
      postcode: address ? address.postcode : null,
      telephone: address ? address.telephone : null,
      isDefaultShipping: address ? address.default_shipping : false,
      isDefaultBilling: address ? address.default_billing : false,
      updateLoading: false,
      updateError: null,
      deleteLoading: false,
      deleteError: null,
    };

    this.toggleEdit = this.toggleEdit.bind(this);
    this.resetAddress = this.resetAddress.bind(this);
    this.updateAddress = this.updateAddress.bind(this);
    this.deleteAddress = this.deleteAddress.bind(this);
    this.renderStatic = this.renderStatic.bind(this);
  }

  toggleEdit() {
    const {onToggleEdit} = this.props;

    this.setState({edit: true});

    !!onToggleEdit && onToggleEdit();
  }

  resetAddress() {
    const {address, onCancel} = this.props;

    this.setState({
      edit: false,
      firstname: address ? address.firstname : null,
      lastname: address ? address.lastname : null,
      street1: address ? address.street[0] : null,
      street2: address ? address.street[1] : null,
      city: address ? address.city : null,
      countryId: address ? address.country_id : null,
      regionId: address ? address.region_id : null,
      postcode: address ? address.postcode : null,
      telephone: address ? address.telephone : null,
      isDefaultShipping: address ? address.default_shipping : false,
      isDefaultBilling: address ? address.default_billing : false,
    });

    !!onCancel && onCancel();
  }

  updateAddress(e) {
    !!e && e.preventDefault();

    if (!this.addressForm.checkValidity()) {
      this.addressFormSubmit.click();
      return;
    }

    const {address, countries, isNew, onNewSubmit} = this.props;
    const {
      firstname, 
      lastname, 
      street1, 
      street2, 
      city, 
      countryId, 
      regionId, 
      postcode, 
      telephone,
      isDefaultShipping, 
      isDefaultBilling, 
    } = this.state;

    if (
      !!address && 
      address.firstname == firstname && 
      address.lastname == lastname &&
      address.street[0] == street1 && 
      address.street[1] == street2 && 
      address.city == city && 
      address.country_id == countryId && 
      address.region_id == regionId && 
      address.postcode == postcode && 
      address.telephone == telephone && 
      address.default_shipping == isDefaultShipping && 
      address.default_billing == isDefaultBilling
    ) {
      alert("Your information has not changed. Please edit your address to continue or click 'Cancel' to close the form.");
      return;
    }

    this.setState({updateLoading: true});

    let user = AccountService.getUser(),
        streets = [street1.trim()],
        newUser;

    // magento needs the street component as an array, and street2 is optional
    if (!!street2) streets.push(street2.trim());

    const newAddress = {
      customer_id: user.id, 
      firstname: firstname.trim(), 
      lastname: lastname.trim(), 
      street: streets, 
      city: city.trim(), 
      country_id: countryId,
      region_id: regionId, 
      postcode: postcode.trim(),
      telephone: telephone.trim(),
      default_shipping: isDefaultShipping,
      default_billing: isDefaultBilling,
    };

    // if it's a new address being added, concat to current list
    if (isNew) newUser = {...user, addresses: user.addresses.concat([newAddress])};
    // else replace the old address in the current list
    else {
      const index = findIndex(user.addresses, {id: address.id});
      const userAddresses = cloneDeep(user.addresses);
      userAddresses[index] = newAddress;
      newUser = {...user, addresses: userAddresses};
    }
    
    // the only way to update addresses in magento is to update the whole user object including address
    AccountService.updateUser(newUser)
      .then((res) => {
        // update user with fresh Magento data
        AccountService.getMagentoUser().catch((err) => {});

        this.setState({edit: false, updateLoading: false});

        if (onNewSubmit) {
          this.resetAddress();
          onNewSubmit();
          window.location.reload();
        };
      })
      .catch((err) => {
        this.setState({updateLoading: false, updateError: Utils.getMagentoErrorMessage(err)});
        setTimeout(() => this.setState({updateError: null}), 5000);
      });
  }

  deleteAddress() {
    const {address} = this.props;

    if (!address.id) {
      this.setState({deleteLoading: false, deleteError: ERROR_MESSAGES.default});
      setTimeout(() => this.setState({deleteError: null}), 5000);
      return;
    }

    this.setState({deleteLoading: true});

    if (confirm("Are you sure you want to delete this address?")) {
      AccountService.deleteUserAddress(address.id)
        .then((res) => {
          this.setState({deleteLoading: false});
          window.location.reload();
        })
        .catch((err) => {
          this.setState({deleteLoading: false, deleteError: Utils.getMagentoErrorMessage(err)});
          setTimeout(() => this.setState({deleteError: null}), 5000);
        });
    }
  }

  renderStatic() {
    const {countries} = this.props;
    const {
      firstname, 
      lastname, 
      street1, 
      street2, 
      city, 
      countryId, 
      regionId, 
      postcode, 
      telephone, 
      isDefaultShipping, 
      isDefaultBilling,
      deleteLoading,
      deleteError,
    } = this.state;

    // If loading async, wait for countries to be ready
    if (!countries) return <div className="loading loading-small mv3"></div>;

    const country = find(countries, c => c.id == countryId);
    const region = find(country.available_regions, r => r.id == regionId);

    if (deleteLoading) return (<div className="loading"></div>);
    return (
      <div className="relative">
        <p className="mv0 f3">{firstname} {lastname}</p>
        <p className="mv0 f3">{street1} {street2}</p>
        <p className="mv0 f3">{city}, {!!region && region.name} {postcode}</p>
        <p className="mv0 f3">{country.full_name_locale}</p>
        <p className="mv0 f3">{telephone}</p>
        {isDefaultShipping && <p className="mt3 mb0 f5 navy">Default shipping</p>}
        {isDefaultBilling && <p className={"mb0 f5 navy" +( isDefaultShipping ? " mt0" : " mt3")}>Default billing</p>}
        {!!deleteError && <p className="red">{deleteError}</p>}
        <span className="absolute top-0 right-0 navy pointer dim" onClick={this.toggleEdit}>Edit</span>
        <span className="absolute top-2 right-0 gray pointer dim" onClick={this.deleteAddress}>Delete</span>
      </div>
    );
  }

  renderEdit() {
    const {countries} = this.props;
    const {
      firstname, 
      lastname, 
      street1, 
      street2, 
      city, 
      countryId, 
      regionId, 
      postcode, 
      telephone, 
      isDefaultShipping, 
      isDefaultBilling, 
      updateLoading, 
      updateError,
    } = this.state;

    // If loading async, wait for countries to be ready
    if (!countries) return <div className="loading loading-small mt4"></div>;

    // Prep list of countries for the dropdown selector
    const countriesList = flow(
      map(country => { return {value: country.two_letter_abbreviation, text: country.full_name_locale}; }),
      sortBy(country => country.text)
    )(countries);

    const country = !!countryId 
      ? find(countries, c => c.two_letter_abbreviation == countryId) 
      : null;

    const availableRegions = (!!country && !!country.available_regions) 
      ? flow(
          map(region => { return {value: region.id, text: region.name}; }),
          sortBy(region => region.text) 
        )(country.available_regions)
      : [{value: null, text: "-"}];

    return (
      <form ref={el => this.addressForm = el} className="mt4" onSubmit={this.updateAddress}>
        <FieldsetInput className="mb2" label="First Name" value={firstname} onKeyDown={e => Utils.onKeyDown(e, this.updateAddress)} onChange={e => this.setState({firstname: e.target.value})} required />
        <FieldsetInput className="mb2" label="Last Name" value={lastname} onKeyDown={e => Utils.onKeyDown(e, this.updateAddress)} onChange={e => this.setState({lastname: e.target.value})} required />
        <FieldsetInput className="mb2" label="Street 1" value={street1} onKeyDown={e => Utils.onKeyDown(e, this.updateAddress)} onChange={e => this.setState({street1: e.target.value})} required />
        <FieldsetInput className="mb2" label="Street 2" value={street2} onKeyDown={e => Utils.onKeyDown(e, this.updateAddress)} onChange={e => this.setState({street2: e.target.value})} />
        <FieldsetInput className="mb2" label="City" value={city} onKeyDown={e => Utils.onKeyDown(e, this.updateAddress)} onChange={e => this.setState({city: e.target.value})} required />
        <FieldsetSelect className="mb2" label="Country" value={countryId} options={countriesList} onKeyDown={e => Utils.onKeyDown(e, this.updateAddress)} onChange={e => this.setState({countryId: e.target.value})} required />
        {(!!country && !country.available_regions) 
          ? null
          : <FieldsetSelect className="mb2" label={!!country && country.two_letter_abbreviation === "US" ? "State" : "Region"} value={regionId} options={availableRegions} onKeyDown={e => Utils.onKeyDown(e, this.updateAddress)} onChange={e => this.setState({regionId: e.target.value})} required />
        }
        <FieldsetInput className="mb3" label="Post Code" value={postcode} onKeyDown={e => Utils.onKeyDown(e, this.updateAddress)} onChange={e => this.setState({postcode: e.target.value})} required />
        <FieldsetInput className="mb3" label="Telephone" type="tel" value={telephone} onKeyDown={e => Utils.onKeyDown(e, this.updateAddress)} onChange={e => this.setState({telephone: e.target.value})} required />
        <FieldsetCheckbox label="Default Shipping" onKeyDown={e => Utils.onKeyDown(e, this.updateAddress)} onChange={isDefaultShipping => this.setState({isDefaultShipping})} checked={isDefaultShipping} />
        <FieldsetCheckbox className="mb3" label="Default Billing" onKeyDown={e => Utils.onKeyDown(e, this.updateAddress)} onChange={isDefaultBilling => this.setState({isDefaultBilling})} checked={isDefaultBilling} />
        {!!updateError && <p className="red">{updateError}</p>}
        {!updateLoading
          ? <div>
            <FieldsetButton className="dib mt3" type="button" text="Save" onClick={this.updateAddress} />
            <button ref={el => this.addressFormSubmit = el} hidden />
            <span className="dib ml3 pa3 navy f5 link pointer dim" onClick={this.resetAddress}>Cancel</span>
          </div>
          : <div className="loading loading-small mt4 mb3"></div>
        }
      </form>
    );
  }

  render() {
    const {index, addressesCount, isNew} = this.props;
    const {edit} = this.state;

    return (
      <div className="address mb4">
        {(isNew || edit) ? this.renderEdit() : this.renderStatic()}
        <div className="section__content--divider"></div>
      </div>
    );
  }
}

module.exports = Address;