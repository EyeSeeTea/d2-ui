import React from 'react';
import PropTypes from "prop-types";
import ProfileMenu from './menus/ProfileMenu';
import InnerHeader from './InnerHeader';
import HeaderMenus from './menus/HeaderMenus';
import SearchField from './search/SearchField';
import styles, { applyUserStyle } from './header-bar-styles';
import LinearProgress from 'material-ui/LinearProgress';

export default function HeaderBar(props, { d2 }) {
    const { appItems, profileItems, currentUser, settings, noLoadingIndicator, showAppTitle, styles: propStyles } = props;
    const headerBarStyles = {...styles.headerBar, ...propStyles};

    // If the required props are not passed we're in a loading state.
    if (!appItems && !profileItems && !settings) {
        if (noLoadingIndicator) {
            return <div style={{display: 'none'}} />;
        }
        return (<div style={headerBarStyles}><LinearProgress mode="indeterminate" /></div>);
    }

    return (
        <div style={applyUserStyle(d2.currentUser, headerBarStyles)}>
            <InnerHeader showAppTitle={showAppTitle} />
            <SearchField />
            <HeaderMenus>
                <ProfileMenu
                    items={profileItems}
                    rowItemCount={3}
                    columnItemCount={3}
                    currentUser={currentUser}
                />
            </HeaderMenus>
        </div>
    );
}
HeaderBar.contextTypes = {
    d2: PropTypes.object,
};
HeaderBar.propTypes = {
    appItems: PropTypes.array,
    profileItems: PropTypes.array,
    currentUser: PropTypes.object,
    settings: PropTypes.object,
};
