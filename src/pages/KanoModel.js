import React from "react";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Draggable from 'react-draggable';
import kanoModelImage from '../images/kanoModel.jpg'
import { TagCloud } from 'react-tagcloud';
import { CSVLink } from 'react-csv';
import html2canvas from 'html2canvas';

class KanoModel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [
            ],
            downloadData: [

            ]
        };
        this.prepareDownloadData = this.prepareDownloadData.bind(this);
    }

    componentDidMount() {
        this.loadTagCloud();
    }

    loadTagCloud() {
        if (JSON.parse(localStorage.getItem('aggrupations')) != null) {
            this.setState({ data: JSON.parse(localStorage.getItem('aggrupations')) });
        }
    }

    mapToDraggables(aggrupation) {
        return <Draggable key={aggrupation}><p>{aggrupation}</p></Draggable>;
    }

    createDragabbles() {
        var aggrupations = JSON.parse(localStorage.getItem('aggrupations'));
        if (aggrupations != null) {
            aggrupations = aggrupations.map(function (aggrupation) {
                return aggrupation.name;
            });
            return aggrupations.map(this.mapToDraggables);
        } else {
            return;
        }
    }

    showAggrupation(tag) {
        let tags = JSON.parse(localStorage.getItem(tag));
        if (tags != null) {
            alert(tag + " got the next tags: " + tags);
        }
    }

    doScreenshoot() {
        const captureElement = document.querySelector('div.function-explanation');
        html2canvas(captureElement)
            .then(canvas => {
                canvas.style.display = 'none'
                document.body.appendChild(canvas)
                return canvas
            })
            .then(canvas => {
                const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
                const a = document.createElement('a')
                a.setAttribute('download', 'kano-model.png')
                a.setAttribute('href', image)
                a.click()
                canvas.remove()
            })
    }

    prepareDownloadData() {
        let aggrupations = JSON.parse(localStorage.getItem('aggrupations'));
        if (aggrupations != null) {
            let itemToPush;
            let array = [];
            aggrupations.forEach(aggrupation => {
                let tagsArray = JSON.parse(localStorage.getItem(aggrupation.name));
                itemToPush = { feature: aggrupation.name, aggrupationValue: aggrupation.count, tags: tagsArray };
                array.push(itemToPush);
            });
            this.setState({ downloadData: array });
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
                    <ul>
                        <li><b>Deligther:</b> Unexpected features or characteristics that impress customers.</li>
                        <li><b>Satisfier:</b> These features provide satisfaction when achieved fully, but do not cause dissatisfaction when not fulfilled.</li>
                        <li><b>Indifferent:</b> These features refer to aspects that are neither good nor bad, and they do not result in either customer satisfaction or customer dissatisfaction.</li>
                        <li><b>Basic:</b> These are the requirements that the customers expect and are taken for granted. </li>
                    </ul>
                    <img className="center" src={kanoModelImage} alt="Kano model example" style={{ width: 625, height: 500 }} />
                    <br />
                    <div className="right-buttons">
                        <CSVLink data={this.state.downloadData}><button className="btn btn-primary" onClick={this.prepareDownloadData}>Download CSV</button></CSVLink>
                        &nbsp;
                        <button className="btn btn-primary" onClick={this.doScreenshoot}>Download PNG</button>
                        &nbsp;
                        <Link to="/agruparTags"><button className="btn btn-primary">Back</button></Link>
                        &nbsp;
                        <Link to="/"><button className="btn btn-primary">Home</button></Link>
                    </div>
                    <div>
                        <h2>Aggrupations to classify</h2>
                        <p>The next cloud tag will contain the aggrupations that you created, and those aggrupations will be ordered from more important to less important (from big to small).</p>
                        <div className="cloud-wrapper">
                            <TagCloud id="prueba"
                                minSize={12}
                                maxSize={35}
                                tags={this.state.data}
                                className="simple-cloud"
                                onClick={tag => this.showAggrupation(tag.value)}
                            />
                        </div>
                        <br />
                    </div>
                    <div className='draggables'>
                        {this.createDragabbles()}
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(KanoModel);