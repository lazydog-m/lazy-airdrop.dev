import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import DataTable from '@/components/DataTable';
import { ButtonIcon } from '@/components/Button';
import { convertWalletStatusEnumToReverse } from '@/utils/convertUtil';
import { PencilLine, Trash2, X } from 'lucide-react';
import { Color, StatusCommon } from '@/enums/enum';
import Modal from '@/components/Modal';
import useSpinner from '@/hooks/useSpinner';
import { apiDelete, apiPut } from '@/utils/axios';
import useConfirm from '@/hooks/useConfirm';
import Web3WalletNewEditForm from '../new-edit/Web3WalletNewEditForm';
import SwitchStyle from '@/components/Switch';
import useMessage from '@/hooks/useMessage';
import useCopy from '@/hooks/useCopy';
import CopyButton from '@/components/CopyButton';
import { Checkbox } from '@/components/Checkbox';
import { ResourceIcon } from '@/commons/Resources';
import { IconX } from '@/components/IconUi';

const columns = [
  { header: 'Tên Ví', align: 'left' },
  { header: 'Mật Khẩu Ví', align: 'left' },
  { header: 'Link Extension', align: 'left' },
  { header: 'Resource id', align: 'left' },
  { header: 'Trạng Thái', align: 'left' },
  { header: '', align: 'left' },
]

const DataTableMemo = React.memo(DataTable);

export default function Web3WalletDataTable({
  data = [],
  onUpdateData,
  onDeleteData,
  onChangePage,
  onSelectAllRows,
  onSelectRow,
  pagination,
  selected = []
}) {
  const [open, setOpen] = React.useState(false);
  const [wallet, setWallet] = React.useState({});
  const { onOpen, onClose } = useSpinner();
  const { showConfirm, onCloseLoader, showLoading, swalClose } = useConfirm();
  const { onSuccess, onError } = useMessage();
  const isEdit = true;

  const { copied, handleCopy } = useCopy();

  const handleCopyText = (id, text, type) => {
    handleCopy(id, text, type);
  }

  const handleClickOpen = (item) => {
    setOpen(true);
    setWallet(item);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleUpdateWalletStatus = (id, status) => {
    const body = {
      id,
      status,
    };
    putStatus(body);
  }

  const triggerPut = (data) => {
    onSuccess(`${data?.status === StatusCommon.IN_ACTIVE ? 'Kích hoạt' : 'Vô hiệu hóa'} thành công!`);
    swalClose();
  }

  const putStatus = async (body) => {
    try {
      showLoading();
      const response = await apiPut(`/web3-wallets/status`, body);
      onUpdateData(() => triggerPut(response.data.data));
    } catch (error) {
      console.error(error);
      onError(error.message);
      swalClose();
    }
  }

  const handleDelete = (id, name) => {
    showConfirm(`Xác nhận xóa ví Web3 '${name}'?`, () => remove(id));
  }

  const triggerRemove = () => {
    onCloseLoader();
    onSuccess("Xóa thành công!")
  }

  const remove = async (id) => {
    try {
      const response = await apiDelete(`/web3-wallets/${id}`);
      onDeleteData(response.data.data, triggerRemove);
    } catch (error) {
      console.error(error);
      onError(error.message);
      onCloseLoader();
    }
  }

  const rows = React.useMemo(() => {
    return data.map((row) => (
      <TableRow
        className='table-row'
        key={row.id}
        selected={selected.includes(row?.id)}
      >
        <TableCell align="left">
          <Checkbox
            checked={selected.includes(row?.id)}
            onClick={() => onSelectRow(row?.id)}
          />
        </TableCell>
        <TableCell align="left">
          <span className='font-inter flex color-white fw-500 items-center gap-8'>
            {row?.resource_id &&
              <ResourceIcon id={row?.resource_id} className='mb-0.5' />
            }
            <span className=' text-too-long-auto'>
              {`${row?.name}`}
            </span>{`(${row?.count})`}
          </span>
        </TableCell>
        <TableCell align="left">
          <CopyButton
            textTooLong
            text={row?.password}
            copied={copied?.id === row?.id && copied?.type === PASSWORD_TYPE}
            onCopy={(copied?.id !== row?.id || copied?.type !== PASSWORD_TYPE) ? () => handleCopyText(row?.id, row?.password, PASSWORD_TYPE) : () => { }}
          />
        </TableCell>
        <TableCell align="left">
          {row?.url ?
            <CopyButton
              textTooLong
              text={row?.url}
              copied={copied?.id === row?.id && copied?.type === LINK_TYPE}
              onCopy={(copied?.id !== row?.id || copied?.type !== LINK_TYPE) ? () => handleCopyText(row?.id, row?.url, LINK_TYPE) : () => { }}
            /> :
            <IconX />
          }
        </TableCell>
        <TableCell align="left">
          <span className='font-inter d-flex color-white fw-500 items-center gap-8'>
            {row?.resource_id ?
              row?.resource_id :
              <IconX />
            }
          </span>
        </TableCell>
        <TableCell align="left">
          <SwitchStyle checked={row?.status === StatusCommon.IN_ACTIVE} onClick={() => handleUpdateWalletStatus(row?.id, row?.status)} />
        </TableCell>
        <TableCell align="left">
          <ButtonIcon
            onClick={() => handleClickOpen(row)}
            variant='ghost'
            icon={<PencilLine color={Color.WARNING} />}
          />
          <ButtonIcon
            onClick={() => handleDelete(row?.id, row?.name)}
            variant='ghost'
            icon={<Trash2 color={Color.ORANGE} />}
          />
        </TableCell>
      </TableRow >
    ))
  }, [data, copied, selected]);

  return (
    <>
      <DataTableMemo
        className='mt-20'
        columns={columns}
        data={rows}
        pagination={pagination}

        selected={selected}
        isCheckedAll={data.length > 0 && data?.every(row => selected?.includes(row.id))}
        isIndeterminate={selected.length > 0 && data?.some(row => selected.includes(row.id)) && !data.every(row => selected.includes(row.id))}

        onSelectAllRows={onSelectAllRows}
        onChangePage={onChangePage}

        selectedObjText={'ví'}
      />

      <Modal
        width={800}
        size='md'
        isOpen={open}
        onClose={handleClose}
        title={"Cập nhật ví Web3"}
        content={
          <Web3WalletNewEditForm
            onCloseModal={handleClose}
            currentWallet={wallet}
            isEdit={isEdit}
            onUpdateData={onUpdateData}
          />
        }
      />
    </>
  );
}

const LINK_TYPE = 'LINK_TYPE';
const PASSWORD_TYPE = 'PASSWORD_TYPE';
