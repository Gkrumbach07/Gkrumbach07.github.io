import * as React from 'react';
import Button from '@mui/joy/Button';
import TextField from '@mui/joy/TextField';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Stack from '@mui/joy/Stack';
import Edit from '@mui/icons-material/Edit';
import Typography from '@mui/joy/Typography';
import { Database } from '../lib/database.types';
import { IconButton, VariantProp } from '@mui/joy';

export default function EditProjectModal({ project, buttonVariant="outlined"}: { project: Database["public"]["Tables"]["projects"]["Row"], buttonVariant: VariantProp}) {
    const [open, setOpen] = React.useState(false);

    return (
        <React.Fragment>
            <IconButton
                variant={buttonVariant}
                color="neutral"
                onClick={() => setOpen(true)}
                size="sm"
            >
                <Edit />
            </IconButton>
            <Modal open={open} onClose={() => setOpen(false)}>
                <ModalDialog
                    aria-labelledby="basic-modal-dialog-title"
                    aria-describedby="basic-modal-dialog-description"
                    sx={{
                        maxWidth: 500,
                        borderRadius: 'md',
                        p: 3,
                        boxShadow: 'lg',
                    }}
                >
                    <Typography
                        id="basic-modal-dialog-title"
                        component="h2"
                        level="inherit"
                        fontSize="1.25em"
                        mb="0.25em"
                    >
                        {project.title}
                    </Typography>
                    <Typography
                        id="basic-modal-dialog-description"
                        mt={0.5}
                        mb={2}
                        textColor="text.tertiary"
                    >
                        Fill in the information of the project.
                    </Typography>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            setOpen(false);
                        }}
                    >
                        <Stack spacing={2}>
                            <TextField label="Name" autoFocus required />
                            <TextField label="Description" required />
                            <Button type="submit">Submit</Button>
                        </Stack>
                    </form>
                </ModalDialog>
            </Modal>
        </React.Fragment>
    );
}