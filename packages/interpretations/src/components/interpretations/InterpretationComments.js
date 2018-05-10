import React from 'react';
import { Link, ActionSeparator, WithAvatar, getUserLink } from './misc';
import CommentTextarea from './CommentTextarea';
import { userCanManage } from '../../util/auth';
import { FormattedRelative } from 'react-intl';
import PropTypes from 'prop-types';
import CommentModel from '../../models/comment';
import { config } from 'd2/lib/d2';

config.i18n.strings.add('edit');
config.i18n.strings.add('delete');
config.i18n.strings.add('delete_comment_confirmation');

const Comment = ({ d2, comment, showActions, onEdit, onDelete }) => (
    <div>
        <div className="commentText">
            {comment.text}
        </div>

        <span className="tipText">
            <FormattedRelative value={comment.created} />
        </span>

        <ActionSeparator labelText="" />

        {showActions &&
            <span>
                <Link label={d2.i18n.getTranslation('edit')} onClick={() => onEdit(comment)} />
                <ActionSeparator />
                <Link label={d2.i18n.getTranslation('delete')} onClick={() => onDelete(comment)} />
            </span>}
    </div>
);

export default class InterpretationComments extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        interpretation: PropTypes.object.isRequired,
        onSave: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired,
    };

    state = {
        commentToEdit: null,
    };

    constructor(props) {
        super(props);
    }

    _onEdit(comment) {
        this.setState({ commentToEdit: comment });
    }

    _onCancelEdit(comment) {
        this.setState({ commentToEdit: null });
    }

    _onDelete(comment) {
        if (confirm(this.props.d2.i18n.getTranslation('delete_comment_confirmation'))) {
            this.props.onDelete(comment);
        }
    }

    _onSave(comment, text) {
        comment.text = text;
        this.props.onSave(comment);
        this.setState({ commentToEdit: null });
    }

    render() {
        const { d2, interpretation } = this.props;
        const { commentToEdit } = this.state;
        const comments = interpretation.comments;

        return (
            <div>
                <WithAvatar user={d2.currentUser}>
                    <CommentTextarea comment={{text: ""}} onPost={text => this._onSave(new CommentModel(interpretation), text)} />
                </WithAvatar>

                {comments.map(comment =>
                    <WithAvatar key={comment.id} user={comment.user}>
                        <div className="commentAuthor">
                            {getUserLink(d2, comment.user)}
                        </div>

                        {commentToEdit && commentToEdit.id === comment.id
                            ?
                                <CommentTextarea
                                    comment={comment}
                                    onPost={text => this._onSave(comment, text)}
                                    onCancel={() => this._onCancelEdit()}
                                />
                            :
                                <Comment
                                    d2={d2}
                                    comment={comment}
                                    showActions={userCanManage(d2, comment)}
                                    onEdit={() => this._onEdit(comment)}
                                    onDelete={() => this._onDelete(comment)}
                                />
                        }
                    </WithAvatar>
                )}
            </div>
        );
    }
};
