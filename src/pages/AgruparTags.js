import React from "react";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { TagCloud } from 'react-tagcloud';
const smalltalk = require('smalltalk');

class AgruparTags extends React.Component {

    componentDidMount() {
        // Load the tags into the cloud tag
        if (JSON.parse(localStorage.getItem('stateData')) != null) {
            this.setState({ data: JSON.parse(localStorage.getItem('stateData')) });
        }
        // Load the aggrupations into the table
        if (JSON.parse(localStorage.getItem('stateAggrupations')) != null) {
            let aggrupationsArray = JSON.parse(localStorage.getItem('stateAggrupations'))
            this.setState({ aggrupations: aggrupationsArray });
            aggrupationsArray.forEach(aggrupation => {
                this.addRow(true, aggrupation);
            });
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            data: [
            ],
            tags: [],
            aggrupations: []
        };
        this.createAggrupation = this.createAggrupation.bind(this);
        this.removeAggrupation = this.removeAggrupation.bind(this);
        this.removeAllAggrupations = this.removeAllAggrupations.bind(this);
        this.clearTags = this.clearTags.bind(this);
        this.search = this.search.bind(this);
        this.insertTagsCloudtag = this.insertTagsCloudtag.bind(this);
    }

    // Get the keywords and display in the tag cloud
    async search() {
        this.disableButtons();
        document.getElementById('status').style.display = "";
        var extensionsComments, featureComments, keywords, descriptions = null;
        // Get the comments
        var commentsURLs = JSON.parse(localStorage.getItem('commentsURLs'));
        if (commentsURLs != null) {
            extensionsComments = await this.getComments(commentsURLs);
        }
        // Get the featured comments
        if (extensionsComments != null) {
            featureComments = await this.getFeaturedComments(extensionsComments);
        }
        // Get the keywords and insert them into the tag cloud
        if (featureComments != null) {
            descriptions = JSON.parse(localStorage.getItem('descriptions'));
            let quantity = document.getElementById("quantityInput").value;
            keywords = await this.extractTopics(featureComments, descriptions, quantity);
            this.insertTagsCloudtag(keywords);
        }
        this.activateButtons();
        document.getElementById('status').style.display = 'none';
    }

    insertTagsCloudtag(keywords) {
        keywords = keywords.map(function (keyword) {
            var rKeyword = {};
            rKeyword['value'] = keyword.keyword;
            rKeyword['count'] = keyword.rake;
            return rKeyword;
        })
        this.setState({ data: keywords });
    }

    // Launch the fetch to the get the comments of the extensions
    // This comments will be used in next 
    async getComments(query) {
        let scrappingServiceIP = localStorage.getItem('SCRAPPING-SERVICE');
        return await fetch('http://' + scrappingServiceIP + '/extractComments', { // the body is an array with all the URLs from the selected extensions
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
            });
    }

    // Launch the fetch to the get the comments that are a feature request or bug report
    // This comments will be used in next steps
    async getFeaturedComments(extensionsComments) {
        // Map the comments to the correct format for the fetch 
        extensionsComments = extensionsComments.map(function (extensionsComments) {
            return extensionsComments.map(function (comment) {
                var rComment = {};
                rComment['review_id'] = comment.author;
                rComment['package_name'] = '';
                rComment['rating'] = comment.stars;
                rComment['title'] = '';
                rComment['body'] = comment.text;
                return rComment;
            })
        })

        // Flat the array to get all the comments in one array [comments]
        extensionsComments = extensionsComments.flat(1);
        let featureDetectionIP = localStorage.getItem('FEATURE-DETECTION-SERVICE');
        let corsProxyIP = localStorage.getItem('CORS-ANYWHERE');
        let features = await fetch('http://' + corsProxyIP + '/' + featureDetectionIP + '/hitec/classify/domain/google-play-reviews/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                "X-Requested-With": "XMLHttpRequest"
            },
            body: JSON.stringify(extensionsComments) // the body is an array of comments
        }).then(res => res.text()
            .then(text => JSON.parse(text)))
            .catch((error) => {
                console.log(error);
            });

        // Filter and remove all the comments that aren't a feature request
        // or an bug report
        if (features != null) {
            features = features.filter(comment => comment['cluster_is_feature_request'] === true || comment['cluster_is_bug_report'] === true);
        }

        if (features.length > 0) {
            return features
        } else {
            return null;
        }
    }

    // Launch the fetch that extract the topics/tags from the comments
    async extractTopics(featureComments, descriptions, quantity) {
        // Map the comments to the correct format for the fetch 
        featureComments = featureComments.map(function (comment) {
            var rComment = {};
            rComment['author'] = comment.review_id;
            rComment['date'] = '';
            rComment['stars'] = comment.rating;
            rComment['text'] = comment.body;
            return rComment;
        })

        // Get the average rating for the comments
        let average = featureComments.reduce((s, a) => parseInt(s) + parseInt(a.stars), 0) / featureComments.length;

        // Add the description of the extension as a new comment
        // With the average value of rating
        // This way te application also got the description in consideration
        descriptions = descriptions.map(function (description) {
            var rDescription = {};
            rDescription['author'] = '';
            rDescription['date'] = '';
            rDescription['stars'] = average;
            rDescription['text'] = description;
            return rDescription;
        })
        featureComments = featureComments.concat(descriptions);

        // Get the keywords from the comments
        let featureDetectionIP = localStorage.getItem('KEYWORD-EXTRACTION-SERVICE');
        let corsProxyIP = localStorage.getItem('CORS-ANYWHERE');
        let commentsKeywords = await fetch('http://' + corsProxyIP + '/' + featureDetectionIP + '/topics?items=' + quantity, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                "X-Requested-With": "XMLHttpRequest"
            },
            body: JSON.stringify(featureComments) // the body is an array with all the comments
        }).then(res => res.text()
            .then(text => JSON.parse(text)))
            .catch((error) => {
                console.log(error);
            });

        return commentsKeywords;
    }

    disableButtons() {
        let buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = true;
        });
        let link = document.getElementById('nextPage');
        link.style.pointerEvents = 'none';
        link = document.getElementById('previousPage');
        link.style.pointerEvents = 'none';
    }

    activateButtons() {
        let buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = false;
        });
        let link = document.getElementById('nextPage');
        link.style.pointerEvents = 'auto';
        link = document.getElementById('previousPage');
        link.style.pointerEvents = 'auto';
    }

    removeAllAggrupations() {
        var aggrupations = JSON.parse(localStorage.getItem('aggrupations'));
        if (aggrupations != null) {
            smalltalk
                .confirm('Delete all aggrupations', 'You are going to delete ' + aggrupations.length + ' aggrupations. Are you sure?')
                .then(() => {
                    var table = document.getElementById('aggrupationTable');
                    let item = [];
                    // For each aggrupation get the {value, count} pair for the tag cloud
                    aggrupations.forEach(aggrupationName => {
                        localStorage.removeItem(aggrupationName['name']);
                        item.push(this.state.aggrupations.filter(aggrupation => aggrupation.name === aggrupationName['value'])[0].groups);
                    });
                    // Do the changes in the state
                    this.setState({ data: this.state.data.concat(item.flat(1)) });
                    this.setState({ aggrupations: [] });
                    table.querySelector('tbody').innerHTML = '';
                    localStorage.removeItem('aggrupations');
                })
                .catch(() => {
                });
        }
    }

    removeAggrupation() {
        // Get the selected aggrupation/s
        var rowsNumber = document.querySelectorAll('input[name=aggrupationSelected]:checked').length;
        var table = document.getElementById('aggrupationTable');
        if (rowsNumber !== 0) {
            smalltalk
                .confirm('Delete aggrupations', 'You are going to delete ' + rowsNumber + ' aggrupations. Are you sure?')
                .then(() => {
                    let i = 1;
                    // For each aggrupation
                    while (i < table.rows.length) {
                        // For each one that is selected
                        if (table.rows[i].cells[0].children[0].checked) {
                            // Remove it from the table
                            let aggrupations = JSON.parse(localStorage.getItem('aggrupations'));
                            let aggrupationName = table.rows[i].cells[1].innerHTML;
                            table.deleteRow(i);
                            // Remove it from the local storage
                            aggrupations = aggrupations.filter(val => val['value'] !== aggrupationName);
                            localStorage.setItem('aggrupations', JSON.stringify(aggrupations));
                            localStorage.removeItem(aggrupationName);
                            // Do the changes in the state
                            let item = this.state.aggrupations.filter(aggrupation => aggrupation.name === aggrupationName);
                            this.setState({ data: this.state.data.concat(item[0].groups) });
                            item = this.state.aggrupations.filter(aggrupation => aggrupation.name !== aggrupationName);
                            this.setState({ aggrupations: item });
                        } else {
                            i++;
                        }
                    }
                })
                .catch(() => {
                });
        }
    }

    addRow(loadTable, aggrupation) {
        let aggrupationName;
        let keywords;
        if (loadTable) {
            aggrupationName = aggrupation.name;
            keywords = aggrupation.groups.map(function (keyword) {
                return keyword.value;
            });
        } else {
            aggrupationName = aggrupation;
            keywords = this.state.tags;
        }
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

        // Create the checkbox for selecting the extensions
        checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'aggrupationSelected';
        checkbox.value = 'aggrupation';
        checkbox.name = 'aggrupationSelected';

        newText = document.createTextNode(aggrupationName);
        let first = true;
        let tagsString = '';
        keywords.forEach(tag => {
            if (first) {
                tagsString += tag;
                first = false;
            } else {
                tagsString += ' - ' + tag;
            }
        });
        newText2 = document.createTextNode(tagsString);

        // Append the elements to the nodes
        newCell.appendChild(checkbox);
        newCell2.appendChild(newText);
        newCell3.appendChild(newText2);
    }

    async createAggrupation() {
        var aggrupationName = '';
        var aggrupations;

        // Get the aggrupation name from the user
        await smalltalk
            .prompt('Agrupation name', 'Introduce the name for the tags agrupation:')
            .then((value) => {
                aggrupationName = value;
            }).catch(() => {
                console.log('cancel');
            });
        // Check if it is possible to create the aggrupation
        if (aggrupationName !== '' && this.state.tags !== 0) {
            aggrupations = JSON.parse(localStorage.getItem('aggrupations'));
            if (aggrupations == null || aggrupationName in aggrupations) {
                // Add the aggrupation to the table
                if (this.state.tags != null && aggrupationName != null) {
                    this.addRow(false, aggrupationName);
                }
                // For each tag selected push it in an array
                let alteredData = [];
                let value = 0;
                this.state.tags.forEach(tag => {
                    alteredData.push(this.state.data.filter(val => val['value'] === tag)[0]);
                    value += this.state.data.filter(val => val['value'] === tag)[0].count;
                    this.setState({ data: this.state.data.filter(val => val['value'] !== tag) });
                });
                // Aggrupation value = sum(tags values)
                let item2 = { value: aggrupationName, name: aggrupationName, count: value };
                // Create the aggrupations array or push in case of existing
                if (aggrupations != null) {
                    aggrupations.push(item2);
                } else {
                    aggrupations = [];
                    aggrupations.push(item2);
                }
                // Save the agruppation name and the tags inside it
                localStorage.setItem('aggrupations', JSON.stringify(aggrupations));
                localStorage.setItem(aggrupationName, JSON.stringify(this.state.tags));
                // Name: name of the aggrupation - Groups: tags in that aggrupation
                let item = { name: aggrupationName, groups: alteredData };
                // Save the changes into the state to update the cloud tag
                this.setState({ aggrupations: this.state.aggrupations.concat(item) });
                this.clearTags();
            } else {
                alert("Already exists an aggrupation with that name.")
            }
        }
    }

    clearTags() {
        this.setState({ tags: [] });
        document.getElementById('selectedTagsP').innerHTML = "";
    }

    addSelectedTag(tag) {
        if (!this.state.tags.includes(tag.value)) {
            document.getElementById('selectedTagsP').innerHTML += tag.value + " - ";
            this.state.tags.push(tag.value);
        }
    }

    saveState() {
        localStorage.setItem('stateData', JSON.stringify(this.state.data));
        localStorage.setItem('stateAggrupations', JSON.stringify(this.state.aggrupations));
    }

    render() {
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
                        <h2>Tags quantity </h2>
                        <p>Introduce the number of tags that you want to extract from the previous selected extensions. This process will take a time. (The minimum value is 15).</p>
                        <input id='quantityInput' type='number' defaultValue='15' min='15' />
                        &nbsp;
                        <button className="btn btn-primary" onClick={this.search}>Search keywords</button>
                        <h2 className="center" id="status" style={{ display: "none" }}>Loading the keywords.</h2>
                    </div>
                    <br />
                    <div>
                        <h2>Tags aggrupation</h2>
                        <p>Select the desired tags, click on "Group" and put them a name. With this, you will group the tags associated to the extensions, into features. Once you finish grouping all the desired tags, click on "Next". The tags that you don't group won't be saved.</p>
                        <br />
                        <div className="cloud-wrapper">
                            <TagCloud id="prueba"
                                minSize={12}
                                maxSize={35}
                                tags={this.state.data}
                                className="simple-cloud"
                                onClick={tag => this.addSelectedTag(tag)}
                            />
                        </div>
                        <br />
                        <div className="selectedTags">
                            <p><b>Selected tags:</b></p><p id="selectedTagsP"></p>
                        </div>
                        <br />
                        <div className="right-buttons">
                            <button className="btn btn-primary" onClick={this.createAggrupation}>Group</button>
                            &nbsp;
                            <button className="btn btn-primary" onClick={this.clearTags}>Clear</button>
                            &nbsp;
                            <Link id="previousPage" to="/seleccionarWebs"><button className="btn btn-primary">Back</button></Link>
                            &nbsp;
                            <Link id="nextPage" to="/kanoModel" onClick={() => this.saveState()}><button className="btn btn-primary" >Next</button></Link>
                        </div>
                    </div>
                    <div>
                        <h2>Current aggrupations</h2>
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
                        <br />
                        <div className="right-buttons">
                            <button className="btn btn-primary" onClick={this.removeAggrupation}>Delete</button>
                            &nbsp;
                            <button className="btn btn-primary" onClick={this.removeAllAggrupations}>Delete all aggrupations</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(AgruparTags);