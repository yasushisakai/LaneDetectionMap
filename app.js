import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {LineLayer, ScatterplotLayer} from 'deck.gl';
import firebase from 'firebase';

// firebase
const project_id = "hansel-f5b64";

const config = {
  apiKey: process.env.FirebaseApiKey,
  authDomain: `${project_id}.firebaseapp.com`,
  databaseURL: `https://${project_id}.firebaseio.com`,
  storageBucket: `gs://${project_id}.appspot.com`,
};

firebase.initializeApp(config);

var database = firebase.database();

var readResults = () => {
  return database.ref('analyzed').once('value')
    .then((snapshot) => {
      let hasLane = [];
      let unclear = [];
      let doesntHaveLane = [];
      let results = snapshot.val();
      Object.values(results).map((user)=>{
        user.map((point)=>{
          let pos = {position: [point.longitude, point.latitude]};
          if(point.judge <= 0) {
            doesntHaveLane.push(pos);
          } else if (point.judge <= 0.5) {
            unclear.push(pos);
          } else {
            hasLane.push(pos); 
          }
        });
      });
      return [hasLane, unclear, doesntHaveLane];
    });
}

var getBreadcrumbs = () => {
  return database.ref('breadcrumbs').once('value')
    .then((snapshot)=> {
      let breadcrumbs = [];
      let results = snapshot.val();
      Object.values(results).map((user)=>{
        Object.values(user).map((point) => {
         let pos = {position: [point.longitude, point. latitude]}
          breadcrumbs.push(pos);
        });
      });
      return breadcrumbs;
    });
}

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  latitude: 42.3608,
  longitude: -71.08768,
  zoom: 16,
  // bearing: -20,
  // pitch: 60
};

class Root extends Component {

    constructor(props){
      super(props);
      this.state = {
        breadcrumbs: [],
        hasLane:[],
        unclear:[],
        doesntHaveLane:[],
      };
    }

    componentDidMount(){
      this.updateLaneData();
    }

  updateLaneData() {
    //TODO: use join
    readResults()
      .then((results) => {
        this.setState({
          hasLane: results[0],
          unclear: results[1],
          doesntHaveLane: results[2],
        });
      });

    getBreadcrumbs()
      .then((results) => {
        this.setState({
          breadcrumbs: results 
        });
      });
  }

  render() {
    return (
      <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} width="100%" height="100%">
        <StaticMap mapboxApiAccessToken={MAPBOX_TOKEN} />

        <ScatterplotLayer
          id='breadcrumbs'
          data={this.state.breadcrumbs}
          radiusScale={10}
          radiusMinPixels={1}
          getColor={x => [0, 0, 0]}
        />

        <ScatterplotLayer
          id='hasLane'
          data={this.state.hasLane}
          radiusScale={20}
          radiusMinPixels={1.5}
          getColor={x => [0, 0, 255]}
        />
        <ScatterplotLayer
          id='unclear'
          data={this.state.unclear}
          radiusScale={20}
          radiusMinPixels={1.5}
          getColor={x => [255, 255, 0]}
        />
        <ScatterplotLayer
          id='doesntHaveLane'
          data={this.state.doesntHaveLane}
          radiusScale={20}
          radiusMinPixels={1.5}
          getColor={x => [255, 0, 0]}
        />
      </DeckGL>
    );
  }
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));
