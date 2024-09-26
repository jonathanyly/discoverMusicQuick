import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, SafeAreaView, View, Dimensions, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MusicPlayer from './MusicPlayer';

const { height } = Dimensions.get('window');

const SongItem = ({ item }) => {
  return (
    <View style={styles.songContainer}>
      <MusicPlayer 
        songName={item.name}
        artistName={item.artists}
        imageUri={item.imageurl}
        audioUri={item.songurl}
      />
    </View>
  );
};

export default function HomeScreen() {
  const [songs, setSongs] = useState([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);

  async function getSongs() {
    setIsLoadingSongs(true);
    const accessToken = await AsyncStorage.getItem("accessToken");
    try {
      const response = await fetch("https://api.spotify.com/v1/recommendations?seed_genres=dance&limit=10", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      data.tracks.forEach(track => {
        if(track.preview_url) {
          const tempSong =  { 
            name: track.name,
            id: track.id,
            songurl: track.preview_url,
            imageurl: track.album.images[0].url,
            artists: track.artists[0].name
        }
        tempArray.push(tempSong)
      }
    })
      setSongs(tempArray);
      return tempArray
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setIsLoadingSongs(false);
    }
  }


  useEffect(() => {
    getSongs();
  }, []);

  const renderItem = ({ item }) => <SongItem item={item} />;

  return (
    <View>
      {isLoadingSongs ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingSongs}>Loading Songs...</Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          pagingEnabled
          snapToInterval={height}
          snapToAlignment="start"
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white"
  },
  songContainer: {
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSongs: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
});