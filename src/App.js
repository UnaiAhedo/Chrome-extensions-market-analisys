import React from 'react';
import { Link } from "react-router-dom";
import { withRouter } from "react-router";
import Breadcrumb from 'react-bootstrap/Breadcrumb';

function App() {
  function clear() {
    var elements = document.getElementsByTagName("input");
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].type == "text") {
        elements[i].value = "";
      }
    }
  }

  function searchWebs() {
    var purpose = document.getElementById("purpose").value;
    var how = document.getElementById("how").value;
    var why = document.getElementById("why").value;
    var what = document.getElementById("what").value;
    var where = document.getElementById("where").value;
    var prueba;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Web extension market analysis</h1>
      </header>
      <br />
      <br />
      <div className="breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item active>Search string</Breadcrumb.Item>
          <Breadcrumb.Item>Extension selection</Breadcrumb.Item>
          <Breadcrumb.Item>Tags aggrupation</Breadcrumb.Item>
          <Breadcrumb.Item>Kano model</Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <div className="function-explanation">
        <h2>Extension Analysis</h2>
        <p>Introduce the desired tags of the Chrome extension below, you can left blanks tags (except the purpose one). After that, click on "Search", select the desired query, and follow the steps.</p>
      </div>
      <table className="center">
        <tbody>
          <tr>
            <th>Purpose (*)</th>
            <th>How</th>
            <th>Why</th>
            <th>What</th>
            <th>Where</th>
          </tr>
          <tr>
            <td><input id="purpose"></input></td>
            <td><input id="how"></input></td>
            <td><input id="why"></input></td>
            <td><input id="what"></input></td>
            <td><input id="where"></input></td>
          </tr>
        </tbody>
      </table>
      <br />
      <div className="right-buttons">
        <button className="btn btn-primary" onClick={clear}>Clear</button>
        &nbsp;
        <button className="btn btn-primary" onClick={searchWebs}>Search</button>
      </div>
      <br />
      <div>
        <div className="right-buttons">
          <Link
            to={{
              pathname: "/seleccionarWebs",
              state: { name: 'purpose', age: 25, city: 'Antwerp' }
            }}
          ><button className="btn btn-primary">A</button></Link>
        </div>
      </div>
    </div>
  );
}

export default withRouter(App);