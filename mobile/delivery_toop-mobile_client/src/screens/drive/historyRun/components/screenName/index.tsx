import React, { useCallback, useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/core';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

/** Components */
import History from './history';

/** Styles */
import { styles, Area, Title, ContainIndex } from './styles';

/** Service */
import { bookingHistoric } from '../../../../../services/provider/booking/historic';

interface Props {
  goBack: any;
  plus: any;
}

const HistoryRunning: React.FC<Props> = ({ goBack, plus }) => {
  const {
    user: { user = null },
  }: any = useSelector((state: any) => state);

  const { t } = useTranslation();

  const [bookings, setBookings] = useState<any>([]);

  useFocusEffect(
    useCallback(() => {
      bookingHistoric(user?.passenger?._id).then(result => {
        if (result && Array.isArray(result) && result.length > 0) {
          setBookings(result);
        } else {
          setBookings(null);
        }
      });
    }, [user?.passenger?._id]),
  );

  return (
    <ContainIndex>
      {/*  Header */}
      <Area>
        <TouchableOpacity onPress={goBack}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>
        <Title>{t('races')}</Title>
      </Area>

      {/* BODY */}

      {/* CONTAINER 1 */}
      {/* <Contain>
        <ViewText>
          <TextTitle>Anteriores</TextTitle>
          <TouchableOpacity onPress={() => setShowTheThing(!showTheThing)}>
            <Icon2 name="caretdown" size={20} style={styles.icon} />
          </TouchableOpacity>
        </ViewText>
      </Contain> */}

      {/* {showTheThing && (
        <DropDownPicker
          containerStyle={styles.downPickerContStyle}
          style={styles.downPickerStyle}
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems}
        />
      )} */}

      <FlatList
        data={[{ title: 'Title Text', key: 'item1' }]}
        style={styles.flatStyle}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        renderItem={() => <History plus={plus} booings={bookings} />}
      />
    </ContainIndex>
  );
};

export default HistoryRunning;
