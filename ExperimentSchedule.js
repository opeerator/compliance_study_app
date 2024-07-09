import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, AppState } from 'react-native';
import { Audio, Video } from 'expo-av';
import axios from 'axios';
import GameScreen from './GameScreen';
import { PaperProvider, Button } from 'react-native-paper';

const ExperimentSchedule = ({ hashcode, condition }) => {
  const [currentGameDay, setCurrentGameDay] = useState(null);
  const [tempGameStatus, setTempGameStatus] = useState(null);
  const [videoStatus, setVideoStatus] = useState('before'); // new state to track video status
  const appState = React.useRef(AppState.currentState);

  useEffect(() => {
    const fetchData = async () => {
      await fetchGameDay();
      Audio.setAudioModeAsync({ playsInSilentModeIOS: true }); // Set audio mode on component mount
    };

    fetchData();

    const handleAppStateChange = (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        fetchGameDay(); // Fetch game day when the app comes to the foreground
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const fetchGameDay = async () => {
    try {
      const response = await axios.post(
        'http://172.20.10.3:5000/check_game_status',
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

  const getVideoSource = (gameDay, status) => {
    const videoMapping = {
      1: { before: require('./assets/videos/mirrly_virtual_videos/1a.mp4'), after: require('./assets/videos/mirrly_virtual_videos/1b.mp4') },
      2: { before: require('./assets/videos/mirrly_virtual_videos/2a.mp4'), after: require('./assets/videos/mirrly_virtual_videos/2b.mp4') },
      3: { before: require('./assets/videos/mirrly_virtual_videos/3a.mp4'), after: require('./assets/videos/mirrly_virtual_videos/3b.mp4') },
      4: { before: require('./assets/videos/mirrly_virtual_videos/4a.mp4'), after: require('./assets/videos/mirrly_virtual_videos/4b.mp4') },
      5: { before: require('./assets/videos/mirrly_virtual_videos/5a.mp4'), after: require('./assets/videos/mirrly_virtual_videos/5b.mp4') },
      6: { before: require('./assets/videos/mirrly_virtual_videos/6a.mp4'), after: require('./assets/videos/mirrly_virtual_videos/6b.mp4') },
      7: { before: require('./assets/videos/mirrly_virtual_videos/7a.mp4'), after: require('./assets/videos/mirrly_virtual_videos/7b.mp4') },
      8: { before: require('./assets/videos/mirrly_virtual_videos/8a.mp4'), after: require('./assets/videos/mirrly_virtual_videos/8b.mp4') },
    };
    return videoMapping[gameDay][status];
  };

  const renderGameScreen = () => {
    if (currentGameDay <= 8 && currentGameDay > 0) {
      if ((condition === 'c2' || condition === 'c3') && videoStatus === 'before') {
        return (
          <Video
            source={getVideoSource(currentGameDay, 'before')}
            style={styles.video}
            onPlaybackStatusUpdate={(status) => {
              if (status.didJustFinish) {
                setVideoStatus('game');
              }
            }}
            shouldPlay
            volume={1.0}
            isMute={false}
            isLooping={false}
            ignoreSilentSwitch={'ignore'}
            resizeMode="contain"
          />
        );
      } else if ((condition === 'c2' || condition === 'c3') && videoStatus === 'after') {
        return (
          <Video
            source={getVideoSource(currentGameDay, 'after')}
            style={styles.video}
            onPlaybackStatusUpdate={(status) => {
              if (status.didJustFinish) {
                setTempGameStatus(null);
                setVideoStatus('before');
                setCurrentGameDay(999); //so video is disappeared after the thing
              }
            }}
            shouldPlay
            volume={1.0}
            isMute={false}
            isLooping={false}
            ignoreSilentSwitch={'ignore'}
            resizeMode="contain"
          />
        );
      } else {
        if (tempGameStatus === "Start") {
          return (
            <GameScreen 
              gday={currentGameDay} 
              onGameEnd={() => {
                if (condition === 'c2' || condition === 'c3') {
                  setVideoStatus('after');
                } else {
                  setTempGameStatus(null);
                  setCurrentGameDay(999); //so for c1, c4 is disappeared after the thing
                }
              }} 
            />
          )
        } else {
          return (
            <>
              <Text style={styles.title}>Ready for today's task?</Text>
              <Button mode="elevated" buttonColor='#781374' textColor='white' onPress={startGameDay}>Start</Button>
            </>
          )
        }
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
          <Text style={{color: 'red'}}>Already submitted this day's game. See you tomorrow!</Text>
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
  video: {
    width: '100%',
    height: '100%',
  },
});

export default ExperimentSchedule;
