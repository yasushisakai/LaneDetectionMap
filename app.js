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

var readResults = ()=> {
  return database.ref('analyzed').once('value')
    .then((snapshot) => {
      let hasLane = [];
      let doesntHaveLane = [];
      let results = snapshot.val();
      Object.values(results).map((user)=>{
        user.map((point)=>{
          if(point.judge == 0) {
            doesntHaveLane.push({position:[point.longitude, point.latitude]});
          } else {
            hasLane.push({position:[point.longitude, point.latitude]});
          }
        });
      });
      // console.log(hasLane);
      return hasLane;
    });
}

// readResults();

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
        hasLane:[],
      };
    }

    componentDidMount(){
     //console.log("hi");
      this.updateHasLane();
    }

  updateHasLane() {
    readResults()
      .then((results) => {
        this.setState({
          hasLane: results
        })
      })
  }

  render() {
    return (
      <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} width="100%" height="100%">
        <StaticMap mapboxApiAccessToken={MAPBOX_TOKEN} />
        <ScatterplotLayer
          data={this.state.hasLane}
          radiusScale={1}
          getColor={x => [0, 0, 255]}
        />
      </DeckGL>
    );
  }
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));
