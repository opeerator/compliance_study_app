import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import GameScreen from './GameScreen';
import { PaperProvider, Button } from 'react-native-paper';


const ExperimentSchedule = ({ hashcode }) => {
  const [currentGameDay, setCurrentGameDay] = useState(null);
  const [tempGameStatus, setTempGameStatus] = useState(null);

  useEffect(() => {
    fetchGameDay();
  }, [currentGameDay]); // Include currentGameDay as a dependency

  const fetchGameDay = async () => {
    try {
      const response = await axios.post(
        'http://172.20.10.3:5000/check_game_status', // personal PC
        { hash_code: hashcode }
      );
      setCurrentGameDay(response.data.current_game_day);
    } catch (error) {
      console.error('Error fetching game day:', error);
    }
  };

  const startGameDay = async () => {
    setTempGameStatus("Start");
  };

  const renderGameScreen = () => {
    if (currentGameDay <= 8 && currentGameDay > 0) {
        if (tempGameStatus === "Start") {
          return (
            <GameScreen Gameday={currentGameDay} />
          )
        } else {
          return (
            <>
              <Text style={styles.title}>Ready for today's task?</Text>
              <Button mode="elevated" buttonColor='#781374' textColor='white' title="Start" onPress={startGameDay}>Start</Button>
            </>
          )
        }
    } else if(currentGameDay === -1) {
      return (
        <>
          <Text style={styles.title}>Experiment Schedule</Text>
          <Text style={{color: 'red', fontSize: 11}}>The experiment is already done. Thank you for your participation!</Text>
        </>
      ) 
    } else {
      return (
        <>
          <Text style={styles.title}>Experiment Schedule</Text>
          <Text style={{color: 'red'}}>Already submitted this day's game!</Text>
        </>
      )
    }
  };

  return (
    <View style={styles.container}>
      {currentGameDay !== null ? (
        renderGameScreen()
      ) : (
        <Text>Loading game day...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
});

export default ExperimentSchedule;
