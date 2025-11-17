import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import DataTable from '@/components/DataTable';
import { ButtonIcon } from '@/components/Button';
import { convertEmailToEmailUsername } from '@/utils/convertUtil';
import { LogIn, LogOut, } from 'lucide-react';
import { Color, StatusCommon } from '@/enums/enum';
import Modal from '@/components/Modal';
import useSpinner from '@/hooks/useSpinner';
import { apiDelete, apiPost, apiPut } from '@/utils/axios';
import useConfirm from '@/hooks/useConfirm';
// import Web3WalletNewEditForm from '../new-edit/Web3WalletNewEditForm';
import SwitchStyle from '@/components/Switch';
import useMessage from '@/hooks/useMessage';
import useCopy from '@/hooks/useCopy';
import CopyButton from '@/components/CopyButton';
import { Checkbox } from '@/components/Checkbox';
import { ResourceIconCheck } from '@/commons/Resources';
import { BadgePrimary, BadgePrimaryOutline } from '@/components/Badge';
import { formatNumberVN } from '@/utils/commonUtil';

const DataTableMemo = React.memo(DataTable);

export default function ProjectProfileDataTable({
  data = [],
  pagination,
  onChangePage,

  onUpdateData,
  onDeleteData,

  onSelectAllRows,
  onSelectRow,
  selected = [],

  resources = [],
  projectId,

  onSelectAllData,
  onClearAllData,
}) {
  const [open, setOpen] = React.useState(false);
  const [wallet, setWallet] = React.useState({});
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

  const handleUpdateStatus = (id, status) => {
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
      const response = await apiPut(`/project-profiles/status`, body);
      onUpdateData(response.data.data.id, () => triggerPut(response.data.data));
    } catch (error) {
      console.error(error);
      onError(error.message);
      swalClose();
    }
  }

  const handleJoinProject = (profile_id, profile_email) => {
    // const profileName = convertEmailToEmailUsername(profile_email);
    const body = {
      project_id: projectId,
      profile_id,
      // profile_name: profileName,
    };
    joinProject(body);
  }

  const triggerPost = () => {
    onSuccess(`Tham gia dự án thành công!`);
    swalClose();
  }

  const joinProject = async (body) => {
    try {
      showLoading();
      const response = await apiPost(`/project-profiles`, body);
      onUpdateData(response.data.data?.profile_id, triggerPost);
    } catch (error) {
      console.error(error);
      onError(error.message);
      swalClose();
    }
  }

  const handleOutProject = (id) => {
    outProject(id);
  }

  const triggerRemove = () => {
    onSuccess("Rời dự án thành công!")
    swalClose();
  }

  const outProject = async (id) => {
    try {
      showLoading();
      const response = await apiDelete(`/project-profiles/${id}`);
      onDeleteData(response.data.data, triggerRemove);
    } catch (error) {
      console.error(error);
      onError(error.message);
      swalClose();
    }
  }

  const columns = [
    { header: 'Tên Profile', align: 'left' },
    !pagination?.isTabFree && { header: 'Total Points', align: 'left' },
    { header: 'Tài Nguyên Yêu Cầu', align: 'left' },
    !pagination?.isTabFree && { header: 'Trạng Thái', align: 'left' },
    { header: '', align: 'left' },
  ].filter(Boolean)

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
          <span className='font-inter d-flex color-white fw-500 items-center gap-8'>
            {convertEmailToEmailUsername(row?.email)}
          </span>
        </TableCell>
        {!pagination?.isTabFree &&
          <TableCell align="left">
            <BadgePrimaryOutline>
              {`${formatNumberVN(row?.total_points) || '0'}`}
            </BadgePrimaryOutline>
          </TableCell>
        }
        <TableCell align="left">
          <div
            className='items-center d-flex select-none gap-10'
          >
            {resources?.length > 0 && resources?.map((id) => {
              return <ResourceIconCheck
                key={id}
                id={id}
                check={row?.resources?.includes(id)}
              />
            })
            }
          </div>
        </TableCell>
        {!pagination?.isTabFree &&
          <TableCell align="left">
            <SwitchStyle checked={row?.status === StatusCommon.IN_ACTIVE} onClick={() => handleUpdateStatus(row?.id, row?.status)} />
          </TableCell>
        }
        <TableCell align="left">
          {row?.profile_id ?
            <ButtonIcon
              onClick={() => handleOutProject(row?.id)}
              variant='ghost'
              icon={<LogOut color={Color.ORANGE} />}
            />
            :
            <ButtonIcon
              onClick={() => handleJoinProject(row?.id, row?.email)}
              variant='ghost'
              icon={<LogIn color={Color.PRIMARY} />}
            />
          }
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

        selectedObjText={'profile'}
        selectAll

        onSelectAllData={onSelectAllData}
        onClearAllData={onClearAllData}
      />

      {/* <Modal */}
      {/*   width={800} */}
      {/*   size='md' */}
      {/*   isOpen={open} */}
      {/*   onClose={handleClose} */}
      {/*   title={"Cập nhật ví Web3"} */}
      {/*   content={ */}
      {/*     <Web3WalletNewEditForm */}
      {/*       onCloseModal={handleClose} */}
      {/*       currentWallet={wallet} */}
      {/*       isEdit={isEdit} */}
      {/*       onUpdateData={onUpdateData} */}
      {/*     /> */}
      {/*   } */}
      {/* /> */}
    </>
  );
}
