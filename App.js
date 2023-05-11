import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarCodeScanner } from "expo-barcode-scanner";
import { RefreshControl } from "react-native";

export default function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const login_url = "https://api.baubuddy.de/index.php/login";
  const login_headers = { Authorization: "Basic QVBJX0V4cGxvcmVyOjEyMzQ1NmlzQUxhbWVQYXNz", "Content-Type": "application/json" };
  const login_body = { username: "365", password: "1" };
  const request_url = "https://api.baubuddy.de/dev/index.php/v1/tasks/select";
  const request_headers = { Authorization: `Bearer ${accessToken}` };

  const login = () => {
    fetch(login_url, {
      method: "POST",
      headers: login_headers,
      body: JSON.stringify(login_body),
    })
      .then((response) => response.json())
      .then((data) => {
        const token = data?.oauth?.access_token;
        setAccessToken(token);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const fetchData = async () => {
    try {
      const response = await fetch(request_url, {
        mmethod: "GET",
        headers: request_headers,
      });
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    login();
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchData();
    }
  }, [accessToken]);

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const filteredTasks = tasks.filter((task) => Object.values(task).join(" ").toLowerCase().includes(searchQuery.toLowerCase()));

  const handleScan = ({ data }) => {
    setSearchQuery(data);
    setIsScannerActive(false);
  };

  const handleScannerOpen = () => {
    setIsScannerActive(true);
  };

  const handleScannerClose = () => {
    setIsScannerActive(false);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
    setRefreshing(false);
  }, []);

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.itemContainer, { backgroundColor: item.colorCode }]}>
        <Text style={styles.itemTask}>{item.task}</Text>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isScannerActive ? (
        <View style={styles.scannerContainer}>
          <BarCodeScanner onBarCodeScanned={handleScan} style={StyleSheet.absoluteFillObject} />
          <TouchableOpacity style={styles.scannerCloseButton} onPress={handleScannerClose}>
            <Text style={styles.scannerCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TextInput style={styles.searchInput} placeholder="Search tasks" onChangeText={handleSearch} value={searchQuery} />
          <FlatList data={filteredTasks} renderItem={renderItem} keyExtractor={(item) => item.task} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} />
        </>
      )}
      <TouchableOpacity style={styles.menuButton} onPress={handleScannerOpen}>
        <Text style={styles.menuButtonText}>Scan QR-Code</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
  },
  itemContainer: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  itemTask: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textDecorationLine: "underline",
  },
  itemDescription: {
    fontSize: 16,
    color: "white",
  },
  searchInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    margin: 8,
  },
  menuButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    margin: 8,
  },
  menuButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  scannerCloseButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    margin: 8,
  },
  scannerCloseButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
