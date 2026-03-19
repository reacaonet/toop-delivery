const initialState = {
  active: false,
};

const reducer = (state = initialState, action: any) => {
  const newState = {...state};
  switch (action.type) {
    case 'SET_PIP_ANDROID_UPDATE':
      return (newState.active = action.payload);
  }
  return newState;
};

export default reducer;
