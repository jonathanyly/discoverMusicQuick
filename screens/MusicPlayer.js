import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet, Dimensions, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { AntDesign } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const MusicPlayer = ({ songName, artistName, imageUri, audioUri }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const sound = useRef(new Audio.Sound());
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAudio();
    return () => {
      unloadAudio();
    };
  }, [audioUri]);

  const loadAudio = async () => {
    try {
        console.log(audioUri)
      await sound.current.loadAsync({ uri: audioUri }, {}, true);
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const unloadAudio = async () => {
    try {
      await sound.current.unloadAsync();
    } catch (error) {
      console.error('Error unloading audio:', error);
    }
  };

  

  return (
    <TouchableWithoutFeedback>
      <View style={styles.container}>
        <Image source={{ uri: imageUri }} style={styles.backgroundImage} />
        <View style={styles.overlay}>
          <View style={styles.infoContainer}>
            <Text style={styles.songName}>{songName}</Text>
            <Text style={styles.artistName}>{artistName}</Text>
          </View>
          <Animated.View style={[styles.iconContainer, { opacity: fadeAnim }]}>
            <AntDesign 
              name={isPlaying ? "pausecircle" : "playcircleo"} 
              size={100} 
              color="white" 
            />
          </Animated.View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    flex:1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    padding: 40,
  },
  infoContainer: {
    marginTop: 40,
    marginLeft:-10
  },
  songName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  artistName: {
    fontSize: 20,
    color: '#ccc',
  },
});

export default MusicPlayer;