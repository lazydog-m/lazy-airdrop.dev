import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import DataTable from '@/components/DataTable';
import { ButtonIcon } from '@/components/Button';
import { PencilLine, Trash2 } from 'lucide-react';
import { Color, StatusCommon } from '@/enums/enum';
import { apiDelete, apiPut } from '@/utils/axios';
import useConfirm from '@/hooks/useConfirm';
import useMessage from '@/hooks/useMessage';
import { Checkbox } from '@/components/Checkbox';
import { Link } from 'react-router-dom';
import { PATH_DASHBOARD } from '@/routes/path';
import SwitchStyle from '@/components/Switch';
import { formatDateVN, timeAgoVN } from '@/utils/formatDate';
import { Badge } from '@/components/ui/badge';
import { textCapitalize } from '@/utils/convertUtil';

const columns = [
  { header: 'Tên Script', align: 'left' },
  { header: 'Cập Nhật Lần Cuối', align: 'left' },
  { header: 'Ngày Tạo', align: 'left' },
  { header: 'Trạng thái', align: 'left' },
  { header: '', align: 'left' },
]

const DataTableMemo = React.memo(DataTable);

export default function ScriptDataTable({
  data = [],
  onDeleteData,
  onUpdateData,
  onChangePage,
  onSelectAllRows,
  onSelectRow,
  pagination,
  selected = []
}) {
  const { showConfirm, onCloseLoader, showLoading, swalClose } = useConfirm();
  const { onSuccess, onError } = useMessage();


  const handleDelete = (fileName, name) => {
    showConfirm(
      `Xác nhận xóa script '${textCapitalize(name)}'?`
      , () => remove(fileName));
  }

  const triggerRemove = () => {
    onCloseLoader();
    onSuccess("Xóa script thành công!")
  }

  const remove = async (fileName) => {
    try {
      const response = await apiDelete(`/scripts/${fileName}`);
      onDeleteData(response.data.data, triggerRemove);
    } catch (error) {
      console.error(error);
      onError(error.message);
      onCloseLoader();
    }
  }

  const handleUpdateStatus = (id, status) => {
    const body = {
      id,
      status,
    };
    putStatus(body);
  }

  const triggerPut = (data) => {
    onSuccess(`${data === StatusCommon.IN_ACTIVE ? 'Kích hoạt' : 'Vô hiệu hóa'} thành công!`);
    swalClose();
  }

  const putStatus = async (body) => {
    try {
      showLoading();
      const response = await apiPut(`/scripts/status`, body);
      onUpdateData(() => triggerPut(response.data.data));
    } catch (error) {
      console.error(error);
      onError(error.message);
      swalClose();
    }
  }

  const rows = React.useMemo(() => {
    return data.map((row) => (
      <TableRow
        className='table-row'
        key={row.id}
        selected={selected.includes(row.id)}
      >
        <TableCell align="left">
          <Checkbox
            checked={selected.includes(row.id)}
            onClick={() => onSelectRow(row.id)}
          />
        </TableCell>
        <TableCell align="left">
          <span className='text-capitalize font-inter color-white fw-500 text-too-long-400'>
            {row?.name} {row?.project_name && `(${row?.project_name})`}
          </span>
        </TableCell>
        <TableCell align="left">
          {`${timeAgoVN(row?.updatedAt)}`}
        </TableCell>
        <TableCell align="left">
          {`${formatDateVN(row?.createdAt)}`}
        </TableCell>
        <TableCell align="left">
          <SwitchStyle checked={row?.status === StatusCommon.IN_ACTIVE} onClick={() => handleUpdateStatus(row?.id, row?.status)} />
        </TableCell>
        <TableCell align="left">
          <Link to={PATH_DASHBOARD.script.edit(row.id)}>
            <ButtonIcon
              variant='ghost'
              icon={<PencilLine color={Color.WARNING} />}
            />
          </Link>
          <ButtonIcon
            onClick={() => handleDelete(row.id, row?.name)}
            variant='ghost'
            icon={<Trash2 color={Color.ORANGE} />}
          />
        </TableCell>
      </TableRow >
    ))
  }, [data, selected]);

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

        selectedObjText={'script'}
      />
    </>
  );
}

