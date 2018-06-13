import React from 'react';
import { Link, ActionSeparator, WithAvatar, getUserLink } from './misc';
import CommentTextarea from './CommentTextarea';
import { userCanManage } from '../../util/auth';
import { Button } from '@dhis2/d2-ui-core';
import { FormattedRelative } from 'react-intl';
import PropTypes from 'prop-types';
import CommentModel from '../../models/comment';
import { config } from 'd2/lib/d2';
import orderBy from 'lodash/fp/orderBy';
import styles from './InterpretationsStyles.js';

config.i18n.strings.add('edit');
config.i18n.strings.add('delete');
config.i18n.strings.add('delete_comment_confirmation');

const Comment = ({ d2, comment, showManageActions, onEdit, onDelete, onReply }) => (
    <div>
        <style>{styles.richTextCss}</style>
        
        <div className="richText" style={styles.commentText} dangerouslySetInnerHTML={{__html: comment.text}}>
        </div>

        <span style={styles.tipText}>
            <FormattedRelative value={comment.created} />
        </span>

        <ActionSeparator labelText="" />

        {showManageActions ?
            <span>
                <Link label={d2.i18n.getTranslation('edit')} value={comment} onClick={onEdit} />
                <ActionSeparator />
                <Link label={d2.i18n.getTranslation('reply')} value={comment} onClick={onReply} />
                <ActionSeparator />
                <Link label={d2.i18n.getTranslation('delete')} value={comment} onClick={onDelete} />
            </span>
            :
            <Link label={d2.i18n.getTranslation('reply')} value={comment} onClick={onReply} />
        }
    </div>
);

export default class InterpretationComments extends React.Component {
    static contextTypes = {
        d2: PropTypes.object.isRequired,
    };

    static propTypes = {
        interpretation: PropTypes.object.isRequired,
        onSave: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired,
        newComment: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.onSave = this.onSave.bind(this);
        this.onUpdate = this.onUpdate.bind(this);
        this.onEdit = this.onEdit.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onReply = this.onReply.bind(this);
        this.onShowMoreComments = this.onShowMoreComments.bind(this);
        this.onCancelEdit = this.onCancelEdit.bind(this);

        this.state = {
            commentToEdit: null,
            newComment: props.newComment,
            showOnlyFirstComments: true,
        };
    }

    componentWillReceiveProps(newProps) {
        if (this.props.newComment !== newProps.newComment) {
            this.setState({ newComment: newProps.newComment });
        }
    }

    onShowMoreComments() {
        this.setState({ showOnlyFirstComments: false });
    }

    onEdit(comment) {
        this.setState({ commentToEdit: comment });
    }

    onCancelEdit(comment) {
        this.setState({ commentToEdit: null });
    }

    onDelete(comment) {
        if (confirm(this.context.d2.i18n.getTranslation('delete_comment_confirmation'))) {
            this.props.onDelete(comment);
        }
    }

    onUpdate(comment) {
        this.props.onSave(comment);
        this.setState({ commentToEdit: null });
    }

    onSave(comment) {
        this.props.onSave(comment);
        this.setState({ showOnlyFirstComments: false });
    }

    onReply(comment) {
        const newComment = comment.getReply(this.context.d2);
        this.setState({ commentToEdit: null, newComment });
    }

    render() {
        const { d2 } = this.context;
        const { interpretation, mentions } = this.props;
        const { commentToEdit, newComment, showOnlyFirstComments } = this.state;
        const sortedComments = orderBy(["created"], ["asc"], interpretation.comments);
        const commentsToShowOnInit = 3;
        const comments = showOnlyFirstComments ? sortedComments.slice(0, commentsToShowOnInit): sortedComments;
        const hiddenCommentsCount = showOnlyFirstComments ? sortedComments.length - comments.length : 0;

        return (
            <div>
                <div className="interpretation-comments">
                    {comments.map(comment =>
                        <WithAvatar key={comment.id} user={comment.user}>
                            <div style={styles.commentAuthor}>
                                {getUserLink(d2, comment.user)}
                            </div>

                            {commentToEdit && commentToEdit.id === comment.id
                                ?
                                    <CommentTextarea
                                        comment={comment}
                                        onPost={this.onUpdate}
                                        onCancel={this.onCancelEdit}
                                        mentions={mentions}
                                    />
                                :
                                    <Comment
                                        d2={d2}
                                        comment={comment}
                                        showManageActions={userCanManage(d2, comment)}
                                        onEdit={this.onEdit}
                                        onDelete={this.onDelete}
                                        onReply={this.onReply}
                                    />
                            }
                        </WithAvatar>
                    )}

                    {showOnlyFirstComments && hiddenCommentsCount > 0 &&
                        <div style={{width: "100%", textAlign: "center"}}>
                            <Button onClick={this.onShowMoreComments} style={{display: "inline-block"}}>
                                {d2.i18n.getTranslation("show_more_comments", {n: hiddenCommentsCount})}
                            </Button>
                        </div>
                    }
                </div>

                {newComment &&
                    <WithAvatar user={d2.currentUser}>
                        <CommentTextarea
                            comment={newComment}
                            onPost={this.onSave}
                            mentions={mentions}
                        />
                    </WithAvatar>
                }
            </div>
        );
    }
};
