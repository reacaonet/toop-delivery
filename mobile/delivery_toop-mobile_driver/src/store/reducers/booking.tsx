import { GET_BOOKING, CLEAN_BOOKING } from '../storeTypes';

/**
 * create_request -> criando solicitação
 * accepted -> aceito
 * in_progress -> em Progresso
 * concluded -> Concluído
 * canceled -> cancelado
 * evaluation -> avaliar viagem
 * error -> falhou a solicitação de envio para servidor
 */

const initialState = {
  load: false,
  booking: null,
  status: 'create_request',
};

const reducer = (state = initialState, action: any) => {
  let newState = { ...state };
  switch (action.type) {
    case GET_BOOKING:
      let item: any = action.payload;
      newState = { ...newState, ...item };
      return newState;
    case CLEAN_BOOKING:
      return initialState;
  }
  return newState;
};

export default reducer;
