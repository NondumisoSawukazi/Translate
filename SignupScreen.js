// SignupScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Animated } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AWS from 'aws-sdk';

// Configure AWS
AWS.config.update({
  region: 'us-east-1', // replace with your AWS region
  credentials: new AWS.Credentials('', ''),
});

const sns = new AWS.SNS();
const dynamodb = new AWS.DynamoDB.DocumentClient(); // For DynamoDB operations

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('');
  const [languageSelected, setLanguageSelected] = useState(false);
  const [translatedText, setTranslatedText] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));

  const handleSignup = async () => {
    console.log('User signed up with:', {
      name,
      surname,
      phoneNumber,
      idNumber,
      language,
    });

    // Save user data to DynamoDB
    try {
      const params = {
        TableName: 'dbUser', // Replace with your DynamoDB table name
        Item: {
          userID: idNumber, // Use a unique identifier
          name,
          surname,
          phoneNumber,
          idNumber,
          password, // Save the password
          language,
        },
      };

      await dynamodb.put(params).promise();
      console.log('User data saved to DynamoDB');

      if (phoneNumber) {
        await sendSMS(phoneNumber, `Hello ${name}, you have successfully signed up!`);
      }
    } catch (error) {
      console.error('Error saving user data to DynamoDB:', error);
    }
  };

  const sendSMS = async (phoneNumber, message) => {
    try {
      const params = {
        Message: message,
        PhoneNumber: phoneNumber,
      };

      await sns.publish(params).promise();
      console.log('SMS sent successfully');
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  };

  const translateText = async (text, targetLanguage) => {
    try {
      const translate = new AWS.Translate();
      const params = {
        SourceLanguageCode: 'en',
        TargetLanguageCode: targetLanguage,
        Text: text,
      };

      const result = await translate.translateText(params).promise();
      return result.TranslatedText;
    } catch (error) {
      console.error('Error translating text:', error);
      return text;
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const fetchTranslations = async () => {
      if (language) {
        const translations = await Promise.all([
          translateText('Sign Up', language),
          translateText('Name', language),
          translateText('Surname', language),
          translateText('Phone Number', language),
          translateText('ID Number', language),
          translateText('Password', language),
          translateText('Next', language),
        ]);
        setTranslatedText({
          signUp: translations[0],
          name: translations[1],
          surname: translations[2],
          phoneNumber: translations[3],
          idNumber: translations[4],
          password: translations[5],
          next: translations[6],
        });
      }
    };
    fetchTranslations();
  }, [language]);

  return (
    <View style={styles.container}>
      {!languageSelected ? (
        <Animated.View style={{ ...styles.languagePicker, opacity: fadeAnim }}>
          <Text style={styles.title}>Select Your Language</Text>
          <Picker
            selectedValue={language}
            style={styles.picker}
            onValueChange={(itemValue) => setLanguage(itemValue)}
          >
            <Picker.Item label="English" value="en" />
            <Picker.Item label="Spanish" value="es" />
            <Picker.Item label="French" value="fr" />
            <Picker.Item label="German" value="de" />
            <Picker.Item label="Chinese" value="zh" />
          </Picker>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => setLanguageSelected(true)}
            disabled={!language}
          >
            <Text style={styles.buttonText}>{translatedText.next || 'Next'}</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <Animated.View style={{ ...styles.form, opacity: fadeAnim }}>
          <Text style={styles.title}>{translatedText.signUp || 'Sign Up'}</Text>

          <TextInput
            style={styles.input}
            placeholder={translatedText.name || 'Name'}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder={translatedText.surname || 'Surname'}
            value={surname}
            onChangeText={setSurname}
          />

          <TextInput
            style={styles.input}
            placeholder={translatedText.phoneNumber || 'Phone Number'}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder={translatedText.idNumber || 'ID Number'}
            value={idNumber}
            onChangeText={setIdNumber}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder={translatedText.password || 'Password'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Picker
            selectedValue={language}
            style={styles.picker}
            onValueChange={(itemValue) => setLanguage(itemValue)}
          >
            <Picker.Item label="English" value="en" />
            <Picker.Item label="Spanish" value="es" />
            <Picker.Item label="French" value="fr" />
            <Picker.Item label="German" value="de" />
            <Picker.Item label="Chinese" value="zh" />
          </Picker>

          <TouchableOpacity 
            style={[styles.button, !language && styles.buttonDisabled]} 
            onPress={handleSignup}
            disabled={!language}
          >
            <Text style={styles.buttonText}>{translatedText.signUp || 'Sign Up'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  languagePicker: {
    width: '100%',
    padding: 20,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  form: {
    width: '100%',
    padding: 20,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#555',
    color: '#fff',
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#555',
    color: '#fff',
    marginBottom: 15,
    borderRadius: 5,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#aaa', // Color for disabled button
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
