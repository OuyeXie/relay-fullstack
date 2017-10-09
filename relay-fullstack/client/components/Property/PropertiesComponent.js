/* eslint-disable global-require */
import React from 'react';
import { Link } from 'react-router';
import { Grid, Cell, Card, CardText, CardActions } from 'react-mdl';
import Page from '../Page/PageComponent';
import styles from '../Feature/Feature.scss';

export default class Feature extends React.Component {
  static propTypes = {
    viewer: React.PropTypes.object.isRequired
  };

  render() {
    return (
      <div>
        <Page heading='Integrated with'>
          <Grid>
            {this.props.viewer.properties.edges.map((edge) => {
              return (
                <Cell col={4} key={edge.node.id}>
                  <Card className={styles.card}>
                    <CardActions className={styles.name}>
                      <Link to={`/property/${edge.node.id}`}>
                        {edge.node.url}
                      </Link>
                    </CardActions>
                    <CardText className={styles.description}>
                      {edge.node.info}
                    </CardText>
                  </Card>
                </Cell>
              );
            })}
          </Grid>
        </Page>
      </div>
    );
  }
}
