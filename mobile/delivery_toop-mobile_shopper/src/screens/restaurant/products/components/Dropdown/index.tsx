/**
 * import types
 */
import iDropdown, {iOptions} from '../../../../../@types/Dropdown';

/**
 * external imports
 */
import React from 'react';
import ModalSelector from 'react-native-modal-selector-searchable';
import {Text, View, TextInput} from 'react-native';

/**
 * styles import
 */
import styles from './styles';

const Dropdown: React.FC<iDropdown> = ({
  search = false,
  ref,
  options,
  showLabel,
  label,
  value,
  onChangeText,
}) => {
  const filterData = (text: string, data: iOptions[]) => {
    if (text)
      return options.filter((option) =>
        option.label.toUpperCase().includes(text.toUpperCase()),
      );
    else
      return [{key: 0, section: true, label: 'Selecione'}, ...options].slice(
        0,
        50000,
      );
  };

  return (
    <View style={styles().formGroup}>
      {showLabel ? <Text style={styles().label}>{label}</Text> : null}

      <ModalSelector
        ref={ref}
        search={search}
        searchText="Procurar"
        frozenSearch
        onSearchFilterer={filterData}
        key={label}
        data={options}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        listType={'SCROLLVIEW'}
        renderItem={({item}) => <></>}
        style={styles().input}
        initValue="Pressione para selecionar"
        supportedOrientations={['portrait']}
        //accessible={true}
        overlayStyle={styles().overlayStyle}
        cancelStyle={styles().cancelStyle}
        cancelTextStyle={styles().cancelTextStyle}
        backdropPressToClose={true}
        cancelText={'Fechar'}
        optionContainerStyle={styles().optionContainerStyle}
        optionStyle={styles().optionStyle}
        optionTextStyle={styles().optionTextStyle}
        sectionTextStyle={styles().sectionTextStyle}
        //scrollViewAccessibilityLabel={"Opções de rolagem"}
        //cancelButtonAccessibilityLabel={"Botão Cancelar"}
        onChange={(option: any) => onChangeText(option)}>
        <TextInput
          style={styles().inputLabel}
          editable={false}
          placeholder="Categoria"
          value={value}
        />
      </ModalSelector>
    </View>
  );
};

export default React.memo(Dropdown);
