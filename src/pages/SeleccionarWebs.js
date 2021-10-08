import React from "react";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Breadcrumb from 'react-bootstrap/Breadcrumb';

function Child() {
  let data = useLocation();
  console.log(data.state); //state would be in data.state//
}

function SeleccionarWebs() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Web extension market analysis</h1>
      </header>
      <br />
      <br />
      <div className="breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item>Search string</Breadcrumb.Item>
          <Breadcrumb.Item active>Extension selection</Breadcrumb.Item>
          <Breadcrumb.Item>Tags aggrupation</Breadcrumb.Item>
          <Breadcrumb.Item>Kano model</Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <div className="function-explanation">
        <h2>Extension selection</h2>
        <p>Select the desired extensions from below, for that just click the "Selected" button at the right of the image.</p>
      </div>
      <div className="right-buttons">
        <Link to="/"><button className="btn btn-primary">Back</button></Link>
        &nbsp;
        <Link to="/agruparTags"><button className="btn btn-primary">Next</button></Link>
      </div>
      <br/>
    </div>
  );
}

export default withRouter(SeleccionarWebs);