import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Login from './components/Login';
import Register from './components/Register';
import DataGridComponent from './components/DataGrid';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/data" component={DataGridComponent} />
        </Switch>
      </Router>
    </Provider>
  );
}

export default App;
