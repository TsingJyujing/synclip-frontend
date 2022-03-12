import React from "react";
import { IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Counter } from "util/Utils";
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import i18n from "i18n";
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';

export const LocalClipboardHistory = () => {
    const { t } = i18n;
    const [cacheId, setCacheId] = React.useState(0);
    return <List key={`list-v-${cacheId}`}>
        <ListItem>
            <ListItemIcon>
                <HistoryIcon />
            </ListItemIcon>
            <Typography variant="subtitle1">
                Clipboard History
            </Typography>
        </ListItem>
        {
            Array.from(Counter(window.localStorage.length)).map(i => window.localStorage.key(i)).map(k => {
                if (k !== null) {
                    const v = window.localStorage.getItem(k);
                    return (
                        <ListItem
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => {
                                    if (window.confirm(t("do you want to remove this item from history list?"))) {
                                        window.localStorage.removeItem(k);
                                        setCacheId(cacheId + 1);
                                    }
                                }}>
                                    <DeleteIcon color="error" />
                                </IconButton>
                            }
                        >
                            <ListItemButton
                                component="a"
                                href={`/clipboard/${k}`}
                            >
                                <ListItemText
                                    primary={v || t("No Name")}
                                    secondary={k}
                                />
                            </ListItemButton>
                        </ListItem>

                    );
                } else {
                    return undefined;
                }
            })
        }
        <ListItemButton onClick={() => {
            if (window.confirm(t("clear all history?"))) {
                window.localStorage.clear();
                setCacheId(cacheId + 1);
            }
        }}>
            <ListItemIcon><DeleteSweepIcon color="error"></DeleteSweepIcon></ListItemIcon>
            {t("clear history")}
        </ListItemButton>
    </List>
}