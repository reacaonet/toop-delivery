import React, {useState, useEffect} from 'react';
import CheckBox from '@react-native-community/checkbox';
import { 
    Container,
    Touch,
    TextTouch
} from './styles';

import {FlatList} from 'react-native'
import Progress from './progressList'
import AsyncStorage from '@react-native-community/async-storage';

interface IToDo {
  text: string;
  completed: boolean;
}



const ProgressView: React.FC = ({navigation, route}: any) => {


  const [toDoList, setToDos] = useState<IToDo[]>([]);
  const [error, showError] = useState<Boolean>(false);
  const [check, setCheck] = useState(false)
  const [modalVisible, setModalVisible] = useState(false);


 
 useEffect(() => {
    load()
  }, );
 
  function openModal() {
    setModalVisible(!modalVisible)
  }

  
  const load = async () => {
    await AsyncStorage.getItem("@Myname")

  }

  return (
    <Container>
        
        <FlatList 
            data={[{ title: 'Title Text', key: 'item1' }]}
            style={{marginBottom: 5, marginTop: 10}}
            renderItem={() => (
                <Progress/>
            )}
        />
      
    </Container>
  );
}

export default ProgressView;