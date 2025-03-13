import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Image,
  ScrollView,
  RefreshControl,
} from "react-native";
import * as Location from "expo-location";

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const apiKey = process.env.EXPO_PUBLIC_API_KEY;

  const fetchWeather = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
      );
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        console.log(data);
        setWeather(data);
      } else {
        setErrorMsg(`Error: ${data.message}`);
      }
    } catch (error) {
      setErrorMsg("Failed to fetch weather data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getLocationAndWeather = async () => {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      setLoading(false);
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      await fetchWeather(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      setErrorMsg("Could not get your location");
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (location) {
      fetchWeather(location.coords.latitude, location.coords.longitude);
    } else {
      getLocationAndWeather();
    }
  };

  useEffect(() => {
    getLocationAndWeather();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Fetching weather data...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <Text style={styles.retryText} onPress={getLocationAndWeather}>
          Tap to retry
        </Text>
      </View>
    );
  }

  const { name, main, weather: weatherData, sys, wind } = weather;
  const weatherIcon = weatherData[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${weatherIcon}@4x.png`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.weatherContainer}>
        <Text style={styles.locationText}>
          {name}, {sys.country}
        </Text>

        <View style={styles.mainInfo}>
          <Image source={{ uri: iconUrl }} style={styles.weatherIcon} />
          <Text style={styles.temperature}>{Math.round(main.temp)}°C</Text>
        </View>

        <Text style={styles.weatherDescription}>
          {weatherData[0].description.charAt(0).toUpperCase() +
            weatherData[0].description.slice(1)}
        </Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Feels like</Text>
            <Text style={styles.detailValue}>
              {Math.round(main.feels_like)}°C
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Humidity</Text>
            <Text style={styles.detailValue}>{main.humidity}%</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Wind</Text>
            <Text style={styles.detailValue}>
              {Math.round(wind.speed * 3.6)} km/h
            </Text>
          </View>
        </View>

        <View style={styles.minMaxContainer}>
          <Text style={styles.minMaxText}>
            Min: {Math.round(main.temp_min)}°C ~ Max:{" "}
            {Math.round(main.temp_max)}°C
          </Text>
        </View>
      </View>

      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7CFD8",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fb",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fb",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  retryText: {
    fontSize: 16,
    color: "#0066cc",
    textDecorationLine: "underline",
  },
  weatherContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  locationText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  mainInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  weatherIcon: {
    width: 100,
    height: 100,
  },
  temperature: {
    fontSize: 72,
    fontWeight: "bold",
    color: "#333",
  },
  weatherDescription: {
    fontSize: 20,
    color: "#666",
    marginBottom: 30,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailItem: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: "100%",
    backgroundColor: "#ddd",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  minMaxContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  minMaxText: {
    fontSize: 16,
    color: "#666",
  },
});
