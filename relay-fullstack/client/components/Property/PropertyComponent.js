import React from 'react';
import 'normalize.css/normalize.css';
import 'react-mdl/extra/css/material.cyan-red.min.css';
import styles from './Property.scss';
import UpdateParameterComponent from './UpdateParameterComponent';

export default class App extends React.Component {
  static propTypes = {
    property: React.PropTypes.object.isRequired
  };

  render() {
    console.log('--property--', this.props.property);
    return (
      <div className={styles.root}>
        <div className={styles.greeting}>
          <h1 className={styles.sawasdee}>???Is Past Prologue???</h1>
        </div>
        <div className={styles.content}>
          <div>{this.props.property.presentValue}</div>
          <div>{this.props.property.url}</div>
          <div>{this.props.property.lastListedPrice}</div>
        </div>
        <UpdateParameterComponent property={this.props.property} />
      </div>
    );
  }
}
