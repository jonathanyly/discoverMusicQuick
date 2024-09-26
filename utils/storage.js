import AsyncStorage from "@react-native-async-storage/async-storage";
export const storeData = async (name,data) => {
    try {
      await AsyncStorage.setItem(name, data);
      await AsyncStorage.setItem("expDate", (Date.now()+1).toString())
      console.log("SET ACCESS TOKEN AND CURRENT DATE")
    } catch (e) {
      console.log("Error", e);
    }
  };


export const getData = async(name) => {
    try {
      const response = await AsyncStorage.getItem(name);  
      return response
    } catch (error) {
        return error
    }
}