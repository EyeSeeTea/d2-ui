import React from 'react';
import DrawerPanel from '../drawer-panel/DrawerPanel.component';
import { Observable } from 'rx';
import log from 'loglevel';

const CategoryOptionCombinationDraw = React.createClass({
    render() {
        //TODO Remove me, just to try positioning: 
        return (            
            <DrawerPanel embedded={true} width={'50%'}>
                <div style={{backgroundColor: 'red'}}> Hello world</div>
            </DrawerPanel>
        );
    },

});

export default CategoryOptionCombinationDraw; 