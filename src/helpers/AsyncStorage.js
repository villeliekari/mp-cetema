import AsyncStorage from "@react-native-async-storage/async-storage";

const asyncStorage = {};

asyncStorage.get = async (key) => {
  console.log("AS get: " + key);
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) return value;
  } catch (e) {
    console.log(e.message);
  }
};

asyncStorage.set = async (key, value) => {
  console.log("AS set: " + key + " value: " + value);
  try {
    await AsyncStorage.setItem(key, value);
  } catch (err) {
    console.log(e.message);
  }
};

export default asyncStorage;
