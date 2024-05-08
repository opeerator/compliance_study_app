import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Modal } from 'react-native';
import { AntDesign, FontAwesome6 } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-paper';

const GameScreen = ({ gameDay }) => {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  const [progress, setProgress] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [hashcode, setHashcode] = useState('');
  const q_icon_sets = ['face-sad-cry','sad-tear','smile-beam','face-grin-wide','face-grin-stars'];
  const [questionAnswers, setQuestionAnswers] = useState(Array(5).fill('')); // Array to store answers to questions
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const storedHashcode = await AsyncStorage.getItem('hashcode');
      setHashcode(storedHashcode);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const itemTimer = setInterval(() => {
      const newItem = {
        id: Date.now(), // Unique ID for each item
        opacity: new Animated.Value(0), // Initial opacity set to 0 for fade-in effect
        left: getRandomPosition(Dimensions.get('window').width - 50), // Random left position within screen bounds
        top: getRandomPosition(Dimensions.get('window').height - 50), // Random top position within screen bounds
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

      setItems(prevItems => [...prevItems, newItem]);
    }, 2000); // Adjust the time as needed

    // Start the game timer
    timerRef.current = setInterval(() => {
      setProgress(prevProgress => prevProgress + (100 / 120)); // Assuming 120 seconds for the game
    }, 1000); // Update every second

    // Set a timeout for game over after 2 minutes (120 seconds)
    const gameOverTimeout = setTimeout(() => {
      clearInterval(timerRef.current); // Stop the game timer
      setModalVisible(true); // Show the modal
    // }, 120000); // 2 minutes in milliseconds
    }, 500); // 2 minutes in milliseconds

    return () => {
      clearInterval(itemTimer);
      clearInterval(timerRef.current);
      items.forEach(item => clearTimeout(item.timer));
      clearTimeout(gameOverTimeout);
    };
  }, []);

  const getRandomPosition = max => Math.random() * max;

  const handleModalClose = async () => {
    setModalVisible(false);
    setProgress(0); // Reset the progress
    setCount(0); // Reset the count

    try {
      const response = await axios.post('your_backend_url/send_game_data', {
        hash_code: hashcode,
        game_day: gameDay,
        clicks: count,
        selected_items: count, // Add logic to track selected items if needed
        total_items: items.length,
        questions: questionAnswers, // Array of answers to questions
      });
      console.log(response.data); // Log response from the server
    } catch (error) {
      console.error('Error sending game data:', error);
    }
  };

  const handleItemPress = id => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    setCount(prevCount => prevCount + 1);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
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
              <AntDesign name="smile-circle" size={24} color="black" />
            </TouchableOpacity>
          </Animated.View>
        ))}
        <Text style={styles.countText}>Count: {count}</Text>
        <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => handleModalClose()}
      >
        <View style={styles.modalView}>
          <View style={{width: '100%', alignItems: 'center', marginBottom: '10%'}}>
            <Text style={{ color: 'white', fontSize: '15%'}}>Please answer the following questions.</Text>
          </View>
          <Text style={styles.modalText}>1. How willing/unwilling were you in completing the task?</Text>
          <View style={styles.smileyContainer}>
            {[...Array(5).keys()].map(index => (
              <TouchableOpacity key={index} onPress={() => setQuestionAnswer(0, index + 1)}>
                <FontAwesome6 name={q_icon_sets[index]} size={32} color="white" style={styles.smileyIcon} />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.modalText}>2. How difficult/easy was it?</Text>
          <View style={styles.smileyContainer}>
            {[...Array(5).keys()].map(index => (
              <TouchableOpacity key={index} onPress={() => setQuestionAnswer(0, index + 1)}>
              <FontAwesome6 name={q_icon_sets[index]} size={32} color="white" style={styles.smileyIcon} />
            </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.modalText}>3. How much are you willing to continue?</Text>
          <View style={styles.smileyContainer}>
            {[...Array(5).keys()].map(index => (
              <TouchableOpacity key={index} onPress={() => setQuestionAnswer(0, index + 1)}>
              <FontAwesome6 name={q_icon_sets[index]} size={32} color="white" style={styles.smileyIcon} />
            </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.modalText}>4. How enjoyable was the task?</Text>
          <View style={styles.smileyContainer}>
            {[...Array(5).keys()].map(index => (
              <TouchableOpacity key={index} onPress={() => setQuestionAnswer(0, index + 1)}>
              <FontAwesome6 name={q_icon_sets[index]} size={32} color="white" style={styles.smileyIcon} />
            </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.modalText}>5. How engaging was the task?</Text>
          <View style={styles.smileyContainer}>
            {[...Array(5).keys()].map(index => (
              <TouchableOpacity key={index} onPress={() => setQuestionAnswer(0, index + 1)}>
              <FontAwesome6 name={q_icon_sets[index]} size={32} color="white" style={styles.smileyIcon} />
            </TouchableOpacity>
            ))}
          </View>
          <View style={{width: '100%', alignItems: 'center'}}>
          <Button style={{width: '70%', marginTop: '10%'}} mode="elevated" buttonColor='#781374' textColor='white' onPress={handleModalClose}>Done!</Button>
          </View>
        </View>
      </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  progressContainer: {
    height: 10,
    backgroundColor: '#ddd',
    marginHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    position: 'absolute',
    backgroundColor: 'lightblue',
    padding: 20,
    borderRadius: 10,
  },
  countText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
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
