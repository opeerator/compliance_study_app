import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import GameScreen from './GameScreen';

const ExperimentSchedule = ({ hashcode }) => {
  const [currentGameDay, setCurrentGameDay] = useState(null);

  useEffect(() => {
    fetchGameDay();
  }, [currentGameDay]); // Include currentGameDay as a dependency

  const fetchGameDay = async () => {
    try {
      const response = await axios.post(
        'http://172.20.10.4:5000/check_game_status',
        { hash_code: hashcode }
      );
      setCurrentGameDay(response.data.current_game_day);
    } catch (error) {
      console.error('Error fetching game day:', error);
    }
  };

  const renderGameScreen = () => {
    if (currentGameDay) {
        return <GameScreen Gameday={currentGameDay} />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Experiment Schedule</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default ExperimentSchedule;
