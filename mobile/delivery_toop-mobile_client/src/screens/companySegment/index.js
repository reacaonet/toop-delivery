import React, {useState, useCallback, useEffect} from 'react';
import {
  StatusBar,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

/** Components */
import Search from './components/Search';
import Categories from './components/Categories';
import Slide from './components/Slide';
import Company from './components/Company';

/** Styles */
import {styles, Container, ViewHeader, TextHeader} from './Styles';

/** Services */
import {listOneSegment} from '../../services/service/company/listSegments';

const CompanySegment = ({}) => {
  const navigation = useNavigation();
  const route = useRoute();

  const [refreshing, setRefreshing] = useState(false);
  const [paramsSegment] = useState(route?.params?.segment ?? null);
  const [segment, setSegment] = useState(null);

  const [category, setCategory] = useState(route.params?.category ?? null);
  const [topFilter, setTopFilter] = useState(route.params?.topFilter ?? null);

  useEffect(() => {
    if (paramsSegment !== null && paramsSegment?._id) {
      setSegment(paramsSegment);
    } else if (paramsSegment && typeof paramsSegment === 'string') {
      listOneSegment(paramsSegment).then(result => {
        if (result && result._id) {
          setSegment(result);
        }
      });
    }
  }, [paramsSegment]);

  const wait = timeout => {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    wait(2000).then(async () => {
      setRefreshing(false);
    });
  }, []);

  return (
    <>
      <StatusBar
        translucent
        barStyle="light-content"
        backgroundColor="transparent"
      />

      <Container>
        <SafeAreaView style={styles.safeArea}>
          <ViewHeader>
            <Icon
              name="navigate-before"
              size={45}
              style={styles.icon}
              onPress={() => navigation.navigate('Home')}
            />
            <TextHeader>{segment?.name || ''}</TextHeader>
          </ViewHeader>
          <Search />
          <ScrollView
            style={styles.Scrollview}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            {segment ? (
              <>
                <Slide segment={segment} />
                <Categories
                  segment={segment}
                  category={category}
                  setCategory={setCategory}
                  topFilter={topFilter}
                  setTopFilter={setTopFilter}
                  refreshing={refreshing}
                />
                <Company
                  refreshing={refreshing}
                  segment={segment}
                  category={category}
                  topFilter={topFilter}
                />
              </>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </Container>
    </>
  );
};

export default CompanySegment;
