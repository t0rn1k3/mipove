import React from 'react';
import { Switch, Route } from 'react-router-dom';

import HomePage from './components/pages/homepage/HomePage';
import CategoryPage from './components/pages/homepage/category/CategoryPage';
import SignInAndSignUpPage from './components/SignInAndSignUp/SignInAndSignUpPage';
import Advertisements from './components/pages/advertisements/Advertisements';

import Header from './components/header/Header';

import { auth, createUserProfileDocument } from './firebase/FirebaseUtils';

import './App.css';



class App extends React.Component {
  constructor(){
    super();

    this.state = {
      currentUser : null
    }

  }

  unSubscribeFromAuth = null

  componentDidMount() {
    this.unSubscribeFromAuth = auth.onAuthStateChanged(async userAuth => {
      if(userAuth) {
        const userRef = await createUserProfileDocument(userAuth)

        userRef.onSnapshot(snapShot => {
          this.setState({
            currentUser: {
              id: snapShot.id,
              ...snapShot.data()
            }
          })
        });
      }
        this.setState({
          currentUser: userAuth
        })
    })
  }

  componentWillUnmount() {
    this.unSubscribeFromAuth();
  }


  render() {
    return (
      <div className="App"> 
        <Header currentUser={this.state.currentUser} />
          <Switch>
            <Route  exact path='/' component={HomePage} />
            <Route  path='/category' component={CategoryPage} />  
            <Route path='/advertisements' component={Advertisements}/>  
            <Route  path='/signin' component={SignInAndSignUpPage} />
          </Switch>
      </div>
    );

  }
}

export default App;
