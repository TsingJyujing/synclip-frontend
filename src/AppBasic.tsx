// TODO update this to latest API
import React from 'react';
import { Container, Divider, List, ListItem, ListItemIcon, ListItemText, Hidden, IconButton, Drawer, Typography, Toolbar, AppBar } from "@mui/material";
import clsx from 'clsx';
import MenuIcon from '@mui/icons-material/Menu';
import GitHubIcon from '@mui/icons-material/GitHub';

import i18n from 'i18n';
import CreateClipboardButton from 'component/CreateClipboardButton';
import { makeStyles, createStyles, useTheme, Theme } from '@material-ui/core/styles';
import { LocalClipboardHistory } from 'component/LocalClipboardHistory';

const drawerWidth = 240;
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        appBar: {
            [theme.breakpoints.up('sm')]: {
                width: `100%`,
                marginLeft: drawerWidth,
            },
        },
        appBarShift: {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        title: {
            flexGrow: 1,
        },
        toolbar: theme.mixins.toolbar,
        drawer: {
            width: drawerWidth,
            flexShrink: 0,
        },
        drawerPaper: {
            width: drawerWidth,
        },
        drawerHeader: {
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            ...theme.mixins.toolbar,
            justifyContent: 'flex-end',
        },
        content: {
            flexGrow: 1,
            padding: theme.spacing(3),
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: 0,
        },
        contentShift: {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: drawerWidth,
        },
    }),
);

type Props = {
    children?: JSX.Element;
};


export default function AppBasic({ children }: Props) {
    const { t } = i18n;
    const classes = useStyles();
    const theme = useTheme();
    const container = window !== undefined ? () => window.document.body : undefined;
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const drawer = (
        <div>
            <div className={classes.toolbar} />
            <Divider />
            <List>
                <ListItem>
                    <CreateClipboardButton />
                </ListItem>
            </List>
            
            <Divider />
            <LocalClipboardHistory />

            <Divider />
            <List>
                <ListItem button
                    key="source-code"
                    component="a"
                    href="https://github.com/TsingJyujing/synclip"
                    target="_blank"
                >
                    <ListItemIcon><GitHubIcon /></ListItemIcon>
                    <ListItemText primary={t("source code")} />
                </ListItem>
            </List>
        </div>
    );

    return (
        <div className={classes.root}>
            <AppBar position="fixed" className={clsx(classes.appBar, {
                [classes.appBarShift]: drawerOpen,
            })}>
                <Toolbar>
                    <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu"
                        onClick={handleDrawerToggle}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        Synclip
                    </Typography>
                </Toolbar>
            </AppBar>
            <nav className={classes.drawer} aria-label="mailbox folders">
                <Hidden smUp implementation="css">
                    <Drawer
                        container={container}
                        variant="temporary"
                        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                        open={drawerOpen}
                        onClose={handleDrawerToggle}
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        ModalProps={{
                            keepMounted: true, // Better open performance on mobile.
                        }}
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
            </nav>
            <main className={clsx(classes.content, {
                [classes.contentShift]: drawerOpen,
            })}>
                <Container>
                    <div className={classes.drawerHeader} />
                    {children}
                </Container>
            </main>
        </div>
    );
}
