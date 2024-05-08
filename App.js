import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, SafeAreaView, Image, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaperProvider, Button } from 'react-native-paper';
import GameScreen from './GameScreen';
import ExperimentSchedule from './ExperimentSchedule';

const logoTop = require('./assets/mirrly_full_size.png'); // Replace with your logo image path
const logoBottom = require('./assets/Sirrl_v.png'); // Replace with your logo image path

const App = () => {
  const [hashcode, setHashcode] = useState(null);
  const [inputHashcode, setInputHashcode] = useState('');

  useEffect(() => {
    checkStoredHashcode();
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
    setInputHashcode(text.slice(0, 8)); // Limit input to 8 characters
  };
  
  const handleManualLogin = async () => {
    try {
      const response = await axios.post(
        'http://172.20.10.4:5000/login',
        { hash_code: inputHashcode }
      );
      if (response.data.message == "Valid") {
        await AsyncStorage.setItem('hashcode', inputHashcode);
        setHashcode(inputHashcode);
      } else {
        console.error('Invalid hashcode');
      }
    } catch (error) {
      console.error('Error during manual login:', error);
    }
  };

  const remove_login = async () => {
    setInputHashcode(null);
    setHashcode(null);
    await AsyncStorage.removeItem('hashcode');
  };

  return (
    <PaperProvider>
        {hashcode ? (
          <SafeAreaView>
            <ExperimentSchedule hashcode={hashcode} />
            {/* <Text>Logged in with hashcode: {hashcode}</Text>
            <Button mode='contained' title="Logout" buttonColor='red' textColor='white' onPress={remove_login}>Enter</Button> */}
          </SafeAreaView>
        ) : (
          <SafeAreaView style={styles.container}>
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
              maxLength={8} // Limit input to 8 characters
              placeholderTextColor="#888" // Placeholder text color

            />
            <Button style={{width: '40%'}} mode="elevated" buttonColor='#781374' textColor='white' onPress={handleManualLogin}>Start</Button>
          </View>
          <Image source={logoBottom} style={styles.logoBottom} />
        </SafeAreaView>
        )}

    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
    width: '80%',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10, // Rounded corners
    width: '100%', // Full width
    maxWidth: 200, // Maximum width
    textAlign: 'center', // Center text and placeholder
  },
  logoBottom: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
    position: 'absolute',
    bottom: 20,
  },
});


export default App;
