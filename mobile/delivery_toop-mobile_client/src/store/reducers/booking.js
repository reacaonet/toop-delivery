import {GET_BOOKING, CLEAN_BOOKING} from '../actions/actionTypes';

/**
 * create_request -> criando solicitação
 * ready_to_ship -> pronto para envio
 * request_sent -> enviado para o servidor
 * waiting -> aguardando encontrar entregador
 * accepted -> aceito
 * in_progress -> em Progresso
 * concluded -> Concluído
 * canceled -> cancelado
 * error -> falhou a solicitação de envio para servidor
 */

const initialState = {
  load: false,
  booking: null,
  status: 'create_request',
  origin: {},
  destiny: {},
  service: null,
  payment: null,
};

const reducer = (state = initialState, action) => {
  let newState = {...state};
  switch (action.type) {
    case GET_BOOKING:
      let item = action.payload;
      newState = {...newState, ...item};
      return newState;
    case CLEAN_BOOKING:
      return initialState;
  }
  return newState;
};

export default reducer;
