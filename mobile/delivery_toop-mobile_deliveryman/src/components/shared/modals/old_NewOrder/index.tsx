import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import {Colors, ModalDelivery} from '../../../../styles';

interface NewOrderProps {
  count: number;
  getOrderId: any;
  acceptOrderDelivery: any;
  rejectOrderDelivery: any;
  distanceCompany: any;
}

const NewOrder: React.FC<NewOrderProps> = ({
  count,
  getOrderId,
  acceptOrderDelivery,
  rejectOrderDelivery,
  distanceCompany,
}) => {
  const Map = require('../../../../assets/images/Mapa.jpg');

  return (
    <View style={ModalDelivery.centeredView}>
      <View style={ModalDelivery.boxDelivery}>
        <View style={ModalDelivery.CountDown}>
          <Text style={ModalDelivery.CountDownText}>{count}</Text>
        </View>
        <Text style={ModalDelivery.Title}>Solicitação de entrega</Text>
        <View style={ModalDelivery.boxInfoDelivery}>
          <ImageBackground
            style={ModalDelivery.boxInfoDeliveryImage}
            source={Map}>
            <View style={ModalDelivery.boxInfoDeliveryBlur}>
              <Image
                source={{
                  uri: getOrderId?.company?.images[0],
                }}
                style={ModalDelivery.boxInfoDeliveryCompanyImage}
              />
              <Text style={ModalDelivery.boxInfoDeliveryTitle}>
                {getOrderId?.company?.name}
              </Text>
              <Text style={ModalDelivery.boxInfoDeliveryAddress}>
                {getOrderId?.company?.address}
              </Text>
              {distanceCompany !== null ? (
                <Text style={ModalDelivery.boxInfoDeliveryTitle}>
                  Distância {distanceCompany}
                </Text>
              ) : null}
            </View>
          </ImageBackground>
        </View>
        <TouchableOpacity onPress={() => acceptOrderDelivery(getOrderId)}>
          <LinearGradient
            colors={[Colors.PRIMARY, '#5aaef6']}
            style={ModalDelivery.ButtonAccept}>
            <Text style={ModalDelivery.ButtonAcceptText}>Aceitar</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => rejectOrderDelivery()}
          style={ModalDelivery.ButtonReject}>
          <Text style={ModalDelivery.ButtonRejectText}>Recusar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NewOrder;
