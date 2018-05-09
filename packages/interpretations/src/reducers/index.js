import { combineReducers } from 'redux';

import details from './details';
import interpretations from './interpretations';

export default combineReducers({
  details,
  interpretations,
});