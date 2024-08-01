import { AppActionKind } from '../../../types/interface';

export const initialState: AppState = {
  frequencyData: [],
  amplitudeData: [],
  isPlaying: false,
};

export const AppReducer = (state: AppState, action: AppAction) => {
  const { type, payload } = action;

  switch (type) {
    case AppActionKind.frequency: {
      return {
        ...state,
        frequencyData: payload,
      };
    }
    case AppActionKind.amplitude: {
      return {
        ...state,
        amplitudeData: payload,
      };
    }
    case AppActionKind.playing: {
      return {
        ...state,
        isPlaying: payload,
      };
    }
    default:
      return state;
  }
};
