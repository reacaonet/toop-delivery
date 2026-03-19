import React, { useState } from 'react';
import FastImage from 'react-native-fast-image';
import { FlatList, TouchBox, ImageFast, Text, View } from './Styles';

const FilterList = ({ data, category, setCategory }) => {
  if (!(data && Object.keys(data).length > 0)) {
    return null;
  }

  const [topFilter, setTopFilter] = useState(null);

  const setFilter = async (filter, filterTop) => {
    if (filterTop) {
      setTopFilter(true);
    } else {
      setTopFilter(false);
    }

    if (category === filter) {
      setCategory(null);
      if (filterTop) {
        setTopFilter(false);
      }
    } else {
      setCategory(filter);
    }
  };

  return (
    <View>
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        horizontal
        renderItem={({ item }) => (
          <TouchBox onPress={() => setFilter(item.keyword || item.name, true)}>
            <ImageFast
              source={{
                uri: item.images[0],
                priority: FastImage.priority.normal,
              }}
              isDisabled={category !== item.keyword && topFilter}
              resizeMode={FastImage.resizeMode.stretch}
            />
            <Text numberOfLines={1}>{item.name}</Text>
          </TouchBox>
        )}
      />
    </View>
  );
};

export default FilterList;
