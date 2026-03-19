/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useEffect } from 'react';
import { TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Container, Title, SubTitle, ListItem, ListItemText, ListItemSubText, ContentInputFilter } from './styles';
import { Colors } from '../../../../../styles';

const List = ({ name, item, payload, scrollRef }: any) => {
  const [textValue, setTextValue] = useState('');
  const [txtFilter, setTxtFilter] = useState('');
  const [listFilter, setListFilter] = useState(item?.list || []);

  useFocusEffect(
    useCallback(() => {
      if (textValue === '') {
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

  useEffect(() => {
    if (txtFilter && `${txtFilter}`.length >= 1) {
      try {
        const resp = item?.list.filter((content: any) => {
          try {
            var regex = new RegExp(`\\${txtFilter}`, 'i');
            return content?.title.match(regex);
          } catch (err) {
            return false;
          }
        });

        if (resp) {
          setListFilter(resp);
        }

        // console.log('resp', resp);
      } catch (err) {
        console.log('fail', err);
      }
    } else {
      setListFilter(item?.list || []);
    }
  }, [txtFilter]);

  const clickItem = (itemList: any) => {
    try {
      setTextValue(itemList[item?.listKey]);

      const current = { ...payload.current };
      if (item.inputGroup) {
        if (!current[`${item.inputGroup}`]) {
          current[`${item.inputGroup}`] = {};
        }

        current[`${item.inputGroup}`][`${name}`] = itemList[item?.listKey];
      } else {
        current[`${name}`] = itemList[item?.listKey];
      }

      payload.current = current;

      if (scrollRef && scrollRef.current) {
        scrollRef.current?.scrollToEnd({ animated: true });
      }
    } catch (err) {
      console.log('Oops', err);
    }
  };

  return (
    <Container>
      <Title>{item?.title}</Title>
      {item?.subTitle ? (
        <SubTitle>{item?.subTitle}</SubTitle>
      ) : null}

      {item?.listFilter === true ? (
        <ContentInputFilter>
          <TextInput
            placeholder={item?.listFilterPlaceholder || 'Filtrar '}
            keyboardType="default"
            value={txtFilter}
            placeholderTextColor={Colors.BLACK}
            onChangeText={(value: any) => {
              setTxtFilter(value);
            }}
          />
        </ContentInputFilter>
      ) : null}

      {listFilter && Array.isArray(listFilter) && listFilter.length > 0
        ? listFilter.map((content: any) => {
          return (
            <ListItem
              key={`${content[item?.listKey]}`}
              background={content[item?.listKey] === textValue ? Colors.GRAY_MAX_DARK : undefined}
              onPress={() => {
                clickItem(content);
              }}>
              <ListItemText>{content?.title}</ListItemText>
              {content?.subTitle ? <ListItemSubText>{content?.subTitle}</ListItemSubText> : null}
            </ListItem>
          );
        })
        : null}
    </Container>
  );
};

export default List;
