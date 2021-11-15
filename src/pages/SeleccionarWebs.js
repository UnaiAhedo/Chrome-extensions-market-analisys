import React from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import Breadcrumb from 'react-bootstrap/Breadcrumb';

function SeleccionarWebs() {
  var query = localStorage.getItem('query');
  var URLs;
  var extensionInfo;

  chargePage();

  React.useEffect(() => loadTable());

  function selectAllCheckbox() {
    var aInputs = document.getElementsByTagName('input');
    for (var i = 0; i < aInputs.length; i++) {
      aInputs[i].checked = true;
    }
  }

  function unselectAllCheckbox() {
    var aInputs = document.getElementsByTagName('input');
    for (var i = 0; i < aInputs.length; i++) {
      aInputs[i].checked = false;
    }
  }

  function chargePage() {
    if (query !== null) {
      URLs = JSON.parse(localStorage.getItem(query + 'URL'));
      extensionInfo = JSON.parse(localStorage.getItem(query + 'INFO'));
      //localStorage.clear();
    }
  }

  function selectRows() {
    let URLs = [];
    var checkboxes = document.getElementsByName('queryGroup');
    let i = 1;
    var table = document.getElementById('extensionsTable');
    for (var checkbox of checkboxes) {
      if (checkbox.checked) {
        URLs.push(table.rows[i].cells[6].children[0].href);
      }
      i++;
    }
    localStorage.setItem('commentsURLs', JSON.stringify(URLs));
  }

  function loadTable() {
    if (query !== null) {

      var i = 0;
      extensionInfo.forEach(extension => {
        var tbodyRef = document.getElementById('extensionsTable').getElementsByTagName('tbody')[0];

        // Insert a row at the end of table
        var newRow = tbodyRef.insertRow();

        // Insert a cell at the end of the row
        var newCell = newRow.insertCell();
        var newCell2 = newRow.insertCell();
        var newCell3 = newRow.insertCell();
        var newCell4 = newRow.insertCell();
        var newCell5 = newRow.insertCell();
        var newCell6 = newRow.insertCell();
        var newCell7 = newRow.insertCell();
        var newCell8 = newRow.insertCell();

        var checkbox;
        var newText;
        var newText2;
        var newText3;
        var newText4;
        var newText5;
        var linkURL;
        var descriptionTextArea;

        checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'querySelected';
        checkbox.value = 'query';
        checkbox.name = 'queryGroup';

        descriptionTextArea = document.createElement('textarea');
        descriptionTextArea.setAttribute('readonly', '');
        descriptionTextArea.value = extension['description'];
        descriptionTextArea.style.width = '600px';

        linkURL = document.createElement('a');
        var linkText = document.createTextNode('Extension page');
        linkURL.appendChild(linkText);
        linkURL.href = URLs[i];
        linkURL.setAttribute('target', '_blank');

        newText = document.createTextNode(extension['name']);
        newText2 = document.createTextNode(extension['stars']);
        newText3 = document.createTextNode(extension['users']);
        newText4 = document.createTextNode(extension['lastUpdate']);
        newText5 = document.createTextNode(extension['version']);

        newCell.appendChild(checkbox);
        newCell2.appendChild(newText);
        newCell3.appendChild(newText2);
        newCell4.appendChild(newText3);
        newCell5.appendChild(newText4);
        newCell6.appendChild(newText5);
        newCell7.appendChild(linkURL);
        newCell8.appendChild(descriptionTextArea);

        i++;
      });
    }
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
          <Breadcrumb.Item>Search string</Breadcrumb.Item>
          <Breadcrumb.Item active>Extension selection</Breadcrumb.Item>
          <Breadcrumb.Item>Tags aggrupation</Breadcrumb.Item>
          <Breadcrumb.Item>Kano model</Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <div className="function-explanation">
        <h2>Extension selection</h2>
        <p>Select the desired extensions from below, for that just click the "Selected" button at the right of the image.</p>
        <table id="extensionsTable" className="center-spacing">
          <thead>
            <tr>
              <th>Select</th>
              <th>Name</th>
              <th>Stars</th>
              <th>Users</th>
              <th>Last Update</th>
              <th>Version</th>
              <th>Url</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      </div>
      <br />
      <div className="right-buttons">
        <button className="btn btn-primary" onClick={selectAllCheckbox}>Select all</button>
        &nbsp;
        <button className="btn btn-primary" onClick={unselectAllCheckbox}>Unselect all</button>
      </div>
      <br />
      <div className="right-buttons">
        <Link to="/"><button className="btn btn-primary">Back</button></Link>
        &nbsp;
        <Link to="/agruparTags" onClick={() => selectRows()}><button className="btn btn-primary">Next</button></Link>
      </div>
      <br />
    </div>
  );
}

export default withRouter(SeleccionarWebs);