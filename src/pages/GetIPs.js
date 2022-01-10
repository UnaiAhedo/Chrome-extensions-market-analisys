import React, { useEffect } from "react";
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

function GetIPs() {

    useEffect(() => {
        loadPage();
    }, []);

    function loadPage() {
        var cors = localStorage.getItem('CORS-ANYWHERE');
        var scrapping = localStorage.getItem('SCRAPPING-SERVICE');
        var features = localStorage.getItem('FEATURE-DETECTION-SERVICE');
        var keywords = localStorage.getItem('KEYWORD-EXTRACTION-SERVICE');

        if (cors != null) {
            document.getElementById('cors').value = cors;
            document.getElementById('scrapping').value = scrapping;
            document.getElementById('features').value = features;
            document.getElementById('keywords').value = keywords;
        }
    }

    function saveIPs() {
        var cors = document.getElementById('cors').value;
        var scrapping = document.getElementById('scrapping').value;
        var features = document.getElementById('features').value;
        var keywords = document.getElementById('keywords').value;

        if (cors !== '' & scrapping !== '' & features !== '' & keywords !== '') {
            localStorage.setItem('CORS-ANYWHERE', cors);
            localStorage.setItem('SCRAPPING-SERVICE', scrapping);
            localStorage.setItem('FEATURE-DETECTION-SERVICE', features);
            localStorage.setItem('KEYWORD-EXTRACTION-SERVICE', keywords);
        } else {
            alert('Please, introduce all the IPs.')
        }

    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Configuration</h1>
            </header>
            <div className="function-explanation">
                <h2>Saving IPs</h2>
                <p>You need to insert the Ips in the next inputs. Use the default IP:PORT format, for example: 127.0.0.0:8080. If you run the services in localhost, to avoid errors, use the default IP of your machine (not localhost or 127.0.0.1).</p>
                <p>The the IP will be the machine IP, and the default PORTs of the services will be the next ones:</p>
                <ul>
                    <li><b>Cors-anywhere:</b> 5000</li>
                    <li><b>Scrapping service:</b> 4000</li>
                    <li><b>Feature detection:</b> 9651</li>
                    <li><b>Keyword extraction:</b> 8000</li>
                </ul>
                <p><b>Cors-anywhere:</b> &nbsp; <input id='cors' style={{ width: '250px' }} /></p>
                <br />
                <p><b>Scrapping service:</b> &nbsp; <input id='scrapping' defaultValue='0.0.0.0:4000' style={{ width: '250px' }} /></p>
                <br />
                <p><b>Feature detection:</b> &nbsp; <input id='features' defaultValue='0.0.0.0:9651' style={{ width: '250px' }} /></p>
                <br />
                <p><b>Keyword extraction:</b> &nbsp; <input id='keywords' defaultValue='0.0.0.0:8000' style={{ width: '250px' }} /></p>
                <br />
                <br />
                <button className="btn btn-primary" onClick={saveIPs}>Save IPs</button>
                &nbsp;
                <Link to="/"><button className="btn btn-primary">Back</button></Link>
            </div>
        </div>
    );
}

export default withRouter(GetIPs);