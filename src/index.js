import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import SeleccionarWebs from './SeleccionarWebs';
import { BrowserRouter, Route } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import AgruparTags from './AgruparTags';
import KanoModel from './KanoModel';
import './App.css';

ReactDOM.render(
  <BrowserRouter>
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
