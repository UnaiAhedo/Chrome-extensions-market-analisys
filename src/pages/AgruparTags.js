import React from "react";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { TagCloud } from 'react-tagcloud';

const data = [
    { value: 'JavaScript', count: 38 },
    { value: 'React', count: 30 },
    { value: 'Nodejs', count: 28 },
    { value: 'Express.js', count: 25 },
    { value: 'HTML5', count: 33 },
    { value: 'MongoDB', count: 18 },
    { value: 'CSS3', count: 20 },
    { value: 'JavaScripts', count: 38 },
    { value: 'Reacts', count: 30 },
    { value: 'Nodejss', count: 28 },
    { value: 'Express.jss', count: 25 },
    { value: 'HTML5s', count: 33 },
    { value: 'MongoDBs', count: 18 },
    { value: 'CSS3s', count: 20 },
]


function AgruparTags() {
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
                        />
                    </div>
                    <br />
                    <div className="right-buttons">
                        <button className="btn btn-primary">Group</button>
                        &nbsp;
                        <Link to="/seleccionarWebs"><button className="btn btn-primary">Back</button></Link>
                        &nbsp;
                        <Link to="/kanoModel"><button className="btn btn-primary">Next</button></Link>
                    </div>
                </div>
                <div>
                    <h2>Current aggrupation</h2>
                    <p>You can delete an aggrupation selecting it and clicking on "Delete".</p>
                    <div className="right-buttons">
                        <button className="btn btn-primary" >Delete</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withRouter(AgruparTags);