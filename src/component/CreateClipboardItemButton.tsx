import * as React from 'react';
import { useState } from 'react';
import { useMutation } from 'react-query';
import { AlertColor, Box, TextField, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, styled } from '@mui/material';
import V1Api, { CreateItemRequest } from 'http/V1Api';
import { AlertSnackbar } from 'component/Alert';
import { PhotoCamera } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import i18n from 'i18n';

const Input = styled('input')({
    display: 'none',
});

type UploadImageButtonProps = {
    imageHandler: CallableFunction;
    caption: string;
};

function SelectImageButton({ imageHandler, caption }: UploadImageButtonProps) {
    return (
        <label htmlFor="icon-button-file">
            <Input accept="image/*" id="icon-button-file" type="file" onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const files = event.target.files;
                if (files !== undefined && files !== null && files.length > 0) {
                    imageHandler(files[0])
                }
            }} />
            <IconButton color="primary" aria-label="upload picture" component="span">
                <Button variant="contained" component="span" startIcon={<PhotoCamera />}>
                    {caption}
                </Button>
            </IconButton>
        </label>
    )
}


type CreateClipboardItemButtonProps = {
    clipId: string;
    reloadList: CallableFunction;
    createByShortcutRef: React.MutableRefObject<boolean>;
};

export default function CreateClipboardItemButton({ clipId, reloadList, createByShortcutRef }: CreateClipboardItemButtonProps) {
    const { t } = i18n;
    const [open, setOpen] = React.useState(false);
    const [openAlert, setOpenAlert] = React.useState(false);
    const [severity, setSeverity] = useState<AlertColor>("error");
    const [alertText, setAlertText] = useState("");
    const [value, setValue] = React.useState<CreateItemRequest | undefined>();
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (value !== undefined) {
            setValue({ ...value, content: event.target.value });
        } else {
            setValue({ mimeType: "text/plain", content: event.target.value });
        }
    };

    const imageHandler = (file: File) => {
        const fileReader = new FileReader();
        fileReader.onloadend = (e: ProgressEvent<FileReader>) => {
            const result = fileReader.result;
            if (typeof result === "string") {
                const requestValue = {
                    mimeType: file.type,
                    content: result
                };
                if (createByShortcutRef.current) {
                    createItemMutation.mutate(requestValue);
                } else {
                    setValue(requestValue)
                    setOpen(true);
                }
            } else {
                console.error(`Get unexpected result type: ${typeof result}`)
            }
        }
        fileReader.readAsDataURL(file);
    }

    const processPasteEvent = (ev: ClipboardEvent) => {
        const text = ev.clipboardData?.getData("text/plain");
        if (text !== undefined && text !== "") {
            const requestValue: CreateItemRequest = {
                content: text,
                mimeType: "text/plain",
            };
            if (!open) {
                if (createByShortcutRef.current) {
                    createItemMutation.mutate(requestValue);
                } else {
                    setValue(requestValue);
                    setOpen(true);
                }
            }
        } else {
            const items = ev.clipboardData?.items;
            if (items !== undefined) {
                for (let i = 0; i < items?.length; i++) {
                    const item = items[i];
                    if (item.type.indexOf("image") !== -1) {
                        const file = item.getAsFile();
                        if (file !== null) {
                            imageHandler(file);
                            break;
                        }
                    }
                }
            }
        }
    };

    React.useEffect(() => {
        document.addEventListener("paste", processPasteEvent)
    }, []);

    const createItemMutation = useMutation(
        V1Api.getInstance().createClipBoardItem(clipId),
        {
            onSuccess: (data) => {
                setSeverity("info");
                setAlertText(t("create item successfully") + data.preview);
                setOpenAlert(true);
                setOpen(false);
                reloadList();
                createItemMutation.reset();
            },
            onError: (error) => {
                setSeverity("error");
                setAlertText(`${t("failed to create item")} ${error}`);
                setOpenAlert(true);
                setOpen(false);
                createItemMutation.reset();
            }
        }
    );

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Button variant="contained" onClick={handleClickOpen}>
                {t("create clipboard item")}
            </Button>
            <SelectImageButton
                imageHandler={imageHandler}
                caption={t("upload image")}
            />
            <Dialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
                fullWidth
                maxWidth="lg"
            >
                <DialogTitle>
                    {t("create clipboard item")}
                </DialogTitle>
                <DialogContent dividers>
                    {
                        value === undefined || value.mimeType === "text/plain" ? (<TextField
                            id="outlined-multiline-flexible"
                            label={t("text to create")}
                            multiline
                            value={value?.content}
                            onChange={handleChange}
                            fullWidth
                        />) : (
                            <img src={value.content} style={{ "width": "100%" }} alt="from clipboard" />
                        )
                    }
                </DialogContent>
                <DialogActions>
                    <LoadingButton
                        onClick={() => {
                            if (value !== undefined && value.content.length > 0) {
                                createItemMutation.mutate(value)
                            }
                        }}
                        disabled={!(value !== undefined && value.content.length > 0)}
                        loading={createItemMutation.isLoading}
                        variant="contained"
                    >
                        {t("save")}
                    </LoadingButton>
                </DialogActions>
            </Dialog>
            <AlertSnackbar open={openAlert} setOpen={setOpenAlert} severity={severity}>{alertText}</AlertSnackbar>
        </Box>
    );
}
