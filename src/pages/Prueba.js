import React from 'react';

function Prueba() {

    async function getTopics() {
        return await fetch('   ', { // Put the path to the API
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                {  } // Put the data JSON
            )
        }).then(res => res.text())
            .then(text => console.log(JSON.parse(text)))
            .catch((error) => {
                console.log(error)
            });
    }

    async function prueba() {
        getTopics();
    }

    return (
        <div className="App">
            <button onClick={prueba}>Prueba</button>
        </div>
    );
}

export default Prueba;