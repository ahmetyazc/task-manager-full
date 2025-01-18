import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
  } from '@mui/material';
  
  const ConfirmDialog = ({
    open,
    title,
    content,
    confirmLabel = 'Tamam',
    cancelLabel = 'İptal',
    onConfirm,
    onCancel
  }) => {
    return (
      <Dialog
        open={open}
        onClose={onCancel}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {content}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} color="primary">
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} color="primary" variant="contained" autoFocus>
            {confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default ConfirmDialog;