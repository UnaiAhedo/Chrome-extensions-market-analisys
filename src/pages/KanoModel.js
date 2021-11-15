import React from "react";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Draggable from 'react-draggable';
import kanoModelImage from '../images/kanoModel.jpg'

class KanoModel extends React.Component {

    mapToDraggables(aggrupation) {
        return <Draggable key={aggrupation}><p>{aggrupation}</p></Draggable>;
    }

    createDragabbles() {
        var aggrupations = JSON.parse(localStorage.getItem('aggrupations'));
        if (aggrupations != null) {
            return aggrupations.map(this.mapToDraggables);
        } else {
            return;
        }
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
                        <Breadcrumb.Item>Tags aggrupation</Breadcrumb.Item>
                        <Breadcrumb.Item active>Kano model</Breadcrumb.Item>
                    </Breadcrumb>
                </div>
                <div className="function-explanation">
                    <h2>Kano model</h2>
                    <p>Now you can classify the features into the Kano model, for that, just drag the features to the kano model. After that, you can download it.</p>
                    <img className="center" src={kanoModelImage} alt="Kano model example" style={{ width: 625, height: 500 }} />
                    <br />
                    <div className="right-buttons">
                        <button className="btn btn-primary">Download</button>
                        &nbsp;
                        <Link to="/agruparTags"><button className="btn btn-primary">Back</button></Link>
                        &nbsp;
                        <Link to="/"><button className="btn btn-primary">Home</button></Link>
                    </div>
                    <div>
                        <h2>Aggrupations to classify</h2>
                        <br />
                        {this.createDragabbles()}
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(KanoModel);