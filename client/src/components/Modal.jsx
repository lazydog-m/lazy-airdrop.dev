import * as React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grow from '@mui/material/Grow';
import { X } from 'lucide-react';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Grow timeout={5000} ref={ref} {...props} />;
});

const TransitionFade = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

Modal.propTypes = {
  // isOpen: PropTypes.bool,
  // title: PropTypes.node,
  // onFinish: PropTypes.func,
  // onClose: PropTypes.func,
  // children: PropTypes.node,
  // footerClose: PropTypes.bool,
}

export default function Modal({
  isOpen,
  onClose,
  transition = 'default',
  divider = false,
  hideBackdrop = false,
  esc = false,
  size = 'md',
  title,
  content,
  width,
  minWidth,
  minHeight,
  height,
  zIndex = 1300,
  scroll = 'body',
  ...other
}) {

  return (
    <Dialog
      {...other}
      scroll={scroll}
      disableEnforceFocus
      hideBackdrop={hideBackdrop}         // 👈 tắt nền mờ
      disableEscapeKeyDown={esc} // (tùy chọn) không tự đóng khi bấm Esc
      sx={{
        pointerEvents: hideBackdrop && 'none', // container không nhận click
        zIndex,
      }}
      // {...other}
      open={isOpen}
      onClose={onClose}
      TransitionComponent={transition === 'default' ? Transition : TransitionFade}
      maxWidth={size}
      BackdropProps={{
        // style: {
        //   backgroundColor: !backdrop ? 'rgba(0, 0, 0, 0)' : '',
        // },
      }}
      PaperProps={{
        style: {
          borderRadius: 0,
          border: '1px solid #404040',
          backgroundColor: '#202020',
          boxShadow: 'none',
        }
      }}
    >
      <DialogTitle
        className='d-flex justify-content-between align-items-center color-white font-inter'
        sx={{
          letterSpacing: '0.05em',
          fontSize: 18,
          pointerEvents: hideBackdrop && 'auto', // nhận click
          height: 65
        }}
      >
        <span className='fw-500 flex'>
          {title}
        </span>
        <X className='x-modal' onClick={onClose} size={'22px'} />
      </DialogTitle>
      {divider && <div style={{ borderBottom: '1px solid #404040' }} />}
      <DialogContent className='color-white' sx={{
        pointerEvents: hideBackdrop && 'auto', // nhận click
        width,
        minWidth,
        minHeight,
        height,
        overflowY: 'hidden',
        // overflowX: 'auto',
      }}>
        {content}
      </DialogContent>
    </Dialog>
  )

}
