import {AppBar, ListItem, ListItemText, SwipeableDrawer, Toolbar, Typography} from '@material-ui/core';
import React from 'react';

export default function Appbar()
{
    return (
        <Toolbar>
            <AppBar>
                <Typography variant="h6" style={{textAlign: 'center'}}>
                    La pyramide !
                </Typography>
            </AppBar>
            <SwipeableDrawer
                anchor={'left'}
                open={false}
            >
                <ListItem button>
                    <ListItemText primary={'text'}/>
                </ListItem>
            </SwipeableDrawer>
        </Toolbar>
    );
}