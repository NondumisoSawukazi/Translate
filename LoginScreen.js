import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, StatusBar, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default function LoginScreen({ navigation }) {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const params = {
        TableName: 'dbUser',
        Key: {
          userID: idNumber,
        },
      };

      const result = await dynamodb.get(params).promise();

      if (result.Item && result.Item.password === password) {
        navigation.navigate('Home');
      } else {
        Alert.alert('Login Failed', 'Invalid ID Number or Password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      Alert.alert('Error', 'An error occurred while logging in. Please try again.');
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://your-image-url.com/your-image.jpg' }}
      style={styles.background}
    >
      <LinearGradient colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.5)']} style={styles.gradient}>
        <StatusBar barStyle="light-content" />

        <View style={styles.container}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to continue</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#fff" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="ID Number"
              placeholderTextColor="#aaa"
              value={idNumber}
              onChangeText={setIdNumber}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#fff" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <LinearGradient colors={['#ff6f00', '#ff8f00']} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>Login</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupText}>Don't have an account? Sign up</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
  },
  button: {
    marginTop: 20,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupText: {
    marginTop: 20,
    color: '#fff',
  },
});
