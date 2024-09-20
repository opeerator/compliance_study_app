import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, SafeAreaView, Image, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaperProvider, Button } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import ExperimentSchedule from './ExperimentSchedule';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs() // Not showing logs

const logoTop = require('./assets/mirrly_full_size.png');
const logoBottom = require('./assets/Sirrl_v.png');
const logoNoInternet = require('./assets/mirrly_full_size_greyscale.png');

const App = () => {
  const [hashcode, setHashcode] = useState(null);
  const [inputHashcode, setInputHashcode] = useState('');
  const [condition, setCondition] = useState('c1'); // default condition is C1
  const [isConnected, setIsConnected] = useState(true); // new state for internet connection status
  const [error, seterror] = useState(null);

  useEffect(() => {
    checkStoredHashcode();
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkStoredHashcode = async () => {
    try {
      const storedHashcode = await AsyncStorage.getItem('hashcode');
      if (storedHashcode) {
        setHashcode(storedHashcode);
      }
    } catch (error) {
      console.error('Error retrieving hashcode from storage:', error);
    }
  };

  const handleInputChange = (text) => {
    setInputHashcode(text.slice(0, 8).toLowerCase());
    seterror(null);
  };

  const handleManualLogin = async () => {
    if (!isConnected) return; // prevent login if not connected
    try {
      const response = await axios.post(
        'http://129.97.228.209:8080/login',
        { hash_code: inputHashcode }
      );
      if (response.data.message === "Valid") {
        await AsyncStorage.setItem('hashcode', inputHashcode);
        setHashcode(inputHashcode);
        setCondition(response.data.condition || 'c1'); // Example logic
      } else {
        console.error('Invalid hashcode');
      }
    } catch (error) {
      if(error.response === undefined) {
        console.error('network error!');
        seterror("There is a problem connecting to the server!")
      }
      if (error.response.status === 403 ) {
        console.error('Participation code is not valid!');
        seterror("Participation code is not valid!")
      }
    }
  };

  const removeLogin = async () => {
    setInputHashcode('');
    setHashcode(null);
    await AsyncStorage.removeItem('hashcode');
  };

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.noInternetContainer}>
        <Image source={logoNoInternet} style={styles.logoTop} />
        <Text style={styles.noInternetText}>Please make sure your device is connected to the internet</Text>
      </SafeAreaView>
    );
  }

  return (
    <PaperProvider>
      {hashcode ? (
        <View style={styles.container}>
          <ExperimentSchedule hashcode={hashcode} condition={condition} logout={removeLogin} />
          {/* <Button mode="elevated" buttonColor='#781374' textColor='white' onPress={removeLogin}>Logout</Button> */}
        </View>
      ) : (
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Dimensions.get('window').height / 2 - 350}
          >
            <View style={styles.logoContainer}>
              <Image source={logoTop} style={styles.logoTop} />
              <Text style={styles.title}>Welcome to the experiment!</Text>
              <Text style={styles.subtitle}>Please enter your participation code to start.</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="8 character code"
                onChangeText={handleInputChange}
                value={inputHashcode}
                maxLength={8}
                placeholderTextColor="gray"
              />
              <Button
                style={{ width: '40%' }}
                mode="elevated"
                buttonColor='#781374'
                textColor={inputHashcode.length < 8 ? '#781374' : 'white'}
                disabled={inputHashcode.length < 8}
                onPress={handleManualLogin}
              >
                Enter
              </Button>
              {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
            </View>
          </KeyboardAvoidingView>
          <Image source={logoBottom} style={styles.logoBottom} />
        </SafeAreaView>
      )}
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: 'red', // Or any other color you prefer
    fontSize: 16,
    marginTop: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center', // Center vertically
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  logoTop: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 10,
    color: '#888',
  },
  inputContainer: {
    marginTop: 2,
    width: '100%',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#781374', // Purple border color
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    width: '50%',
    textAlign: 'center',
    color: '#781374', // Purple text color for entered code
    backgroundColor: '#fff', // White background color
  },
  placeholder: {
    color: '#781374', // Purple placeholder text color
  },
  logoBottom: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
    position: 'absolute',
    bottom: 20,
  },
  noInternetContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noInternetText: {
    fontSize: 20,
    color: '#781374',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default App;
