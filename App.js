import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, SafeAreaView, Image, StyleSheet, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaperProvider, Button } from 'react-native-paper';
import ExperimentSchedule from './ExperimentSchedule';

const logoTop = require('./assets/mirrly_full_size.png');
const logoBottom = require('./assets/Sirrl_v.png');

const App = () => {
  const [hashcode, setHashcode] = useState(null);
  const [inputHashcode, setInputHashcode] = useState('');
  const [condition, setCondition] = useState('c1'); // default condition is C1

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
    setInputHashcode(text.slice(0, 8).toLowerCase());
  };

  const handleManualLogin = async () => {
    try {
      const response = await axios.post(
        'http://172.20.10.3:5000/login',
        { hash_code: inputHashcode }
      );
      if (response.data.message === "Valid") {
        await AsyncStorage.setItem('hashcode', inputHashcode);
        setHashcode(inputHashcode);
        // Set the condition based on the response or some other logic
        setCondition(response.data.condition || 'c1'); // Example logic
      } else {
        console.error('Invalid hashcode');
      }
    } catch (error) {
      console.error('Error during manual login:', error);
    }
  };

  const removeLogin = async () => {
    setInputHashcode('');
    setHashcode(null);
    await AsyncStorage.removeItem('hashcode');
  };

  return (
    <PaperProvider>
      {hashcode ? (
        <View style={styles.container}>
          <ExperimentSchedule hashcode={hashcode} condition={condition} />
          {/* <Text style={{ marginBottom: '2%' }}>Logged in with {hashcode}</Text> */}
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
            </View>
          </KeyboardAvoidingView>
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
});

export default App;
