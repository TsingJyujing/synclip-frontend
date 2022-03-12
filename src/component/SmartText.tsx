import React, { useState } from "react";
import { AlertColor, Grid, IconButton, List, ListItem, Typography, Link } from "@mui/material";
import i18n from "i18n";
import clipboard from "clipboardy";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { AlertSnackbar } from "component/Alert";

type SmartTextProps = {
    content: string;
};

export const SmartText = ({ content }: SmartTextProps) => {
    const { t } = i18n;
    const [open, setOpen] = useState(false);
    const [severity, setSeverity] = useState<AlertColor>("error");
    const [alertText, setAlertText] = useState("");

    const notifyCopySuccess = (value: string) => () => {
        setSeverity("info");
        setAlertText(t("copied to clipboard") + value);
        setOpen(true);
    }

    const urlMatches = content.match(/\bhttps?:\/\/\S+/gi);

    return <Grid container spacing={2}>
        <Grid item sm={12}>
            <Typography variant="h6">
                {t("content")}
            </Typography>
            <Typography>
                {content}
            </Typography>
        </Grid>
        {
            (urlMatches !== undefined && urlMatches !== null && urlMatches.length > 0) ? (
                <Grid item sm={12}>
                    <Typography variant="h6">
                        {t("urls")}
                    </Typography>
                    <List>
                        {
                            urlMatches.map((value) => (
                                <ListItem secondaryAction={
                                    <IconButton edge="end" aria-label="copy" onClick={() => {
                                        clipboard.write(value).then(notifyCopySuccess(value))
                                    }}>
                                        <ContentCopyIcon color="info" />
                                    </IconButton>
                                }>
                                    <Link href={value} target="_blank">
                                        {value}
                                    </Link>
                                </ListItem>
                            ))
                        }
                    </List>
                </Grid>
            ) : undefined
        }
        <AlertSnackbar
            open={open}
            setOpen={setOpen}
            severity={severity}
        >
            {alertText}
        </AlertSnackbar>
    </Grid>
}