import React from 'react';
import 'normalize.css/normalize.css';
import 'react-mdl/extra/css/material.cyan-red.min.css';
import Navbar from '../Navbar/NavbarComponent';
import Footer from '../Footer/FooterContainer';
import styles from './App.scss';
import yeoman from '../../assets/yeoman.png';

class TestChart {
  constructor(container) {
    this.loadChart = new Promise((resolve) => {
      require.ensure(['d3'], (require) => {
        const d3 = require('d3');


        const canvas = d3.select(container).node();
        console.log('adsf', canvas);
        const context = canvas.getContext('2d');
        const canvasWidth = canvas.width;

        const x0 = d3.scaleQuantize()
          .domain([0, 1])
          .range(["#8e0152", "#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#f7f7f7", "#e6f5d0", "#b8e186", "#7fbc41", "#4d9221", "#276419"]); // PiYG


        const image = context.createImageData(canvasWidth, 1);
        const interpolate = d3.interpolateRgbBasis(x0.range());

        for (let i = 0, k = 0; i < canvasWidth; ++i, k += 4) {
          let c = d3.rgb(interpolate(i / (canvasWidth - 1)));
          image.data[k] = c.r;
          image.data[k + 1] = c.g;
          image.data[k + 2] = c.b;
          image.data[k + 3] = 255;
        }

        context.putImageData(image, 0, 0);
        resolve();
      });
    });
  }

  async update() {
    await this.loadChart;
  }


  remove() {
    this.svg.remove();
  }
}

export default class App extends React.Component {
  static propTypes = {
    children: React.PropTypes.object.isRequired,
    viewer: React.PropTypes.object.isRequired
  };

  componentDidMount() {
    this.chart = new TestChart(this.refs.trendChart);
    this.chart.update()
  }

  componentWillUnmount() {
    if (this.chart) {
      this.chart.remove();
    }
  }

  render() {
    return (
      <div className={styles.root}>
        <Navbar />
        <canvas ref='trendChart' width='880' height='1' style={{ width: '880px', height: '80px', margin: '20px 40px', background: '#ccc' }}></canvas>
        <div className={styles.greeting}>
          <h1 className={styles.sawasdee}>Sawasdee, Sawasdee!</h1>
          <p>Always a pleasure scaffolding your apps</p>
          <img src={yeoman} alt='yeoman' />
        </div>
        <div className={styles.content}>
          {this.props.children}
        </div>
        <Footer viewer={this.props.viewer}/>
      </div>
    );
  }
}
