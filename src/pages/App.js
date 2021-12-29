import React from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import Breadcrumb from 'react-bootstrap/Breadcrumb';

function App() {

  // Variable that will be used when comparing the querys
  var previousURLs = null;

  localStorage.clear();

  // Launch the fetch to the get the descriptions of the extensions
  // This descriptions will be used in the next page
  async function getDescriptions(query) {
    if (query.length !== 0) {
      return await fetch('http://127.0.0.1:4000/extractExtensionInfo', { // the body is an array of URLs
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          { query }
        )
      }).then(res => res.text())
        .then(text => JSON.parse(text))
        .catch((error) => {
          console.log(error);
          alert("Something went wrong, please restart the service and try again.");
        });
    }
  }

  // Launch the fetch to the get the URLs of the extensions
  // This descriptions will be used in the next page
  async function getURLs(query) {
    return await fetch('http://127.0.0.1:4000/searchExtensions?q=' + query) // the query is formed following the 5Ws
      .then(res => res.text())
      .then(text => JSON.parse(text))
      .catch((error) => {
        alert("Something went wrong, please restart the service and try again.");
        console.log(error);
      });
  }

  // Gives format to the query to be displayed in the result table
  function inputToQueryForTable() {
    let firstTime = true;
    var query = 'Purpose: '
    var purpose = document.getElementById('purpose').value.replace(/ /g, '').split(',');
    if (purpose.length === 1) {
      query += "'" + purpose + "'";
    } else {
      purpose.forEach(element => {
        if (firstTime) {
          firstTime = false;
          query += "'" + element;
        } else {
          query += ' OR ' + element;
        }
      });
      query += "'";
    }

    // For each W we concata the input to the query
    for (var i = 1; i <= 4; i++) {
      let upperCase, lowCase;
      let firstWord = true;
      if (i === 1) {
        upperCase = 'How';
        lowCase = 'how';
      } else if (i === 2) {
        upperCase = 'Why';
        lowCase = 'why';
      } else if (i === 3) {
        upperCase = 'What';
        lowCase = 'what';
      }
      else if (i === 4) {
        upperCase = 'Where';
        lowCase = 'where';
      }
      
      let input = document.getElementById(lowCase).value.replace(/ /g, '');
      if (input !== '') {
        input = input.split(',')
        if (input.length === 1) {
          query += " AND " + upperCase + ": '" + input + "'";
        } else {
          let query2 = '';
          input.forEach(element => {
            if (firstWord) {
              firstWord = false;
              query2 += " AND " + upperCase + ": '";
            } else {
              query2 += ' OR ' + element;
            }
          });
          query += query2;
          query += "'";
        }
      }
    }
    return query;
  }

  // This method return the query with the format to send it to the scrapping service
  function inputToQuery(purpose, input, query) {
    var first = true;
    if (purpose) { // The purpose is the first one, so has to be a bit different
      input = input.split(',');
      if (input.length === 1) {
        query += input;
      } else {
        query += '(';
        input.forEach(element => {
          if (first) {
            first = false;
            query += element;
          } else {
            query += ' OR ' + element;
          }
        });
        query += ")";
      }
    } else {
      if (input !== '') { // The others 5w, will be concated by the same way
        input = input.split(',');
        if (input.length === 1) {
          query += ' AND (' + input + ')';
        } else {
          query += ' AND (';
          first = true;
          input.forEach(element => {
            if (first) {
              first = false;
              query += element;
            } else {
              query += ' OR ' + element;
            }
          });
          query += ')';
        }
      }
    }
    return query;
  }

  function clearInputs() {
    var elements = document.getElementsByTagName('input');
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].type === 'text') {
        elements[i].value = '';
      }
    }
    document.getElementById('status').innerText = '';
  }

  function disableButtons() {
    let buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.disabled = true;
    });
    let link = document.getElementById('nextPage');
    link.style.pointerEvents = 'none';
  }

  function activateButtons() {
    let buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.disabled = false;
    });
    let link = document.getElementById('nextPage');
    link.style.pointerEvents = 'auto';
  }

  // Method that add the query results to the table
  function addRowsToQueryTable(tableQuery, URLs, extensionInfo) {

    var tbodyRef = document.getElementById('resultTable').getElementsByTagName('tbody')[0];

    // Insert a row at the end of table
    var newRow = tbodyRef.insertRow();

    // Insert a cell at the end of the row
    var newCell = newRow.insertCell();
    var newCell2 = newRow.insertCell();
    var newCell3 = newRow.insertCell();
    var newCell4 = newRow.insertCell();
    var newCell5 = newRow.insertCell();
    var newCell6 = newRow.insertCell();

    var radiobox;
    var newText;
    var newText2;
    var newText3;
    var newText4;
    var newText5;

    if (extensionInfo != null) {
      // Get the blockbusters, stars >= 5
      let blockbusters = 0;
      extensionInfo.forEach(element => {
        if (element['stars'] >= 5) blockbusters++;
      });

      // Get the number of new searchs, if previous URLs didn't have one of the news, that's a new one
      let newSearch = 0;
      if (previousURLs !== null) {
        URLs.forEach(element => {
          if (!previousURLs.includes(element)) {
            newSearch++;
          }
        });
      }

      // Get the number of deleted searchs, if actual URLs don't have one of the olds, that's a deleted one
      let deletedSearchs = 0;
      if (previousURLs != null) {
        previousURLs.forEach(element => {
          if (!URLs.includes(element)) {
            deletedSearchs++;
          }
        });
      }

      // Create the radiobox for selecting the query
      radiobox = document.createElement('input');
      radiobox.type = 'radio';
      radiobox.id = 'querySelected';
      radiobox.value = 'query';
      radiobox.name = 'queryGroup';

      // Append a text node to the cell
      newText = document.createTextNode(tableQuery);
      newText2 = document.createTextNode(URLs.length);
      newText3 = document.createTextNode(blockbusters);
      if (previousURLs !== null) {
        newText4 = document.createTextNode(newSearch);
      } else {
        newText4 = document.createTextNode(URLs.length);
      }
      newText5 = document.createTextNode(deletedSearchs);
      previousURLs = URLs;
    } else {
      radiobox = document.createTextNode('');
      newText = document.createTextNode(tableQuery);
      newText2 = document.createTextNode('0');
      newText3 = document.createTextNode('0');
      newText4 = document.createTextNode('0');
      if (previousURLs !== null) {
        newText5 = document.createTextNode(previousURLs.length);
      } else {
        newText5 = document.createTextNode('0');
      }
      previousURLs = null;
    }

    // Append the elements to the nodes
    newCell.appendChild(radiobox);
    newCell2.appendChild(newText);
    newCell3.appendChild(newText2);
    newCell4.appendChild(newText3);
    newCell5.appendChild(newText4);
    newCell6.appendChild(newText5);
  }

  function selectRow() {
    var radios = document.getElementsByName('queryGroup');
    let i = 1;
    for (var radio of radios) {
      if (radio.checked) {
        break;
      }
      i++;
    }
    var table = document.getElementById('resultTable');
    if (table.rows[i] != null) {
      localStorage.setItem('query', table.rows[i].cells[1].innerText);
      return true;
    } else {
      return false;
    }
  }

  async function searchWebs() {
    var purpose = document.getElementById('purpose').value.replace(/ /g, '');
    if (purpose !== '') {
      disableButtons();
      // Create the query for the search
      var query = 'https://chrome.google.com/webstore/search/';

      query = inputToQuery(true, purpose, query);

      var how = document.getElementById('how').value.replace(/ /g, '');
      query = inputToQuery(false, how, query);

      var why = document.getElementById('why').value.replace(/ /g, '');
      query = inputToQuery(false, why, query);

      var what = document.getElementById('what').value.replace(/ /g, '');
      query = inputToQuery(false, what, query);

      var where = document.getElementById('where').value.replace(/ /g, '');
      query = inputToQuery(false, where, query);

      query += '?_category=extensions?hl=en';

      document.getElementById('status').style.display = "";

      // Get the URLs of the query, thos extension info and add them to the table
      var responseURLs = await getURLs(query);

      let queryForTable = inputToQueryForTable();
      if (responseURLs != null) {
        var extensionsInfo = await getDescriptions(responseURLs);

        // Put the object into storage
        localStorage.setItem(queryForTable + 'URL', JSON.stringify(responseURLs));
        localStorage.setItem(queryForTable + 'INFO', JSON.stringify(extensionsInfo));
      }
      addRowsToQueryTable(queryForTable, responseURLs, extensionsInfo);
      document.getElementById('status').style.display = 'none';
      activateButtons();
    } else {
      document.getElementById('status').innerText = "Purpose can't be empty.";
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
          <Breadcrumb.Item active>Search string</Breadcrumb.Item>
          <Breadcrumb.Item>Extension selection</Breadcrumb.Item>
          <Breadcrumb.Item>Tags aggrupation</Breadcrumb.Item>
          <Breadcrumb.Item>Kano model</Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <div className="function-explanation">
        <h2>Extension Analysis</h2>
        <p>Introduce the desired tags of the Chrome extension below, you can left blanks tags (except the purpose one). If you want to introduce more than one value, use commas (for example in purpose: annotation, highlight). After that, click on "Search", select the desired query, and follow the steps.</p>
      </div>
      <table className="center">
        <thead>
          <tr>
            <th>Purpose (*)</th>
            <th>How</th>
            <th>Why</th>
            <th>What</th>
            <th>Where</th>
          </tr>
        </thead>
        <tbody>
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
        <button className="btn btn-primary" onClick={clearInputs}>Clear</button>
        &nbsp;
        <button className="btn btn-primary" onClick={searchWebs}>Search</button>
      </div>
      <br />
      <div className="function-explanation">
        <h2>Extension Analysis</h2>
        <p>Everytime you do a "Search", the results will display here. You have the option to see the differences (how many new extensions the query will add, and how many extesions the query will delete) between each query.</p>
        <p><b>WARNING: </b> In this version of the application, everytime you reload this page, the previous searches will be deleted.</p>
        <h2 className="center" id="status" style={{ display: "none" }}>Loading the query.</h2>
        <table id="resultTable" className="center-spacing">
          <thead>
            <tr>
              <th>Select</th>
              <th>Search</th>
              <th>Results</th>
              <th>Blockbusters</th>
              <th>New searchs</th>
              <th>Deleted searchs</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
        <br />
        <div className="right-buttons">
          <Link id="nextPage"
            to={{
              pathname: "/seleccionarWebs"
            }}
            onClick={() => selectRow()}>
            <button className="btn btn-primary">Next</button></Link>
        </div>
      </div><script>selectRow();</script>
    </div>
  );
}

export default withRouter(App);