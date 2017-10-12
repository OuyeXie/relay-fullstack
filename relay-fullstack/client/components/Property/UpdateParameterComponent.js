import React from 'react';
import Relay from 'react-relay';
import { Button } from 'react-mdl';
import UpdateParameterMutation from './UpdateParameterMutation';

export default class UpdateParameterComponent extends React.Component {
  static propTypes = {
    property: React.PropTypes.object.isRequired
  };

  state = {
    discountRate: 0.05
  };

  handleDiscountRateChange = (e) => {
    this.setState({ discountRate: e.target.value });
  };

  updateParameter = () => {
    const updateParameterMutation = new UpdateParameterMutation({
      propertyId: this.props.property.id,
      ...this.state
    });
    Relay.Store.commitUpdate(updateParameterMutation);
  };

  render() {
    return (
      <div>
        <input id='discountRate' type='text' value={this.state.discountRate} onChange={this.handleDiscountRateChange}/>
        <Button raised accent onClick={this.updateParameter.bind(this)}>Update Parameter</Button>
      </div>
    );
  }
}
