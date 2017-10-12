import Relay from 'react-relay';

class UpdateParameterMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`
      mutation { updateParameter }
    `;
  }

  getVariables() {
    return {
      propertyId: this.props.propertyId,
      discountRate: this.props.discountRate
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateParameterPayload {
        property {
          presentValue
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        property: this.props.propertyId,
      },
    }];
  }

  static fragments = {
    property: () => Relay.QL`
      fragment on Property {
        id,
      }
    `,
  }
}

export default UpdateParameterMutation;
