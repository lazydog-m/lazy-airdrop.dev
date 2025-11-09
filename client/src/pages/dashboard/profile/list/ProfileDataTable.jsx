import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import DataTable from '@/components/DataTable';
import { ButtonIcon, ButtonInfo, ButtonOrange, ButtonOutlinePrimary, ButtonPrimary } from '@/components/Button';
import { Chrome, Loader, PencilLine, Trash2 } from 'lucide-react';
import { Color, StatusCommon } from '@/enums/enum';
import Modal from '@/components/Modal';
import useSpinner from '@/hooks/useSpinner';
import { apiDelete, apiGet, apiPut } from '@/utils/axios';
import useConfirm from '@/hooks/useConfirm';
import ProfileNewEditForm from '../new-edit/ProfileNewEditForm';
import { convertEmailToEmailUsername } from '@/utils/convertUtil';
import ProfileWeb3WalletList from './profile-wallet/ProfileWeb3WalletList';
import useCopy from '@/hooks/useCopy';
import useMessage from '@/hooks/useMessage';
import { Checkbox } from '@/components/Checkbox';
import { ResourceIconCheck, RESOURCES } from '@/commons/Resources';
import { Metamask } from '@/commons/Icons';
import SwitchStyle from '@/components/Switch';

const columns = [
  { header: 'Tên Profile', align: 'left' },
  { header: 'Accounts', align: 'left' },
  { header: 'Web3 Wallets', align: 'left' },
  { header: 'Trạng Thái', align: 'left' },
  { header: '', align: 'left' },
]

const DataTableMemo = React.memo(DataTable);

export default function ProfileDataTable({
  data = [],
  onUpdateData,
  onDeleteData,
  onChangePage,
  pagination,
  onSelectAllRows,
  onSelectRow,
  selected = [],

  openningIds = new Set(),
  onAddOpenningId,
  onRemoveOpenningId,
  loadingIds = new Set(),
  onAddLoadingId,
  onRemoveLoadingId,
}) {

  const [open, setOpen] = React.useState(false);
  const [openProfileWeb3Wallet, setOpenProfileWeb3Wallet] = React.useState(false);
  const [profile, setProfile] = React.useState({});
  const { onOpen, onClose } = useSpinner();
  const { showConfirm, onCloseLoader, showLoading, swalClose } = useConfirm();
  const { copied, handleCopy } = useCopy();
  const { onSuccess, onError } = useMessage();
  const isEdit = true;

  const handleCopyText = (id, text, type) => {
    handleCopy(id, text, type);
  }

  const handleClickOpen = (item) => {
    setOpen(true);
    setProfile(item);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickOpenProfileWeb3Wallet = (item) => {
    setOpenProfileWeb3Wallet(true);
    setProfile(item);
  };

  const handleCloseProfileWeb3Wallet = () => {
    setOpenProfileWeb3Wallet(false);
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
      const response = await apiPut(`/profiles/status`, body);
      onUpdateData(() => triggerPut(response.data.data));
    } catch (error) {
      console.error(error);
      onError(error.message);
      swalClose();
    }
  }


  const handleDelete = (id, name) => {
    showConfirm(`Xác nhận xóa profile '${name}'?`, () => remove(id));
  }

  const triggerRemove = () => {
    onCloseLoader();
    onSuccess("Xóa thành công!")
  }

  const remove = async (id) => {
    try {
      const response = await apiDelete(`/profiles/${id}`);
      onDeleteData(response.data.data, triggerRemove);
    } catch (error) {
      console.error(error);
      onError(error.message);
      onCloseLoader();
    }
  }

  const handleOpenProfile = (id) => {
    openProfile(id);
  }

  const handleCloseProfile = (id) => {
    closeProfile(id);
  }

  const openProfile = async (id) => {
    try {
      onAddLoadingId(id);
      const response = await apiGet(`/profiles/${id}/open`);
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

  const rows = React.useMemo(() => {
    return data.map((row) => (
      <TableRow
        className='table-row'
        key={row?.id}
        selected={selected.includes(row?.id)}
      >
        <TableCell align="left">
          <Checkbox
            checked={selected.includes(row?.id)}
            onClick={() => onSelectRow(row?.id)}
          />
        </TableCell>
        <TableCell align="left">
          <span className='fw-500 font-inter text-too-long-auto'>
            {convertEmailToEmailUsername(row?.email)}
          </span>
        </TableCell>
        <TableCell align="left">
          <div
            className='items-center d-flex select-none'
          >
            <div className='flex gap-10'>
              {RESOURCES?.filter(res => !res?.type).map((res) => {
                return res.id;
              }).map(id => {
                return <ResourceIconCheck
                  key={id}
                  id={id}
                  check={row?.accounts?.includes(id)}
                />
              })
              }
            </div>
          </div>
        </TableCell>
        <TableCell align="left">
          <div
            className='items-center d-flex select-none'
          >
            <div className='flex gap-10'>
              {RESOURCES?.filter(res => res?.type).map((res) => {
                return res.id;
              }).map(id => {
                return <ResourceIconCheck
                  key={id}
                  id={id}
                  check={row?.web3Wallets?.includes(id)}
                />
              })
              }
            </div>
          </div>
        </TableCell>
        <TableCell align="left">
          <SwitchStyle checked={row?.status === StatusCommon.IN_ACTIVE} onClick={() => handleUpdateStatus(row?.id, row?.status)} />
        </TableCell>

        <TableCell align="left" style={{ userSelect: '-moz-none' }}>
          <div className='d-flex gap-30'>
            <div className='d-flex ms-20'>
              <ButtonIcon
                onClick={() => handleClickOpen(row)}
                variant='ghost'
                icon={<PencilLine color={Color.WARNING} />}
              />
              <ButtonIcon
                onClick={() => handleClickOpenProfileWeb3Wallet(row)}
                variant='ghost'
                icon={<Metamask />}
              />
              <ButtonIcon
                onClick={() => handleDelete(row?.id, convertEmailToEmailUsername(row?.email))}
                variant='ghost'
                icon={<Trash2 color={Color.ORANGE} />}
              />
            </div>
            {openningIds.has(row.id) ?
              <ButtonOrange
                onClick={() => handleCloseProfile(row.id)}
                style={{
                  // width: '80px',
                  opacity: loadingIds.has(row.id) ? '0.5' : '1',
                  pointerEvents: loadingIds.has(row.id) ? 'none' : '',
                  height: '34.5px',
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
      />

      <Modal
        // height={'725px'}
        width={'1400px'}
        size='xl'
        isOpen={open}
        onClose={handleClose}
        title={"Cập nhật profile"}
        content={
          <ProfileNewEditForm
            onCloseModal={handleClose}
            currentProfile={profile}
            isEdit={isEdit}
            onUpdateData={onUpdateData}
          />
        }
      />

      <Modal
        // pagination table vì modal nhỏ
        height={'715px'}
        width={'1500px'}
        size='xl'
        isOpen={openProfileWeb3Wallet}
        onClose={handleCloseProfileWeb3Wallet}
        title={`Web3 Wallets - ${convertEmailToEmailUsername(profile?.email)}`}
        content={
          <ProfileWeb3WalletList
            profileId={profile?.id}
          />
        }
      />

    </>
  );
}
