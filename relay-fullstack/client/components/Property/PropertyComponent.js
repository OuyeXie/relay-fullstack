import React from 'react';
import 'normalize.css/normalize.css';
import 'react-mdl/extra/css/material.cyan-red.min.css';
import styles from './Property.scss';

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
          {this.props.property.presentValue}
        </div>
      </div>
    );
  }
}
