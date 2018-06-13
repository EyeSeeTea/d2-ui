import React from 'react';
import PropTypes from 'prop-types'
import { Link, ActionSeparator } from './misc';
import { config } from 'd2/lib/d2';
import styles from './InterpretationsStyles.js';
import RichEditor from '../RichEditor';

config.i18n.strings.add('post_comment');
config.i18n.strings.add('ok');
config.i18n.strings.add('cancel');

class CommentTextarea extends React.Component {
    static propTypes = {
        comment: PropTypes.object.isRequired,
        onPost: PropTypes.func.isRequired,
        onCancel: PropTypes.func,
        mentions: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = { text: props.comment.text || "", refresh: new Date() };
        this.onPost = this.onPost.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    componentWillReceiveProps(newProps) {
        if (this.props.comment !== newProps.comment) {
            this.setState({ text: newProps.comment.text, refresh: new Date() });
        }
    }

    onChange(newText) {
        this.setState({ text: newText });
    }

    onPost() {
        const newText = this.state.text;
        if (newText && newText.trim()) {
            const newComment = this.props.comment;
            newComment.text = newText;
            this.props.onPost(newComment);
            this.setState({ text: "", refresh: new Date().getTime() });
        }
    }

    render() {
        const { d2 } = this.context;
        const { comment, onCancel, mentions } = this.props;
        const { text, refresh } = this.state;
        const postText = onCancel ? d2.i18n.getTranslation("ok") : d2.i18n.getTranslation('post_comment');

        return (
            <div>
                <RichEditor
                    onEditorChange={this.onChange}
                    initialContent={text}
                    refresh={refresh}
                    mentions={mentions}
                    i18n={d2.i18n.translations}
                />

                <Link disabled={!text} label={postText} onClick={this.onPost} />

                {onCancel &&
                    <span>
                        <ActionSeparator />
                        <Link label={d2.i18n.getTranslation('cancel')} onClick={onCancel} />
                    </span>}
            </div>
        );
    }
};

CommentTextarea.propTypes = {
    comment: PropTypes.object.isRequired,
    onPost: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
};

CommentTextarea.contextTypes = {
    d2: PropTypes.object.isRequired,
};

export default CommentTextarea;
