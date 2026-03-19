import React, {Component} from 'react';

import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {Colors, Typography} from '../../../styles';

import {Input} from './../styles';

import {maskHours} from './../../../utils/index';

type defaultProps = {
  day: string;
  dayWeek: string;
  hours: any[];
  handleAddHours: any;
  handleRemoveHours: any;
  handleAddHour: any;
};

export default class HoursForWeedDay extends Component<defaultProps> {
  render() {
    const {hours, dayWeek} = this.props;
    const {handleAddHours, handleRemoveHours} = this.props;
    const {handleAddHour} = this.props;

    return (
      <View style={{padding: 20}}>
        <View style={styles.container}>
          <Text style={styles.radioText}>Novo horário</Text>
          <TouchableOpacity
            style={{
              alignItems: 'center',
            }}
            hitSlop={{left: 15, right: 15, top: 15, bottom: 15}}
            onPress={() => handleAddHours()}>
            <Icon name="add" size={35} style={{color: 'green'}} />
          </TouchableOpacity>
        </View>

        <ScrollView>
          {hours.map((hour, index) => (
            <View style={styles.container} key={`${dayWeek}-${index}`}>
              <Input
                focusable={true}
                underlineColorAndroid="transparent"
                autoCorrect={false}
                autoFocus={true}
                numberOfLines={1}
                autoCompleteType="off"
                keyboardType="numeric"
                value={hour.openingHours}
                onChangeText={(value: any) =>
                  handleAddHour(maskHours(value), 'openingHours', index)
                }
                style={[styles.input, {marginRight: 5}]}
              />
              <Input
                autoCorrect={false}
                numberOfLines={1}
                autoCompleteType="off"
                keyboardType="numeric"
                value={hour.closingHours}
                onChangeText={(value: any) =>
                  handleAddHour(maskHours(value), 'closingHours', index)
                }
                style={[styles.input, {marginRight: 5}]}
              />

              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  padding: 5,
                }}
                hitSlop={{left: 15, right: 20, top: 15, bottom: 15}}
                onPress={() => handleRemoveHours(index, hour?._id)}>
                <Icon name="delete-outline" size={22} style={{color: 'red'}} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  radioText: {
    marginLeft: 0,
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    color: Colors.GRAY_DARK,
  },

  input: {
    textAlign: 'center',
  },
});
