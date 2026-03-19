import React from 'react';
import {useSelector} from 'react-redux';

/** services */
import {
  deleteHour,
  createHour,
  updateHour,
} from './../../services/provider/company/hours';
import {clearMask} from './../../utils/index';

import {Container, Title, Button, TextButton} from './styles';

import HoursForWeedDay from './components/HoursForWeedDay';

interface Props {
  dayWeek: {dayWeek: string; label: string; hours: any[]};
  setWeekDays: any;
  setShowModal: any;
  loadHours: any;
}

const Hours = ({dayWeek, setWeekDays, setShowModal, loadHours}: Props) => {
  const {
    authUser: {user = null},
  }: any = useSelector((state) => state);

  const handleAddHours = () => {
    const newHour: any = {
      openingHours: '',
      closingHours: '',
      _id: '',
    };

    dayWeek.hours.push({...newHour, index: dayWeek.hours.length + 1});

    setWeekDays((oldValues: any) =>
      oldValues.map((i: any) => {
        if (i.dayWeek === dayWeek.dayWeek) i = dayWeek;
        return i;
      }),
    );
  };

  const handleAddHour = (value: any, key: string, index: number) => {
    dayWeek.hours[index][key] = value;

    setWeekDays((oldValues: any) =>
      oldValues.map((i: any) => {
        if (i.dayWeek === dayWeek.dayWeek) i = dayWeek;
        return i;
      }),
    );
  };

  const handleRemoveHours = async (index: number, _id: string) => {
    if (_id) deleteHour(_id);

    dayWeek.hours = dayWeek.hours.filter((hour: any, i: number) => i !== index);

    setWeekDays((oldValues: any) =>
      oldValues.map((i: any) => {
        if (i.dayWeek === dayWeek.dayWeek) i = dayWeek;
        return i;
      }),
    );
  };

  const handleSave = async () => {
    dayWeek.hours.map((h) => {
      if (h._id) {
        updateHour(h._id, {
          company: user?.company?._id,
          openingHours: clearMask(h.openingHours),
          closingHours: clearMask(h.closingHours),
          dayWeek: dayWeek.dayWeek,
        });
      } else {
        createHour(user?.company?._id, {
          company: user?.company?._id,
          openingHours: clearMask(h.openingHours),
          closingHours: clearMask(h.closingHours),
          dayWeek: dayWeek.dayWeek,
        });
      }
    });
    loadHours();
    setShowModal(false);
  };

  return (
    <Container>
      <Title>Editar Horário</Title>
      <HoursForWeedDay
        day={dayWeek.label}
        dayWeek={dayWeek.dayWeek}
        hours={dayWeek.hours}
        handleAddHours={handleAddHours}
        handleRemoveHours={handleRemoveHours}
        handleAddHour={handleAddHour}
      />

      <Button onPress={handleSave}>
        <TextButton>Pronto</TextButton>
      </Button>
    </Container>
  );
};

export default Hours;
