import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider, addLocaleData } from 'react-intl';
import configureStore from '../configureStore';
import DetailsCard from './details/DetailsCard';
import PropTypes from 'prop-types';
import InterpretationsCard from './interpretations/InterpretationsCard';

const store = configureStore();

class FavoritesDetails extends React.Component {
  getChildContext() {
      return { d2: this.props.d2 };
  }

  render() {
    const { model, onFavoriteChange } = this.props;
    const locale = d2.currentUser.userSettings.settings.keyUiLocale || "en";
    addLocaleData(require(`react-intl/locale-data/${locale}`));

    return (
      <Provider store={store}>
        <IntlProvider locale={locale}>
          <div>
            <DetailsCard map={model} onFavoriteChange={onFavoriteChange} />
            <InterpretationsCard map={model} />
          </div>
        </IntlProvider>
      </Provider>
    );
  }
}

FavoritesDetails.childContextTypes = {
    d2: PropTypes.object
};

export default FavoritesDetails;