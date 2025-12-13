import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

interface ModalProps {
  pokemon_url: string;
  pokemon_name: string;
  pokemon_types: string[];
  pokemon_description: string;
  pokemon_stats: {
        name: string;
        value: number;
    }[];
  pokemon_id: number;
  pokemon_image: string;
  
}

const App = ({pokemon_url, pokemon_name, pokemon_stats, pokemon_image, pokemon_types, pokemon_description, pokemon_id}: ModalProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.centeredView}>
         
            <View style={styles.modalView} className="flex-4 flex-row justify-between gap-6 m-12 p-12 items-top">
          
              
              <Image source={{uri: pokemon_image}}  style={{width: '50%', height: '50%'}} /> 
              <Text> {pokemon_description}</Text>
                

            
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}>
                                <MaterialCommunityIcons name="alpha-x-box" size={32} />
                    
              </Pressable>
            </View>
            
 
          </View>
          
        </Modal>
        <Pressable
          style={[styles.button, styles.buttonOpen]}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.textStyle}>Show Modal</Text>
        </Pressable>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backfaceVisibility: 'hidden',
    width: '75%',
    height: '75%',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 5,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    flexDirection: 'row',
    left:'93%',
    justifyContent: 'center',
    position: 'absolute',
    top: "2%",
    right: '15%',
 
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    fontSize: 20,
    textAlign: 'center',
    color: 'black',
  },
});

export default App;