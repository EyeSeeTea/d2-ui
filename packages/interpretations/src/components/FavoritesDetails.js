import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider, addLocaleData } from 'react-intl';
import configureStore from '../configureStore';
import DetailsCard from './details/DetailsCard';
import PropTypes from 'prop-types';
import Interpretation from '../models/interpretation';
import InterpretationsCard from './interpretations/InterpretationsCard';

const store = configureStore();

export const interpretationsFields = [
    'id',
    'user[id,displayName]',
    'created',
    'likes',
    'likedBy[id,displayName]',
    'text',
    'comments[id,text,created,user[id,displayName]]',
];

const baseFields = [
    'id',
    'name',
    'href',
    'user[id,displayName]',
    'displayName',
    'description',
    'created',
    'lastUpdated',
    'access',
    'publicAccess',
    'userGroupAccesses',
    `interpretations[${interpretationsFields.join(',')}]`,
];

class FavoritesDetails extends React.Component {
    state = { model: null };

    getChildContext() {
        return { d2: this.props.d2 };
    }

    componentDidMount() {
        this.loadModel();
    }

    loadModel() {
        const { id, type } = this.props;
        return this.props.d2.models[type].get(id, {fields: baseFields.join(',')}).then(model => {
            console.log("model", model);
            window.model = model;
            model.interpretations = model.interpretations.map(attrs => new Interpretation(model, attrs));
            this.setState({model});
            return model;
        });
    }

    onChange() {
        this.loadModel().then(newModel => this.props.onChange(newModel));
    }

    render() {
        const { model } = this.state;
        const locale = d2.currentUser.userSettings.settings.keyUiLocale || "en";
        addLocaleData(require(`react-intl/locale-data/${locale}`));

        if (!this.state.model)
          return <p>Loading...</p>;

        return (
            <Provider store={store}>
                <IntlProvider locale={locale}>
                    <div>
                        <DetailsCard model={model} onChange={this.onChange.bind(this)} />
                        <InterpretationsCard model={model} onChange={this.onChange.bind(this)} />
                    </div>
                </IntlProvider>
            </Provider>
        );
    }
}

FavoritesDetails.childContextTypes = {
    d2: PropTypes.object,
};

export default FavoritesDetails;