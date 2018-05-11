import React from 'react';
import { IntlProvider, addLocaleData } from 'react-intl';
import DetailsCard from './details/DetailsCard';
import PropTypes from 'prop-types';
import Interpretation from '../models/interpretation';
import InterpretationsCard from './interpretations/InterpretationsCard';

const interpretationsFields = [
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

class Interpretations extends React.Component {
    state = { model: null };

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    getChildContext() {
        return { d2: this.props.d2 };
    }

    componentDidMount() {
        this.loadModel(this.props);
        this.initLocale(this.props.d2);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.type !== nextProps.type || this.props.id !== nextProps.id) {
            this.loadModel(nextProps);
        }
    }

    getLocale(d2) {
        return d2.currentUser.userSettings.settings.keyUiLocale || "en";
    }

    initLocale(d2) {
        addLocaleData(require(`react-intl/locale-data/${this.getLocale(d2)}`));
    }

    loadModel(props) {
        const { id, type } = props;
        const modelClass = this.props.d2.models[type];
        const options = {fields: baseFields.join(',')};

        return modelClass.get(id, options).then(model => {
            model.interpretations = model.interpretations.map(attrs => new Interpretation(model, attrs));
            this.setState({model});
            return model;
        });
    }

    onChange() {
        this.loadModel(this.props)
            .then(newModel => this.props.onChange && this.props.onChange(newModel));
    }

    render() {
        const { d2, currentInterpretationId, onCurrentInterpretationChange } = this.props;
        const { model } = this.state;
        const locale = this.getLocale(d2);

        if (!model)
          return <p>Loading...</p>;

        return (
            <IntlProvider locale={locale}>
                <div>
                    <DetailsCard
                        model={model}
                        onChange={this.onChange}
                    />

                    <InterpretationsCard
                        model={model}
                        onChange={this.onChange}
                        currentInterpretationId={currentInterpretationId}
                        onCurrentInterpretationChange={onCurrentInterpretationChange}
                    />
                </div>
            </IntlProvider>
        );
    }
}

Interpretations.propTypes = {
    d2: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    currentInterpretationId: PropTypes.string,
    onCurrentInterpretationChange: PropTypes.func,
};

Interpretations.childContextTypes = {
    d2: PropTypes.object,
};

export default Interpretations;