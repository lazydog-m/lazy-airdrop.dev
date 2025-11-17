import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import DataTable from '@/components/DataTable';
import { ButtonIcon, ButtonOutline, ButtonPrimary, ButtonOutlinePrimary, ButtonOutlineInfo, ButtonOrange, ButtonInfo, ButtonOutlineOrange, ButtonGhost, ButtonSuccess } from '@/components/Button';
import { AiOutlineFileDone, AiOutlineX } from "react-icons/ai";
import { convertEmailToEmailUsername, darkenColor, lightenColor } from '@/utils/convertUtil';
import { CalendarCheck, CalendarCheck2, CheckCheck, Chrome, CircleCheckBig, CirclePlay, CircleSlash2, CircleX, ClipboardCheck, ClipboardMinus, Loader, LogIn, LogOut, Play, SquareCheckBig, SquareX, UserRoundCheck, X, } from 'lucide-react';
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
import { formatNumberVN } from '@/utils/commonUtil';

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
  task,

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
      task_id: task?.id,
      // profile_name: profileName,
    };
    showConfirm(`Xác nhận đã hoàn thành task cho  '${convertEmailToEmailUsername(profile_email)}'?`, () => completeTask(body))
      ;
  }

  const triggerPost = () => {
    onSuccess(`Đã hoàn thành!`);
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
      url: task?.url || '',
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
    { header: `Trạng Thái`, align: 'left' },
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
            {`${formatNumberVN(row?.total_points) || '0'}`}
          </BadgePrimaryOutline>
        </TableCell>
        <TableCell align="left">
          <Badge className='badge-default bdr gap-1 items-center select-none'
            style={{
              backgroundColor: `${darkenColor(Color.ORANGE)}`,
              borderColor: `${lightenColor(Color.ORANGE)}`,
              color: 'white',
            }}
          >
            <span className='flex gap-6'>
              <AiOutlineX size={'14px'} className='mt-1' />
              {/* <CheckCheck size={'14.5px'} className='mt-1' /> */}
              {`Chưa hoàn thành`}
              {/* {`Đã hoàn thành`} */}
            </span>
          </Badge>
        </TableCell>
        <TableCell align="left">
          <div className='d-flex gap-30'>
            <ButtonOutline
              style={{
                height: 35,
              }}
              onClick={() => handleComplete(row?.pp_id, row?.email)}
              icon={<SquareCheckBig color={Color.SUCCESS} />}
              title='Xong'
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
