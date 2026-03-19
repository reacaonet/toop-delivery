import React, {useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Container, Wrapper, Input} from './styles';
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
    <Container colors={Colors.GRADIENTE_GREY}>
      <Wrapper>
        {isRecording && <WaveOverlay />}
        <Input
          onChangeText={onchangeText}
          onSubmitEditing={onSubmitEditing}
          value={value}
          placeholder={isRecording ? 'gravando...' : 'digite sua mensagem'}
          underlineColorAndroid={'transparent'}
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
        color={Colors.PRIMARY}
        size={32}
        onPress={() => onSubmitEditing()}
      />
    </Container>
  );
};

export default InputBar;
