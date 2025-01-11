import { Dialog, DialogTitle, DialogContent, DialogActions, Box, IconButton, styled } from '@mui/material';
import closeIcon from '../assets/alert_close.svg';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: 'rgba(47, 29, 86, 0.95)',
    borderRadius: 4,
    padding: 25,
  },
  [theme.breakpoints.down('sm')]: {
    '& .MuiDialog-paper': {
      padding: 12,
    }
  }
}));

const DialogHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 15,
  [theme.breakpoints.down('sm')]: {
    marginBottom: 10,
  }
}));

const Title = styled(DialogTitle)(({ theme }) => ({
  padding: 0,
  fontSize: 20,
  fontWeight: 900,
  lineHeight: '140%',
  color: '#FFFFFF',
  [theme.breakpoints.down('sm')]: {
    fontSize: 16,
  }
}));

const CloseButton = styled(IconButton)({
  padding: 0,
  '& img': {
    width: 24,
    height: 24,
  }
});

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: 0,
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: 400,
  lineHeight: '140%',
  [theme.breakpoints.down('sm')]: {
    fontSize: 12,
  }
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: 0,
  marginTop: 15,
  gap: 10,
  justifyContent: 'flex-end',
  [theme.breakpoints.down('sm')]: {
    marginTop: 10,
  }
}));

const ActionButton = styled('button')<{ variant?: 'primary' | 'secondary' }>(({ theme, variant = 'primary' }) => ({
  height: 40,
  padding: '0 24px',
  borderRadius: 4,
  border: 'none',
  backgroundColor: variant === 'primary' ? '#C7FF8C' : '#C9ACFF',
  color: '#000000',
  fontSize: 16,
  fontWeight: 700,
  lineHeight: '24px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: variant === 'primary' ? '#B7EF7C' : '#B99CEF',
  },
  '&:disabled': {
    backgroundColor: variant === 'primary' ? '#C7FF8C' : '#C9ACFF',
    color: '#636071',
    cursor: 'not-allowed',
  },
  [theme.breakpoints.down('sm')]: {
    height: 32,
    fontSize: 14,
  } 
}));

interface CommonDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function CommonDialog({ 
  open, 
  onClose, 
  title, 
  children, 
  actions,
  maxWidth = 'xs'
}: CommonDialogProps) {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
    >
      <DialogHeader>
        <Title>{title}</Title>
        <CloseButton onClick={onClose}>
          <img src={closeIcon} alt="close" />
        </CloseButton>
      </DialogHeader>
      <StyledDialogContent>
        {children}
      </StyledDialogContent>
      {actions && (
        <StyledDialogActions>
          {actions}
        </StyledDialogActions>
      )}
    </StyledDialog>
  );
}

// 导出按钮组件以供外部使用
export { ActionButton }; 