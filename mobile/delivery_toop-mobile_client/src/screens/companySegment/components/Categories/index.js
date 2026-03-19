import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';

/** Service */
import {listFilter} from '../../../../services/service/Filter';

/** Styles */
import styles from './styles';

const Categories = ({
  category,
  setCategory,
  topFilter,
  setTopFilter,
  refreshing,
  segment,
}) => {
  const [dataFilter, setDataFilter] = useState([]);

  useEffect(() => {
    listFilter({
      type: 'restaurant',
      segment: segment?._id,
      showInApp: true,
    }).then(result => {
      setDataFilter(result);
    });
    return () => {};
  }, [segment, refreshing]);

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
    <>
      {dataFilter && dataFilter.length > 0 ? (
        <View style={styles.container}>
          <FlatList
            data={dataFilter}
            keyExtractor={item => item._id}
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.flatItem,
                  category === item.keyword ? styles.itemSelect : null,
                ]}
                onPress={() => setFilter(item.keyword || item.name, true)}>
                <Text style={styles.flatTitle}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : null}
    </>
  );
};

export default Categories;
