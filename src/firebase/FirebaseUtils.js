import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';




const firebaseConfig = {
  apiKey: "AIzaSyD-U0yseS80C4JOuEqM2o93KD8Wq5ovl2k",
  authDomain: "mipove-5de73.firebaseapp.com",
  projectId: "mipove-5de73",
  storageBucket: "mipove-5de73.appspot.com",
  messagingSenderId: "876914712907",
  appId: "1:876914712907:web:e2db0ef667de8769f048ce",
  measurementId: "G-KB6PF02Z3G"
};

export const createUserProfileDocument = async (userAuth, additionalData) => {
  if(!userAuth) return;

  const userRef = firestore.doc(`users/${userAuth.uid}`)

  const snapShot = await userRef.get();

  if(!snapShot.exists) {
    const { displayName, email } = userAuth;
    const createdDate = new Date();

    try{
      await userRef.set({
        displayName,
        email,
        createdDate,
        ...additionalData
      })
    }catch (error) {
      console.log('erorr in creating user', error.message)
    }
  }

  return userRef;
}


firebase.initializeApp(firebaseConfig)

export const auth = firebase.auth();
export const firestore = firebase.firestore();

const provider = new firebase.auth.GoogleAuthProvider();

provider.setCustomParameters({
    'login_hint': 'user@example.com'
  });

  export const signWithGoogle = () => auth.signInWithPopup(provider);


  export default firebase;

  