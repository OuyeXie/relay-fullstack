import React from 'react';
import 'normalize.css/normalize.css';
import 'react-mdl/extra/css/material.cyan-red.min.css';
import d3 from 'd3';
import Navbar from '../Navbar/NavbarComponent';
import Footer from '../Footer/FooterContainer';
import styles from './App.scss';
import yeoman from '../../assets/yeoman.png';

class TestChart {
  constructor(container) {
    this.loadChart = new Promise((resolve) => {
      require.ensure(['d3', 'techan'], (require) => {
        let d3 = require('d3')
        let techan = require('techan')
        let margin = {top: 0, right: 0, bottom: 0, left: 0}
        let width = container.offsetWidth - margin.left - margin.right
        let height = container.offsetHeight - margin.top - margin.bottom

        //let zoom = d3.behavior.zoom().scaleExtent([0.5, 3])
        //zoom.on('zoom', ()=>{
        //  this.draw()
        //})

        let scoreScale = d3.scale.linear().range([7, 30])

        let svg = d3.select(container).append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)

        let defs = svg.append('defs')

        defs.append('clipPath')
          .attr('id', 'scatterClip')
          .append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', width)
          .attr('height', height)

        //svg = svg.append('g')
        //        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

        let scatterSelection = svg.append('g')
          .attr('class', 'scatter')
          .attr('transform', 'translate(0,0)')

        //scatterSelection.append('rect')
        //  .attr('class', 'brush-rect')
        //  .attr('x', 0)
        //  .attr('y', 0)
        //  .attr('width', width)
        //  .attr('height', height)
        //  .style({ fill: 'none', 'pointer-events': 'all' })

        let scatter = scatterSelection.append('g')
          .attr('class', 'scatter-plot')
          .attr('clip-path', 'url(#scatterClip)')

        let force = d3.layout.force()
          .size([width, height])
          .linkStrength(0.1)
          .friction(0.9)
          .linkDistance(20)
          //.charge(-30)
          .gravity(0.1)
          .theta(0.8)
          .alpha(0.1)

        Object.assign(this,
          {techan, d3, scoreScale, svg, scatter, defs, height, width, force})
        resolve()
      })
    })
  }

  async update(data) {
    await this.loadChart
    let {svg, scatter, scoreScale, defs, height, width, force} = this

    svg.selectAll('.empty-day').remove()
    if (data.length === 0) {
      svg.append('text')
        .attr('class', 'empty-day')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('dy', '0.3em')
        .style({'text-anchor': 'middle', 'font-size': '13px'})
        .text('没有买卖，就没有伤害')
    }
    scoreScale.domain([0, 0.4])
    let patterns = defs.selectAll('pattern')
      .data(data, d => d.id)

    patterns.exit().remove()

    patterns.enter()
      .append('pattern')
      .attr('id', d => `user-${d.id}`)
      .attr('height', 1)
      .attr('width', 1)
      .attr('x', '0')
      .attr('y', '0')
      .append('image')
      .attr('xlink:href', d => d.externalUser.avatar || assets('avatarPlaceholder.png'))
      .attr('x', 0)
      .attr('y', 0)
      .transition()
      .attr('height', (d) => {
        return 2 * scoreScale(d.externalUser.score)
      })
      .attr('width', d => 2 * scoreScale(d.externalUser.score))
    // ----- user circles -----
    let users = scatter.selectAll('circle')
      .data(data, d => d.id)

    users.exit().transition()
      .attr('r', 0)
      .remove()

    users.enter()
      .append('circle')
      .attr('class', d => `user ${d.buy ? 'op-buy' : 'op-sell'}`)
      .attr('id', d => `circle-${d.id}`)
      .attr('r', 0)
      .attr('fill', d => `url(#user-${d.id})`)
      //.attr('cx', d => x(d.date))
      //.attr('cy', d => height / 2 + (d.buy ? -scoreScale(d.externalUser.score) - 5 : scoreScale(d.externalUser.score) + 5))
      //.attr('fill-opacity', 0.5)
      .transition()
      .attr('r', (d) => {
        return scoreScale(d.externalUser.score)
      })


    users.on('click', this.selectUser.bind(this))

    let foci = [{x: width / 4, y: height / 2}, {x: width / 4 * 3, y: height / 2}]

    force
      .nodes(data)
      .charge(d => -scoreScale(d.externalUser.score) * 5)
      .start()

    force.on('tick', (e) => {
      let k = 0.1 * e.alpha
      data.forEach(function (d) {
        let i = d.buy ? 0 : 1
        d.y += (foci[i].y - d.y) * k;
        d.x += (foci[i].x - d.x) * k;
      })
      users
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
    })

    this.data = data
    setTimeout(() => {
      this.selectUser(this.weightRandom(this.data))
    }, 1000)
  }

  weightRandom(itemWeight) {
    let ret
    let totalWeight = 0
    itemWeight.forEach(function (d) {
      let item = d
      let weight = d.externalUser.score
      totalWeight += weight
      if (Math.random() * totalWeight <= weight) {
        ret = item
      }
    })
    return ret
  }

  //async draw() {
  //  let {svg, scatter, techan, d3,} = this
  //
  //  scatter.attr('transform',
  //      'translate(' + d3.event.translate + ')'
  //      + ' scale(' + d3.event.scale + ')');
  //
  //}
  remove() {
    if (this._timer) clearTimeout(this._timer)
    this.svg.remove()
  }

  selectUser(d) {
    if (this._timer) clearTimeout(this._timer)
    if (!d) return
    let {scatter} = this
    if (this.lastSelected === d.id) return
    scatter.select(`#circle-${this.lastSelected}`)
      .classed({'selected': false})
      .transition()
      .style({'stroke-width': '3px'})
    scatter.select(`#circle-${d.id}`)
      .classed({'selected': true})
      .transition()
      .style({'stroke-width': '6px'})
    this.lastSelected = d.id
    // not use event system now
    if (this.selectedUserChange) this.selectedUserChange(d)
    this._timer = setTimeout(() => {
      this.selectUser(this.weightRandom(this.data))
    }, 3000)
  }
}

export default class App extends React.Component {
  static propTypes = {
    children: React.PropTypes.object.isRequired,
    viewer: React.PropTypes.object.isRequired
  };

  componentDidMount() {
    this.chart = new TestChart(this.refs.trendChart);
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
        <div ref="trendChart"></div>
        <div className={styles.greeting}>
          <h1 className={styles.sawasdee}>Sawasdee, Sawasdee!</h1>
          <p>Always a pleasure scaffolding your apps</p>
          <img src={yeoman} alt='yeoman' />
        </div>
        <div className={styles.content}>
          {this.props.children}
        </div>
        <Footer viewer={this.props.viewer} />
      </div>
    );
  }
}
