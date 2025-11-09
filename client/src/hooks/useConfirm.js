import { Color } from '@/enums/enum';
import { delayApi } from '@/utils/commonUtil';
import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2'

const useConfirm = () => {

  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  }

  const handleClose = () => {
    setIsOpen(false);
  }

  const resolverRef = useRef(null);

  useEffect(() => {
    if (!isOpen && resolverRef.current) {
      resolverRef.current();
      resolverRef.current = null;
    }
  }, [isOpen]);

  // ✅ Fix loader khi navigate
  // useEffect(() => {
  //   return () => {
  //     if (Swal.isVisible()) Swal.close();
  //     if (resolverRef.current) {
  //       resolverRef.current();
  //       resolverRef.current = null;
  //     }
  //   };
  // }, []);

  const showConfirm = (title = '', api, text = '', onOk) => {

    Swal.fire({
      title: title || "Confirm?",
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: Color.PRIMARY,
      focusCancel: false,
      focusConfirm: false,
      cancelButtonColor: Color.ORANGE,
      confirmButtonText: "Đồng ý",
      // width: 'auto',
      cancelButtonText: "Hủy bỏ",
      reverseButtons: true, // This property swaps the button positions
      customClass: {
        container: 'my-swal',
      },
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      allowEscapeKey: () => !Swal.isLoading(),   // Prevent dismissing by pressing Escape
      preConfirm: () => {
        handleOpen(); // chỉ để cho useEffect update isOpen
        api?.();
        return new Promise((resolve) => {
          resolverRef.current = resolve;
        });
      },
    }).then((result) => {
      if (result.isConfirmed) {

        // if (onOk) {
        //   setTimeout(() => {
        //     onOk?.();
        //   }, 150)
        // }
      } else {
        // onCancel?.();
      }
    });
  };

  const showLoading = (title = 'Đang xử lý ...') => {
    Swal.fire({
      customClass: {
        container: 'my-swal',
      },
      title,
      allowOutsideClick: false, // Prevent dismissing by clicking outside
      allowEscapeKey: false,   // Prevent dismissing by pressing Escape
      didOpen: () => {
        Swal.showLoading()
      },
    });
  }

  const swalClose = () => {
    Swal.close();
  }

  const showSaved = (title = 'Đã lưu!') => {
    Swal.fire({
      title: title,
      icon: "success",
      confirmButtonColor: Color.PRIMARY,
      focusConfirm: false,
      // width: 'auto',
      // showConfirmButton: false,
      confirmButtonText: "Xong!",
      // timer: 5000,
      customClass: {
        container: 'my-swal'
      },
    })
  };

  const showConfirmCancel = (title, text, onConfirm) => {

    Swal.fire({
      title: title || "Xác nhận?",
      text: text || "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      focusCancel: false,
      focusConfirm: false,
      cancelButtonColor: "#d33",
      confirmButtonText: "Đồng ý!",
      cancelButtonText: "Hủy bỏ",
      customClass: {
        container: 'my-swal'
      },

    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm();
      }
    });
  };

  return {
    showConfirm,
    isLoader: isOpen,
    onOpenLoader: handleOpen,
    onCloseLoader: handleClose,
    showConfirmCancel,
    showSaved,
    showLoading,
    swalClose,
  };
}
export default useConfirm;
