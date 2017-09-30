import React from 'react';
import 'normalize.css/normalize.css';
import 'react-mdl/extra/css/material.cyan-red.min.css';
import Navbar from '../Navbar/NavbarComponent';
import styles from './Property.scss';
import yeoman from '../../assets/yeoman.png';

export default class App extends React.Component {
  static propTypes = {
    property: React.PropTypes.object.isRequired
  };

  render() {
    console.log('--property--', this.props.property);
    return (
      <div className={styles.root}>
        <Navbar />
        <div className={styles.greeting}>
          <h1 className={styles.sawasdee}>Realty Analysis Professional</h1>
          <p>Always a pleasure buying your new property!</p>
          <img src={yeoman} alt='yeoman' />
        </div>
        <div className={styles.content}>
          {this.props.property}
        </div>
      </div>
    );
  }
}
