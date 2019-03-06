import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, Text, View, TextInput } from 'react-native';
import {Linking, WebBrowser} from 'expo'
import * as firebase from 'firebase'

const firebaseConfig = {
  apiKey: "AIzaSyCJbqmIbNsDdoG9CGPatdlB12NKqSQ-K4o",
    authDomain: "sales-assitant-b807d.firebaseapp.com",
    databaseURL: "https://sales-assitant-b807d.firebaseio.com",
    projectId: "sales-assitant-b807d",
    storageBucket: "sales-assitant-b807d.appspot.com",
    messagingSenderId: "220292660121"
}

const captchaUrl = 'https://sales-assitant-b807d.firebaseapp.com/'

firebase.initializeApp(firebaseConfig)

export default class App extends React.Component {
  state = {
    phone: '',
    user: null,
    confirmResult: null,
    code: '',
    loading: true
  }

  componentDidMount(){
    firebase.auth().onAuthStateChanged(user => {
      this.setState({user, loading: false})
    })
  }

  login = async ()=>{
    //alert(this.state.num)
    console.log(this.state.phone)

    let token  = null
    const listener = ({url})=>{
      WebBrowser.dismissBrowser()
      const tokenEncoded = Linking.parse(url).queryParams['token']
      if (tokenEncoded)
          token = decodeURIComponent(tokenEncoded)
    }
    Linking.addEventListener('url', listener)
    await WebBrowser.openBrowserAsync(captchaUrl)
    Linking.removeEventListener('url', listener)
    if (token) {
            const {phone} = this.state
            //fake firebase.auth.ApplicationVerifier
            const captchaVerifier = {
                type: 'recaptcha',
                verify: () => Promise.resolve(token)
            }
            try {
                const confirmResult = await firebase.auth().signInWithPhoneNumber(phone, captchaVerifier)
                this.setState({confirmResult})
            } catch (e) {
                console.warn(e)
            }

    }
  }
  
  verify = async()=>{
    const {confirmResult, code} = this.state
    try {
      await confirmResult.confirm(code)
    } catch(e){
      console.warn(e)
    }
    this.reset()
  }

  logout = async () => {
        try {
            await firebase.auth().signOut()
        } catch (e) {
            console.warn(e)
        }
  }

  reset = () => {
        this.setState({
            phone: '',
            confirmResult: null,
            code: ''
        })
  }

  render() {
    let {loading, confirmResult, user} = this.state

    if (loading) return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size='large' color='#0000ff' /> 
      </View>
    )

    if (user){
      return(
        <View style={styles.container}>
          <Text style={{fontSize: 24}}>You're in</Text>
          
          <TouchableOpacity style={styles.btn}
            onPress = {this.logout}>
            <Text style={{fontSize: 24, alignSelf: 'center', color: '#FFF'}}>Logout</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (!confirmResult){
      return (
        <View style={styles.container}>
          <TextInput
            style = {styles.input}
            autoFocus
            placeholder='phone number'
            onChangeText={(phone)=>this.setState({phone})}
            keyboardType='phone-pad'
          />
          <TouchableOpacity style={styles.btn}
            onPress = {this.login}>
            <Text style={{fontSize: 24, alignSelf: 'center', color: '#FFF'}}>Login</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <TextInput
          style = {styles.input}
          autoFocus  
          placeholder='verification code'
          onChangeText={(code)=>this.setState({code})}
          keyboardType='phone-pad'
        />
        <TouchableOpacity style={styles.btn}
          onPress = {this.verify}>
            <Text style={{fontSize: 24, alignSelf: 'center', color: '#FFF'}}>Verify</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    padding: 10,
    backgroundColor: '#000',
    paddingHorizontal: 50,
    borderRadius: 10
  },
  input: {
    borderColor: '#1d1d1d',
    borderWidth: 0.4,
    width: 300,
    borderRadius: 5,
    marginBottom: 20
  }
});
