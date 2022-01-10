import React, { Component } from 'react';
import { Route, HashRouter } from 'react-router-dom';
import SearchWebs from './SearchWebs';
import SeleccionarWebs from './SeleccionarWebs';
import AgruparTags from './AgruparTags';
import KanoModel from './KanoModel';
import GetIPs from './GetIPs';

class App extends Component {
  render() {
    return (
      <div>
        <HashRouter>
          <Route exact path="/" component={SearchWebs} />
          <Route path="/seleccionarWebs" component={SeleccionarWebs} />
          <Route path="/agruparTags" component={AgruparTags} />
          <Route path="/kanoModel" component={KanoModel} />
          <Route path="/getIPs" component={GetIPs} />
        </HashRouter>
      </div>
    );
  }
}

export default App;