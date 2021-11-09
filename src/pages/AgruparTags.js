import React from "react";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { TagCloud } from 'react-tagcloud';
const smalltalk = require('smalltalk');

var localStorage = window.localStorage;

function AgruparTags() {
    const data = [
        { value: 'Save as word', count: 38 },
        { value: 'Highlight', count: 30 },
        { value: 'Delete marks', count: 28 },
        { value: 'Export to drive', count: 25 },
        { value: 'Save as PDF', count: 33 },
        { value: 'Cut', count: 18 },
        { value: 'Copy', count: 20 },
        { value: 'Paste', count: 38 },
        { value: 'Add comments', count: 30 }
    ]

    var tags = [];

    //var comments = await getComments(responseURLs);
    async function getComments(query) {
        if (query.length !== 0) {
            return await fetch('http://localhost:4000/extractComments', { // the body is a JSON with all the URLs from the extensions
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    { query }
                )
            }).then(res => res.text())
                .then(text => JSON.parse(text));
        }
    }

    function removeAllAggrupations() {
        var aggrupations = JSON.parse(localStorage.getItem('aggrupations'));
        if (aggrupations != null) {
            smalltalk
                .confirm('Delete all aggrupations', 'You are going to delete ' + aggrupations.length + ' aggrupations. Are you sure?')
                .then(() => {
                    var table = document.getElementById('aggrupationTable');
                    aggrupations.forEach(aggrupation => {
                        localStorage.removeItem(aggrupation);
                        table.querySelector('tbody').innerHTML = '';
                    });
                    localStorage.removeItem('aggrupations');
                })
                .catch(() => {
                });
        }
    }

    function removeAggrupation() {
        var rowsNumber = document.querySelectorAll('input[name=aggrupationSelected]:checked').length;
        var table = document.getElementById('aggrupationTable');
        if (rowsNumber !== 0) {
            smalltalk
                .confirm('Delete aggrupations', 'You are going to delete ' + rowsNumber + ' aggrupations. Are you sure?')
                .then(() => {
                    let i = 1;
                    while (i < table.rows.length) {
                        if (table.rows[i].cells[0].children[0].checked) {
                            let aggrupations = JSON.parse(localStorage.getItem('aggrupations'));
                            let aggrupation = table.rows[i].cells[1].innerHTML;
                            aggrupations = aggrupations.filter(val => val !== aggrupation);
                            localStorage.setItem('aggrupations', JSON.stringify(aggrupations));
                            localStorage.removeItem(aggrupation);
                            table.deleteRow(i);
                        } else {
                            i++;
                        }
                    }
                })
                .catch(() => {
                });
        }
    }

    function addRow(aggrupationName) {
        if (tags != null && aggrupationName != null) {
            var tbodyRef = document.getElementById('aggrupationTable').getElementsByTagName('tbody')[0];

            // Insert a row at the end of table
            var newRow = tbodyRef.insertRow();

            // Insert a cell at the end of the row
            var newCell = newRow.insertCell();
            var newCell2 = newRow.insertCell();
            var newCell3 = newRow.insertCell();

            var checkbox;
            var newText;
            var newText2;

            checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'aggrupationSelected';
            checkbox.value = 'aggrupation';
            checkbox.name = 'aggrupationSelected';

            newText = document.createTextNode(aggrupationName);
            let first = true;
            let tagsString = '';
            tags.forEach(tag => {
                if (first) {
                    tagsString += tag;
                    first = false;
                } else {
                    tagsString += ' - ' + tag;
                }
            });
            newText2 = document.createTextNode(tagsString);

            newCell.appendChild(checkbox);
            newCell2.appendChild(newText);
            newCell3.appendChild(newText2);
        }
    }

    async function createAggrupation() {
        var aggrupationName = '';
        var aggrupations;
        await smalltalk
            .prompt('Agrupation name', 'Introduce the name for the tags agrupation:')
            .then((value) => {
                aggrupationName = value;
            }).catch(() => {
                console.log('cancel');
            });
        if (aggrupationName != '' && tags.length != 0) {
            aggrupations = JSON.parse(localStorage.getItem('aggrupations'));
            if (aggrupations == null || !aggrupations.includes(aggrupationName)) {
                if (aggrupations != null) {
                    aggrupations.push(aggrupationName);
                } else {
                    aggrupations = [];
                    aggrupations.push(aggrupationName);
                }
                localStorage.setItem('aggrupations', JSON.stringify(aggrupations));
                localStorage.setItem(aggrupationName, JSON.stringify(tags));
                addRow(aggrupationName);
                clearTags();
            } else {
                alert("Already exists an aggrupation with that name.")
            }

        }
    }

    function clearTags() {
        tags = [];
        document.getElementById('selectedTagsP').innerHTML = "";
    }

    function addSelectedTag(tag) {
        if (!tags.includes(tag.value)) {
            document.getElementById('selectedTagsP').innerHTML += tag.value + " - ";
            tags.push(tag.value)
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
                    <Breadcrumb.Item>Extension selection</Breadcrumb.Item>
                    <Breadcrumb.Item active>Tags aggrupation</Breadcrumb.Item>
                    <Breadcrumb.Item>Kano model</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div className="function-explanation">
                <div>
                    <h2>Tags aggrupation</h2>
                    <p>Select the desired tags, click on "Group" and put them a name. With this, you will group the tags associated to the extensions, into features. Once you finish grouping all the desired tags, click on "Next". The tags that you don't group won't be saved.</p>
                    <br />
                    <div className="cloud-wrapper">
                        <TagCloud id="prueba"
                            minSize={12}
                            maxSize={35}
                            tags={data}
                            className="simple-cloud"
                            onClick={tag => addSelectedTag(tag)}
                        />
                    </div>
                    <br />
                    <div className="selectedTags">
                        <p><b>Selected tags:</b></p><p id="selectedTagsP"></p>
                    </div>
                    <br />
                    <div className="right-buttons">
                        <button className="btn btn-primary" onClick={createAggrupation}>Group</button>
                        &nbsp;
                        <button className="btn btn-primary" onClick={clearTags}>Clear</button>
                        &nbsp;
                        <Link to="/seleccionarWebs"><button className="btn btn-primary">Back</button></Link>
                        &nbsp;
                        <Link to="/kanoModel"><button className="btn btn-primary">Next</button></Link>
                    </div>
                </div>
                <div>
                    <h2>Current aggrupation</h2>
                    <p>You can delete an aggrupation selecting it and clicking on "Delete".</p>
                    <table id="aggrupationTable" className="center-spacing">
                        <thead>
                            <tr>
                                <th>Select</th>
                                <th>Aggrupation name</th>
                                <th>Tags in aggrupation</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                    <div className="right-buttons">
                        <button className="btn btn-primary" onClick={removeAggrupation}>Delete</button>
                        &nbsp;
                        <button className="btn btn-primary" onClick={removeAllAggrupations}>Delete all aggrupations</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withRouter(AgruparTags);