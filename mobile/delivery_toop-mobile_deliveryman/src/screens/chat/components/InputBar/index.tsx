import React, {useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Container, Wrapper, Input} from './styles';
import AudioRec from '../AudioRec';
import waveAnimation from '../../../../assets/animations/recordingWave.json';
import LootieView from 'lottie-react-native';
import {Colors} from '../../../../styles';

interface InputBarProps {
  onchangeText?: (t: string) => void;
  onSubmitEditing?: any;
  onSubmitImage?: any;
  value?: string;
  senderType: 'text' | 'audio';
}

const InputBar: React.FC<InputBarProps> = ({
  onchangeText,
  onSubmitEditing,
  onSubmitImage,
  senderType,
  value,
}) => {
  const [isRecording, setIsRecording] = useState(false);

  const handleAudioRecStart = () => {
    setIsRecording(true);
  };

  const handleAudioRecStop = () => {
    setIsRecording(false);
  };

  const WaveOverlay = () => (
    <LootieView
      source={waveAnimation}
      speed={1}
      style={{height: 100}}
      loop
      autoPlay
    />
  );

  return (
    <Container colors={Colors.PRIMARY}>
      <Wrapper>
        {isRecording && <WaveOverlay />}
        <Input
          onChangeText={onchangeText}
          onSubmitEditing={onSubmitEditing}
          value={value}
          placeholder={isRecording ? 'gravando...' : 'digite sua mensagem'}
        />

        <Icon
          name="insert-photo"
          color="#A3A3A3"
          size={26}
          onPress={() => onSubmitImage()}
        />
      </Wrapper>
      <Icon
        name="send"
        color="#fff"
        size={32}
        onPress={() => onSubmitEditing()}
      />

      {/* {senderType === 'text' ? (
        <Icon
          name="send"
          color="#fff"
          size={32}
          onPress={() => onSubmitEditing()}
        />
      ) : (
        <AudioRec
          onStart={() => handleAudioRecStart()}
          onStop={() => handleAudioRecStop()}
        />
      )} */}
    </Container>
  );
};

export default InputBar;

/*
<View style={styles.inputMessage}>
<TouchableOpacity onPress={() => selectImage()}>
  <Icon name="attach-file" size={40} color={'blue'} />
</TouchableOpacity>

<TextInput
  style={styles.inputCheckout}
  autoCorrect={false}
  value={message}
  onSubmitEditing={() => sendMessage()}
  onChangeText={setMessage}
/>
<TouchableOpacity onPress={() => sendMessage()}>
  <Icon name="send" size={35} style={styles.sendIcon} />
</TouchableOpacity>
</View>

*/
