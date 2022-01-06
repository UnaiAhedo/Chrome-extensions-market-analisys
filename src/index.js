import React from 'react';
import ReactDOM from 'react-dom';
import './style/index.css';
import App from './pages/App';
import reportWebVitals from './reportWebVitals';
import SeleccionarWebs from './pages/SeleccionarWebs';
import AgruparTags from './pages/AgruparTags';
import KanoModel from './pages/KanoModel';
import { BrowserRouter, Route } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import './style/App.css';

ReactDOM.render(
  <BrowserRouter basename="/">
    <Route exact path="/" component={App} />
    <Route path="/seleccionarWebs" component={SeleccionarWebs} />
    <Route path="/agruparTags" component={AgruparTags}/>
    <Route path="/kanoModel" component={KanoModel}/>
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
