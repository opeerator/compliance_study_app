import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Modal } from 'react-native';
import { AntDesign, FontAwesome6 } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';

const GameScreen = ({ gday, onGameEnd }) => {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  const [totalItems, settotalItems] = useState(0)
  const [touchCount, setTouchCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [hashcode, setHashcode] = useState('');
  const [gameActive, setGameActive] = useState(true); // New state for game activity
  const q_icon_sets = ['face-sad-cry','sad-tear','smile-beam','face-grin-wide','face-grin-stars'];
  const [questionAnswers, setQuestionAnswers] = useState(Array(5).fill('')); // Array to store answers to questions
  const timerRef = useRef(null);
  const timerStarted = useRef(true); // Track if the timer has started
  const [facing, setFacing] = useState('front');
  const [Cview, setCview] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState(null);
  const cref = useRef(null)

  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false); // New state to check if all questions are answered
  useEffect(() => {
    // Check if all questions are answered and a photo is uploaded
    const allAnswered = questionAnswers.every(answer => answer !== '');
    setAllQuestionsAnswered(allAnswered && photoUri !== null);
  }, [questionAnswers, photoUri]);

  function TakePicture() {
    if (!permission) {
      // Camera permissions are still loading.
      console.log("Camera is loading!")
    }
  
    if (!permission.granted) {
      // Camera permissions are not granted yet.
      requestPermission();
    }
    if (permission.granted) {
      // permissions are there
      setCview(true);
    }
  }

  const HandlecView = async () => {
    const photo = await cref.current.takePictureAsync()
    setCview(false);
    setPhotoUri(photo.uri);
  }

  useEffect(() => {
    const fetchData = async () => {
      const storedHashcode = await AsyncStorage.getItem('hashcode');
      setHashcode(storedHashcode);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (gameActive) {
      const itemTimer = setInterval(() => {
        const newItem = {
          id: Date.now(), // Unique ID for each item
          opacity: new Animated.Value(0), // Initial opacity set to 0 for fade-in effect
          left: getRandomPosition(Dimensions.get('window').width - 20), // Random left position within screen bounds
          top: getRandomPosition(Dimensions.get('window').height - 200), // Random top position within screen bounds
          timer: setTimeout(() => {
            setItems(prevItems => prevItems.filter(item => item.id !== newItem.id));
          }, 2000), // Remove item after 2 seconds
        };
  
        // Start the fade-in animation
        Animated.timing(newItem.opacity, {
          toValue: 1,
          duration: 500, // Duration of fade-in animation
          useNativeDriver: true,
        }).start();
  
        settotalItems(prevTotal => prevTotal + 1); // Use functional update
  
        setItems(prevItems => [...prevItems, newItem]);
      }, 2000); // Adjust the time as needed
  
      return () => {
        clearInterval(itemTimer);
        items.forEach(item => clearTimeout(item.timer));
      };
    }
  }, [gameActive]);

  useEffect(() => {
    if (timerStarted.current) {
      // Start the game timer only if it hasn't started before
      timerRef.current = setInterval(() => {
        setProgress(prevProgress => prevProgress + (100 / 120)); // Assuming 120 seconds for the game
      }, 1000); // Update every second

      // Set a timeout for game over after 2 minutes (120 seconds)
      const gameOverTimeout = setTimeout(() => {
        clearInterval(timerRef.current); // Stop the game timer
        setModalVisible(true); // Show the modal
        setGameActive(false); // Stop generating items
      }, 120000); // 2 minutes in milliseconds

      return () => {
        clearInterval(timerRef.current);
        clearTimeout(gameOverTimeout);
      };
    }
  }, [timerStarted.current]);

  const getRandomPosition = max => Math.random() * max;

  const handleModalClose = async () => {
    setModalVisible(false);
    setProgress(0); // Reset the progress
    timerStarted.current = false; // Reset timer started flag
    setGameActive(true); // Reactivate the game
    try {
      const formData = new FormData();
      formData.append('hash_code', hashcode);
      formData.append('game_day', gday);
      formData.append('clicks', touchCount); // Use touchCount instead of count
      formData.append('selected_items', count); // Add logic to track selected items if needed
      formData.append('total_items', totalItems); // Use captured totalItems
      formData.append('questions', questionAnswers.join(',')); // Array of answers to questions
      if (photoUri) {
        const filename = photoUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('image', {
          uri: photoUri,
          name: filename,
          type
        });
      }
      
      const response = await axios.post('http://129.97.228.209:8080/send_game_data', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data); // Log response from the server
      let numberObj = count;
      setCount(0); // Reset the count
      setTouchCount(0); // Reset the touchCount
      settotalItems(0);
      if (photoUri !== null) {
        onGameEnd(numberObj, true); // Invoke the callback to update the status in ExperimentSchedule
      } else {
        onGameEnd(numberObj, false); // Invoke the callback to update the status in ExperimentSchedule
      }
    } catch (error) {
      console.error('Error sending game data:', error);
    }
  };
  

  const handleItemPress = id => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    setCount(prevCount => prevCount + 1);
    // if (!timerStarted.current) {
    //   timerStarted.current = true; // Start the timer on first item press
    // }
  };

  const setQuestionAnswer = (questionIndex, answer) => {
    const newAnswers = [...questionAnswers];
    newAnswers[questionIndex] = answer;
    setQuestionAnswers(newAnswers);
  };

  const addClickCount = () => {
    if(modalVisible === false && Cview === false) {
      setTouchCount(prevTouchCount => prevTouchCount + 1)
    }
  };


  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <TouchableOpacity 
        style={styles.touchableArea} 
        onPress={addClickCount}
        activeOpacity={1} // Ensure touch events are registered
      >
        <View style={styles.titleCount}>
          <Text style={styles.countText}>Objects found: {count}</Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <View style={styles.container}>
          {items.map(item => (
            <Animated.View
              key={item.id}
              style={[styles.item, { left: item.left, top: item.top, opacity: item.opacity }]}
            >
              <TouchableOpacity onPress={() => handleItemPress(item.id)}>
                <AntDesign name="hearto" size={35} color="#781374" />
              </TouchableOpacity>
            </Animated.View>
          ))}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => handleModalClose()}
          >
            {Cview ? (
              <CameraView ref={cref} style={{ flex: 1, alignItems: 'center' }} facing={facing}>
                <View style={{ flex: 1, backgroundColor: 'transparent', flexDirection: 'row', marginBottom: 60, opacity: 0.7 }}>
                  <View
                    style={{
                      alignSelf: 'flex-end',
                      alignItems: 'center',
                    }}
                  >
                  <Button style={{ width: 150, height: 50, borderWidth: 1, borderColor: 'white' }} mode="elevated" buttonColor='#781374' textColor='white' tiel onPress={HandlecView}>Capture</Button>
                  </View>
                </View>
              </CameraView>
            ) : (
              <View style={styles.modalView}>
              <View style={{width: '100%', alignItems: 'center', marginBottom: '10%'}}>
                <Text style={{ color: 'white', fontSize: 13}}>Please answer the following questions.</Text>
              </View>
              <Text style={styles.modalText}>1. How willing/unwilling were you in completing the task?</Text>
              <View style={styles.smileyContainer}>
                {[...Array(5).keys()].map(index => (
                  <TouchableOpacity key={index} onPress={() => setQuestionAnswer(0, index + 1)}>
                    <FontAwesome6 
                      name={q_icon_sets[index]} 
                      size={32} 
                      color={questionAnswers[0] === index + 1 ? '#FFD700' : 'white'} 
                      style={styles.smileyIcon} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.modalText}>2. How difficult/easy was it?</Text>
              <View style={styles.smileyContainer}>
                {[...Array(5).keys()].map(index => (
                  <TouchableOpacity key={index} onPress={() => setQuestionAnswer(1, index + 1)}>
                    <FontAwesome6 
                      name={q_icon_sets[index]} 
                      size={32} 
                      color={questionAnswers[1] === index + 1 ? '#FFD700' : 'white'} 
                      style={styles.smileyIcon} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.modalText}>3. How much are you willing to continue?</Text>
              <View style={styles.smileyContainer}>
                {[...Array(5).keys()].map(index => (
                  <TouchableOpacity key={index} onPress={() => setQuestionAnswer(2, index + 1)}>
                    <FontAwesome6 
                      name={q_icon_sets[index]} 
                      size={32} 
                      color={questionAnswers[2] === index + 1 ? '#FFD700' : 'white'} 
                      style={styles.smileyIcon} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.modalText}>4. How enjoyable was the task?</Text>
              <View style={styles.smileyContainer}>
                {[...Array(5).keys()].map(index => (
                  <TouchableOpacity key={index} onPress={() => setQuestionAnswer(3, index + 1)}>
                    <FontAwesome6 
                      name={q_icon_sets[index]} 
                      size={32} 
                      color={questionAnswers[3] === index + 1 ? '#FFD700' : 'white'} 
                      style={styles.smileyIcon} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.modalText}>5. How engaging was the task?</Text>
              <View style={styles.smileyContainer}>
                {[...Array(5).keys()].map(index => (
                  <TouchableOpacity key={index} onPress={() => setQuestionAnswer(4, index + 1)}>
                    <FontAwesome6 
                      name={q_icon_sets[index]} 
                      size={32} 
                      color={questionAnswers[4] === index + 1 ? '#FFD700' : 'white'} 
                      style={styles.smileyIcon} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{width: '100%', alignItems: 'center'}}>
              <Button style={{width: '70%', marginTop: '10%'}} mode="elevated" buttonColor='#781374' textColor='white' onPress={TakePicture}>Take a selfie!</Button>
              <Button style={{width: '70%', marginTop: '10%'}} mode="elevated" disabled={!allQuestionsAnswered} buttonColor={allQuestionsAnswered ? '#781374' : '#B0B0B0'} textColor='white'  onPress={handleModalClose}>Done!</Button>
              </View>
            </View>
            )}
          </Modal>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};  

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: '100%',
  },
  touchableArea: {
    flex: 1, // Ensure it covers the whole screen
  },
  titleCount: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    height: 10,
    backgroundColor: '#ddd',
    marginHorizontal: 40,
    borderRadius: 5,
    marginTop: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#781374',
    borderRadius: 5,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    position: 'absolute',
  },
  countText: {
    fontSize: 15,
    marginBottom: 1,
  },
  modalView: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 30,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 10,
    color: 'white',
    textAlign: 'left',
  },
  smileyContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  smileyIcon: {
    marginHorizontal: '2%',
  },
});

export default GameScreen;
