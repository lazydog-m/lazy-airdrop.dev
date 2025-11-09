import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import DataTable from '@/components/DataTable';
import { ButtonIcon, ButtonOutline, ButtonPrimary, ButtonOutlinePrimary, ButtonOutlineInfo, ButtonOrange, ButtonInfo, ButtonOutlineOrange, ButtonGhost } from '@/components/Button';
import { AiOutlineFileDone } from "react-icons/ai";
import { convertEmailToEmailUsername, darkenColor, lightenColor } from '@/utils/convertUtil';
import { CalendarCheck, CheckCheck, Chrome, CircleCheckBig, CirclePlay, ClipboardCheck, Loader, LogIn, LogOut, Play, UserRoundCheck, } from 'lucide-react';
import { Color, StatusCommon } from '@/enums/enum';
import Modal from '@/components/Modal';
import useSpinner from '@/hooks/useSpinner';
import { apiDelete, apiGet, apiPost, apiPut } from '@/utils/axios';
import useConfirm from '@/hooks/useConfirm';
// import Web3WalletNewEditForm from '../new-edit/Web3WalletNewEditForm';
import SwitchStyle from '@/components/Switch';
import useMessage from '@/hooks/useMessage';
import useCopy from '@/hooks/useCopy';
import CopyButton from '@/components/CopyButton';
import { Checkbox } from '@/components/Checkbox';
import { ResourceIconCheck } from '@/commons/Resources';
import { BadgePrimary, BadgePrimaryOutline } from '@/components/Badge';
import { Badge } from '@/components/ui/badge';

const DataTableMemo = React.memo(DataTable);

export default function TaskProfileDataTable({
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
  taskId,
  taskUrl,

  onSelectAllData,
  onClearAllData,

  openningIds = new Set(),
  onAddOpenningId,
  onRemoveOpenningId,
  loadingIds = new Set(),
  onAddLoadingId,
  onRemoveLoadingId,
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

  const handleComplete = (id, profile_email) => {
    // const profileName = convertEmailToEmailUsername(profile_email);
    const body = {
      project_profile_id: id,
      task_id: taskId,
      // profile_name: profileName,
    };
    completeTask(body);
  }

  const triggerPost = () => {
    onSuccess(`Tham gia dự án thành công!`);
    swalClose();
  }

  const completeTask = async (body) => {
    try {
      showLoading();
      const response = await apiPost(`/task-profiles`, body);
      onUpdateData(response.data.data, triggerPost);
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

  const handleOpenProfile = (id) => {
    openProfile(id);
  }

  const handleCloseProfile = (id) => {
    closeProfile(id);
  }

  const openProfile = async (id) => {
    const params = {
      url: taskUrl || '',
    }

    try {
      onAddLoadingId(id);
      const response = await apiGet(`/profiles/${id}/open`, params);
      const profileId = response.data.data;
      onAddOpenningId(profileId);
      onRemoveLoadingId(profileId);
    } catch (error) {
      console.error(error);
      onError(error.message);
      onRemoveLoadingId(id);
    }
  }

  const closeProfile = async (id) => {
    try {
      onAddLoadingId(id);
      const response = await apiGet(`/profiles/${id}/close`);
      const profileId = response.data.data;
      onRemoveOpenningId(profileId);
      onRemoveLoadingId(profileId);
    } catch (error) {
      console.error(error);
      onError(error.message);
      onRemoveLoadingId(id);
    }
  }

  const columns = [
    { header: 'Tên Profile', align: 'left' },
    { header: 'Total Points', align: 'left' },
    // { header: 'Tài Nguyên Yêu Cầu', align: 'left' },
    // { header: 'Log', align: 'left' },
    // !pagination?.isTabFree && { header: 'Trạng Thái', align: 'left' },
    { header: '', align: 'left' },
  ].filter(Boolean)

  const rows = React.useMemo(() => {
    return data.map((row) => (
      <TableRow
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
        <TableCell align="left">
          <BadgePrimaryOutline>
            {`${row?.total_points || '0'}`}
          </BadgePrimaryOutline>
        </TableCell>
        <TableCell align="left">
          <div className='d-flex gap-30'>
            <ButtonIcon
              style={{
                height: 35,
              }}
              onClick={() => handleComplete(row?.id, row?.email)}
              variant='ghost'
              icon={<AiOutlineFileDone className='!size-4.5' color={Color.SUCCESS} />}
            />
            {openningIds.has(row.id) ?
              <ButtonOrange
                onClick={() => handleCloseProfile(row.id)}
                style={{
                  // width: '80px',
                  opacity: loadingIds.has(row.id) ? '0.5' : '1',
                  pointerEvents: loadingIds.has(row.id) ? 'none' : '',
                  height: '35px',
                }}
                icon={loadingIds.has(row.id) ? <Loader className="animate-spin" /> : <Chrome />}
                title='Close'
              />
              :
              <ButtonInfo
                onClick={() => handleOpenProfile(row.id)}
                style={{
                  // width: '60px',
                  opacity: loadingIds.has(row.id) ? '0.5' : '1',
                  pointerEvents: loadingIds.has(row.id) ? 'none' : '',
                  height: '35px',
                }}
                icon={loadingIds.has(row.id) ? <Loader className="animate-spin" /> : <Chrome />}
                title='Open'
              />
            }
          </div>
        </TableCell>
      </TableRow >
    ))
  }, [data, copied, selected, loadingIds, openningIds]);

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
