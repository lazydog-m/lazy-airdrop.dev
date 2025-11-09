import * as React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grow from '@mui/material/Grow';
import { X } from 'lucide-react';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Grow timeout={5000} ref={ref} {...props} />;
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
  isOpen, onClose, size = 'md', title, content, width, height, ...other }) {

  return (
    <Dialog
      {...other}
      scroll='body'
      // {...other}
      open={isOpen}
      onClose={onClose}
      disableEnforceFocus
      TransitionComponent={Transition}
      maxWidth={size}
      BackdropProps={{
        style: {
          // backgroundColor: 'rgba(0, 0, 0, 0.6)',
        },
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
          height: 65
        }}
      >
        <span className='fw-500 flex'>
          {title}
        </span>
        <X className='x-modal' onClick={onClose} size={'22px'} />
      </DialogTitle>
      <DialogContent className='color-white' sx={{
        width,
        height,
        overflowY: 'hidden',
      }}>
        {content}
      </DialogContent>
    </Dialog>
  )

}
