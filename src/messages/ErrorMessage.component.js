import React from 'react';
import PropTypes from "prop-types";
import Message from './Message.component';
import mapProps from '../component-helpers/mapProps';

export default mapProps((props) => ({ style: { color: 'red'}, ...props }), Message);


