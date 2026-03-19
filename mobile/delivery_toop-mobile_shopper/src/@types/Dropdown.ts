export interface iOptions {
  value?: any | string;
  more?: any | string;
  key?: any | string | number;
  label: string;
  section?: boolean;
  state?: number | any;
  all?: boolean;
  component?: any;
}

export default interface iDropDown {
  showLabel: false | true;
  search?: false | true;
  label?: string;
  value?: string | undefined;
  values?: iOptions[] | undefined;
  onChangeText?: any;
  onChangeItems?: any;
  options: iOptions[];
  placeholder?: string;
  whiteStyle?: true | false;
  arrowStyle?: {position: string; right: number; top: number; fill: string};
  whitePlaceholder?: boolean;
  ref?: any;
}
