import React, {useState} from 'react';
import {Alert, Modal} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';

/** services */
import {listHours} from './../../services/provider/company/hours';

import {
  Container,
  Title,
  ContainDay,
  Divider,
  TextContain,
  TextContainHour,
  Image,
  Contain,
  DividerContain,
  Button,
  TextButton,
} from './styles';

import Hours from './hours';
import {maskHours} from './../../utils/index';

interface Props {
  navigation?: any;
}

let defaultHours: any = [
  {dayWeek: 'SUNDAY', label: 'Domingo', hours: []},
  {dayWeek: 'MONDAY', label: 'Segunda-feira', hours: []},
  {dayWeek: 'TUESDAY', label: 'Terça-feira', hours: []},
  {dayWeek: 'WEDNESDAY', label: 'Quarta-feira', hours: []},
  {dayWeek: 'THURSDAY', label: 'Quinta-feira', hours: []},
  {dayWeek: 'FRIDAY', label: 'Sexta-feira', hours: []},
  {dayWeek: 'SATURDAY', label: 'Sábado', hours: []},
];

const Timer = ({navigation}: Props) => {
  const {
    authUser: {user = null},
  }: any = useSelector((state) => state);

  const [weekDays, setWeekDays] = useState<any[]>(defaultHours);

  const [weekDay, setWeekDay] = useState<any>({});
  const [showModal, setShowModal] = useState<any>(false);

  const loadHours = () => {
    try {
      listHours(user?.company?._id).then((response) => {
        if (response && response.data && response.data.length > 0) {
          setWeekDays((oldValues) => {
            return defaultHours.map((day: any) => {
              let newDay: any = day;
              const filtered = response.data.filter(
                (i: any) => i.dayWeek === newDay.dayWeek,
              );
              filtered.map((fil: any) => {
                newDay.hours.push({
                  _id: fil._id,
                  openingHours: maskHours(
                    `${fil.openingHours}`.padStart(4, '0'),
                  ),
                  closingHours: maskHours(
                    `${fil.closingHours}`.padStart(4, '0'),
                  ),
                });
              });
              return newDay;
            });
          });

          defaultHours = [
            {dayWeek: 'SUNDAY', label: 'Domingo', hours: []},
            {dayWeek: 'MONDAY', label: 'Segunda-feira', hours: []},
            {dayWeek: 'TUESDAY', label: 'Terça-feira', hours: []},
            {dayWeek: 'WEDNESDAY', label: 'Quarta-feira', hours: []},
            {dayWeek: 'THURSDAY', label: 'Quinta-feira', hours: []},
            {dayWeek: 'FRIDAY', label: 'Sexta-feira', hours: []},
            {dayWeek: 'SATURDAY', label: 'Sábado', hours: []},
          ];
        }
      });
    } catch (err) {
      console.log(err);
      Alert.alert('Tente novamente', 'Erro ao consultar horários');
    }
  };

  React.useEffect(() => loadHours(), []);

  return (
    <Container>
      <Title style={{backgroundColor: 'transparent'}}>Dias da semana</Title>
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}>
        <Hours
          dayWeek={weekDay}
          setWeekDays={setWeekDays}
          setShowModal={setShowModal}
          loadHours={loadHours}
        />
      </Modal>

      <ScrollView>
        {weekDays.map((item) => (
          <>
            <ContainDay
              key={item.dayWeek}
              onPress={() => {
                setWeekDay(item);
                setShowModal(true);
              }}>
              <Contain>
                <TextContain>{item.label}</TextContain>
              </Contain>

              {item?.hours?.length === 0 ? (
                <TextContainHour>Fechado</TextContainHour>
              ) : (
                <>
                  {item?.hours?.length > 1 ? (
                    <TextContainHour>
                      {item?.hours[0]?.openingHours} -
                      {item?.hours[0]?.closingHours} (+{item?.hours?.length - 1}
                      )
                    </TextContainHour>
                  ) : (
                    <TextContainHour>
                      {item?.hours[0]?.openingHours} -
                      {item?.hours[0]?.closingHours}
                    </TextContainHour>
                  )}
                </>
              )}

              <Image source={require('../../assets/images/Voltar.png')} />
            </ContainDay>
            <Divider />
          </>
        ))}
      </ScrollView>

      <DividerContain />

      <Button>
        <TextButton>Salvar</TextButton>
      </Button>
    </Container>
  );
};

export default Timer;
