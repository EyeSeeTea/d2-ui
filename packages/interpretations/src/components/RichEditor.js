import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import { Portal } from 'react-portal';

import { findIndex } from 'lodash/fp';
import CKEditor from './CKEditor';

const styles = {
    mentions: {
        position: "absolute",
        boxShadow: "rgb(136, 136, 136) 0px 0px 4px 0px",
        margin: 0,
        padding: 4,
        zIndex: 1000000,
        backgroundColor: "#FAFFFA",
        listStyleType: "none",
        fontFamily: "Roboto, sans-serif",
        height: "200px",
        overflowY: "auto"
    },
    mentionTitle: {
        padding: "5px 15px",
        borderBottom: "1px solid rgb(224, 224, 224)",
        fontSize: "0.75rem",
        fontWeight: 500
    },
    userMention: {
        cursor: "pointer",
        padding: "5px 15px",
        borderBottom: "1px solid rgb(224, 224, 224)",
        fontSize: "0.75rem"
    },
    userMentionSelected: {
        backgroundColor: "#ACD",
    },
};

class UserMatch extends Component {
    constructor(props, context) {
        super(props, context);
        this.onUserClick = this.onUserClick.bind(this);
        this.onMouseEnter = this.onChangeSelected.bind(this, true);
        this.onMouseLeave = this.onChangeSelected.bind(this, false);
        this.state = {};
    }

    onUserClick() {
        this.props.onClick(this.props.user);
    }

    onChangeSelected(isSelected) {
        this.props.onMouseSelected(this.props.user, isSelected);
    }

    render() {
        const { user, isSelected, pattern } = this.props;
        const style = { ...styles.userMention, ...(isSelected ? styles.userMentionSelected : {}) };
        const text = `${user.displayName} (${user.username})`;
        let formatted;
        if (pattern){
            formatted = text
                .split(new RegExp(`(${pattern})`, 'gi'))
                .map((part, idx) => part.toLowerCase() === pattern.toLowerCase() ? <b key={idx}>{part}</b> : part);
        }
        else{
            formatted = text;
        }

        return (
            <li
                style={style}
                onClick={this.onUserClick}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
            >
                <span>{formatted}</span>
            </li>
        );
    };
}

const keycodes = {up: 38, down: 40, enter: 13, tab: 9};

const userType = PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
});

export default class RichEditor extends Component {
    static propTypes = {
        ...CKEditor.propTypes,
        mentions: PropTypes.shape({
            allUsers: PropTypes.arrayOf(userType).isRequired,
            mostMentionedUsers: PropTypes.arrayOf(userType).isRequired,
        }),
    };

    constructor(props, context) {
        super(props, context);
        this.onEditorInitialized = this.onEditorInitialized.bind(this);
        this.onEditorChange = this.onEditorChange.bind(this);
        this.insertUser = this.insertUser.bind(this);
        this.onEditorKey = this.onEditorKey.bind(this);
        this.onMouseSelected = this.onMouseSelected.bind(this);
        this.setMentionsRef = this.setMentionsRef.bind(this);
        this.onDocumentClick = this.onDocumentClick.bind(this);
        this.state = {matchingUsers: [], currentUserIndex: null, splitListIndex: null, pattern: null, position: null};
    }

    componentDidMount () {
      document.addEventListener('click', this.onDocumentClick);
    }

    componentWillUnmount () {
      document.removeEventListener('click', this.onDocumentClick);
    }

    onDocumentClick(ev) {
      const area = ReactDOM.findDOMNode(this.mentionsArea);

      if (area && !area.contains(ev.target)) {
        this.clearMentions();
      }
    }

    insertUser(user) {
        this.editor.replaceCurrentWord(`@${user.username}`);
        this.props.onEditorChange(this.editor.getValue());
        this.clearMentions();
    }

    clearMentions() {
        this.setState({matchingUsers: [], currentUserIndex: null});
    }

    onEditorInitialized(editor) {
        this.editor = editor;
        editor.setCursorAtEnd();
    }

    onEditorKey(ev) {
        const { matchingUsers, currentUserIndex } = this.state;
        if (currentUserIndex === null)
            return;
        const nUsers = matchingUsers.length;
        const { keyCode } = ev.data;

        if (keyCode == keycodes.up) {
            this.setState({currentUserIndex: (currentUserIndex - 1 + nUsers) % nUsers});
            ev.cancel();
        } else if (keyCode == keycodes.down) {
            this.setState({currentUserIndex: (currentUserIndex + 1) % nUsers});
            ev.cancel();
        } else if (keyCode == keycodes.enter || keyCode == keycodes.tab) {
            const currentUser = matchingUsers[currentUserIndex];
            this.insertUser(currentUser);
            ev.cancel();
        }
    }

    onEditorChange(newValue) {
        const { mentions, onEditorChange } = this.props;
        onEditorChange(newValue);
        if (mentions)
            this.showMentions(mentions);
    }

    showMentions(mentions) {
        const currentWord = this.editor.getCurrentWord();
        let matchingUsers;

        if (currentWord.startsWith("@")) {
            const pattern = currentWord.slice(1);
            const filter = users => users
                .filter(user => user.displayName.includes(pattern) || user.username.includes(pattern));
            const mostMentionedUsersFiltered = filter(mentions.mostMentionedUsers);
            const allUsersFiltered = filter(mentions.allUsers);
            const matchingUsers = mostMentionedUsersFiltered.concat(allUsersFiltered);
            const splitListIndex = mostMentionedUsersFiltered.length;
            const position = this.editor.getPosition({top: 25, left: 0});
            this.setState({ pattern, matchingUsers, currentUserIndex: 0, splitListIndex, position });
        } else {
            this.setState({ pattern: null, matchingUsers: [], currentUserIndex: null });
        }
    }

    onMouseSelected(user, isSelected) {
        if (isSelected) {
            const index = findIndex(u => user.id === u.id, this.state.matchingUsers);
            if (index >= 0)
                this.setState({ currentUserIndex: index });
        }
    }

    setMentionsRef(mentionsArea) {
        this.mentionsArea = mentionsArea;
    }

    render() {
        const { pattern, matchingUsers, currentUserIndex, splitListIndex, position } = this.state;
        const { i18n, ...ckeditorProps } = this.props;
        const getTitleItem = i18nKey => (
            <li key="most-mentioned" style={styles.mentionTitle}>
                {i18n[i18nKey]} @{pattern}
            </li>
        );

        return (
            <div>
                {matchingUsers.length > 0 && position &&
                    <Portal>
                        <ul style={{...styles.mentions, ...position}} ref={this.setMentionsRef}>
                            {matchingUsers.map((user, idx) => [
                                idx === 0 && idx !== splitListIndex && getTitleItem("most_common_users_matching"),
                                idx === splitListIndex && getTitleItem("other_users_matching"),
                                <UserMatch
                                    key={"user-" + user.id}
                                    pattern={pattern}
                                    isSelected={idx === currentUserIndex}
                                    user={user}
                                    onClick={this.insertUser}
                                    onMouseSelected={this.onMouseSelected}
                                />,
                            ])}
                        </ul>
                    </Portal>
                }

                <CKEditor
                    {...ckeditorProps}
                    onEditorChange={this.onEditorChange}
                    onEditorKey={this.onEditorKey}
                    onEditorInitialized={this.onEditorInitialized}
                />
            </div>
        );
    }
}