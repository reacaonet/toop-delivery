/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/** */
import { Container, Title, ContentItem, Circle, SelectedInnerCircle, Name } from './styles';

const Radio = ({ name, item, payload }: any) => {
  const [selected, setSelected] = useState<string>();

  useFocusEffect(
    useCallback(() => {
      if (selected === '') {
        const current = { ...payload.current };
        if (item.inputGroup) {
          if (!current[`${item.inputGroup}`]) {
            current[`${item.inputGroup}`] = {};
          }

          current[`${item.inputGroup}`][`${name}`] = '';
        } else {
          current[`${name}`] = '';
        }

        payload.current = current;
      }
    }, []),
  );

  const clickItem = (value: string) => {
    const current = { ...payload.current };

    if (item.inputGroup) {
      if (!current[`${item.inputGroup}`]) {
        current[`${item.inputGroup}`] = {};
      }

      current[`${item.inputGroup}`][`${name}`] = value;
    } else {
      current[`${name}`] = value;
    }

    payload.current = current;
    setSelected(value);
  };

  return (
    <Container>
      <Title>{item?.title}</Title>
      {item && item?.list && Array.isArray(item?.list) && item?.list.length > 0
        ? item.list.map((radio: any) => (
          <ContentItem key={radio[item.listKey]} onPress={() => clickItem(radio[item.listKey])}>
            <Circle>
              {selected && selected === radio[item.listKey] ? <SelectedInnerCircle /> : null}
            </Circle>
            <Name>{radio?.title}</Name>
          </ContentItem>
        )) : null
      }
    </Container>
  );
};

export default Radio;
