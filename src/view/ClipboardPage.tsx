import React, { useState } from "react";
import i18n from 'i18n';
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";

import CreateClipboardItemButton from "component/CreateClipboardItemButton";
import EditClipboard from "component/EditClipboard";
import { Alert, AlertSnackbar } from "component/Alert";
import { PaginatorWithCombo } from "component/Paginator";
import V1Api, { ClipItem, ListClipItems } from "http/V1Api";

import {
    AlertColor,
    IconButton,
    LinearProgress,
    ListItemAvatar,
    List,
    ListItemButton,
    ListItem,
    ListItemText,
    Avatar,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
} from "@mui/material";

import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import clipboard from 'clipboardy';
import { copyImageToClipboard } from 'copy-image-clipboard';
import { SmartText } from "component/SmartText";
import { convertDateToLocal } from "util/Utils";

type ClipItemBoxProp = {
    clipId: string;
    item: ClipItem;
    reloadList: CallableFunction;
    deleteAfterConfirmation: boolean;
};

function ClipItemBox({ clipId, item, reloadList, deleteAfterConfirmation }: ClipItemBoxProp) {
    const { t } = i18n;
    const [open, setOpen] = useState(false);
    const [openDetail, setOpenDetail] = React.useState(false);
    const [stringContent, setStringContent] = useState<string | undefined>();
    const [severity, setSeverity] = useState<AlertColor>("error");
    const [alertText, setAlertText] = useState("");

    const isImage = item.mimeType.match(/image\/.*/) !== null;
    const isText = item.mimeType.match(/text\/.*/) !== null;

    const deleteItemMutation = useMutation(
        V1Api.getInstance().deleteClipboardItem(clipId, item.id),
        {
            onSuccess: () => reloadList(),
            onError: (error) => {
                deleteItemMutation.reset();
                setSeverity("error");
                setAlertText(t("failed to delete item") + JSON.stringify(error));
                setOpen(true);
            },
        }
    );

    const notifyCopySuccess = () => {
        setSeverity("info");
        setAlertText(t("copied to clipboard") + item.preview);
        setOpen(true);
    }

    const getStringContentMutation = useMutation(
        V1Api.getInstance().getClipboardItemStringContent(clipId, item.id),
        {
            onSuccess: (data) => {
                setStringContent(data)
            },
            onError: () => {
                setSeverity("error");
                setAlertText(t("failed to fetch items"));
                setOpen(true);
                getStringContentMutation.reset();
            }
        }
    );

    const copyToClipboard = () => {
        if (isImage) {
            const contentUrl = V1Api.getInstance().getUri(`/api/clipboard/${clipId}/item/${item.id}/content/`);
            console.log("Copy image to clipboard:" + contentUrl)
            copyImageToClipboard(contentUrl).then(notifyCopySuccess).catch((e) => {
                console.error('Error while copy image to clipboard:', e)
            })
        } else if (isText) {
            getStringContentMutation.mutateAsync().then(
                (data) => {
                    clipboard.write(data).then(notifyCopySuccess)
                }
            )
        } else {
            throw Error(`Can't handle item ${JSON.stringify(item)}`)
        }
    }

    return <ListItem
        secondaryAction={
            <IconButton edge="end" aria-label="delete" onClick={() => {
                if (!deleteAfterConfirmation || window.confirm(`${t("delete item")} ${item.preview}`)) {
                    deleteItemMutation.mutate()
                }
            }}>
                <DeleteIcon color="error" />
            </IconButton>
        }
        key={item.id}
    >
        <ListItemAvatar >
            <ListItemButton onClick={copyToClipboard}>
                <ContentCopyIcon color="success" />
            </ListItemButton>
        </ListItemAvatar>

        {isImage ? (<ListItemAvatar >
            <Link to={V1Api.getInstance().getUri(`/api/clipboard/${clipId}/item/${item.id}/content/`)} download={`${item.id}`} target="_blank">
                <ListItemButton>
                    <DownloadIcon color="info" />
                </ListItemButton>
            </Link>
        </ListItemAvatar>) : undefined}

        {isImage ? (<ListItemAvatar >
            <ListItemButton onClick={copyToClipboard}>
                <Avatar src={V1Api.getInstance().getUri(`/api/clipboard/${clipId}/item/${item.id}/preview/`)} variant="rounded" />
            </ListItemButton>
        </ListItemAvatar>) : undefined}

        <ListItemButton onClick={() => {
            if (isText && stringContent === undefined) {
                getStringContentMutation.mutateAsync().then(() => setOpenDetail(true))
            } else {
                setOpenDetail(true)
            }

        }} >
            <ListItemText
                primary={item.preview}
                secondary={`${t("created at")} ${convertDateToLocal(item.created)}`}
            />
        </ListItemButton>

        <AlertSnackbar
            open={open}
            setOpen={setOpen}
            severity={severity}
        >
            {alertText}
        </AlertSnackbar>

        <Dialog
            onClose={() => setOpenDetail(false)}
            aria-labelledby="customized-dialog-title"
            open={openDetail}
            fullWidth={true}
            maxWidth="lg"
        >
            <DialogTitle>
                {t("content details")}
            </DialogTitle>
            <DialogContent dividers>
                {
                    isImage ? <img style={{ "width": "100%" }} src={
                        V1Api.getInstance().getUri(`/api/clipboard/${clipId}/item/${item.id}/content/`)
                    } alt="detail" /> : (
                        stringContent === undefined ? <LinearProgress /> : <SmartText content={stringContent} />
                    )
                }
            </DialogContent>
        </Dialog>

    </ListItem>
}

type ClipItemsListProps = {
    clipId: string;
    deleteAfterConfirmation: boolean;
    cacheId: number;
    reloadList: CallableFunction;
};

function ClipItemsList({ clipId, deleteAfterConfirmation, cacheId, reloadList }: ClipItemsListProps) {
    const { t } = i18n;
    const [pageId, setPageId] = useState(1);
    const pageSize = 50;
    const { isError, data, error } = useQuery<ListClipItems>(
        [clipId, pageId, pageSize, cacheId],
        V1Api.getInstance().getClipboardItems(clipId, pageId, pageSize),
        {
            keepPreviousData: true
        }
    );
    if (isError) {
        console.error(`Error while fetching clip items: ${error}`);
        return <Alert severity={"error"} sx={{ width: '100%' }} >{t("failed to fetch items")}</Alert>;
    }
    if (data === undefined) {
        return <LinearProgress />;
    }
    const pageCount = Math.max(data.totalPages, 1);
    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <List>
                    {data.content.map((item) => (
                        <ClipItemBox
                            clipId={clipId}
                            item={item}
                            reloadList={reloadList}
                            deleteAfterConfirmation={deleteAfterConfirmation}
                            key={`${clipId}/${item.id}`}
                        />
                    ))}
                </List>
            </Grid>
            <Grid item xs={12}>
                <PaginatorWithCombo pageId={pageId} setPageId={setPageId} pageCount={pageCount}></PaginatorWithCombo>
            </Grid>
        </Grid>
    );
}

export default function ClipboardPage() {
    const { clipId } = useParams<{ clipId: string }>();
    const [cacheId, setCacheId] = useState(1);
    const disableCache = () => { setCacheId(cacheId + 1) };
    const [deleteAfterConfirmation, setDeleteAfterConfirmation] = useState(true);
    const [createByShortcut, _setCreateByShortcut] = useState(true);
    const createByShortcutRef = React.useRef(createByShortcut);
    const setCreateByShortcut = (value: boolean) => {
        createByShortcutRef.current = value;
        _setCreateByShortcut(value);
    }
    if (clipId === undefined) {
        return <Alert severity={"error"} sx={{ width: '100%' }} />;
    }
    return <Grid container spacing={2}>
        <Helmet><title>Synclip</title></Helmet>
        <Grid item xs={12}>
            <EditClipboard
                clipId={clipId}
                setCreateByShortcut={setCreateByShortcut}
                setDeleteAfterConfirmation={setDeleteAfterConfirmation}
            />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
            <CreateClipboardItemButton
                key="create-clipboard-item"
                clipId={clipId}
                reloadList={disableCache}
                createByShortcutRef={createByShortcutRef}
            />

        </Grid>
        <Grid item xs={12}>
            <ClipItemsList
                clipId={clipId}
                deleteAfterConfirmation={deleteAfterConfirmation}
                cacheId={cacheId}
                reloadList={disableCache}
            />
        </Grid>
    </Grid>
}