import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Checkbox } from './Checkbox';
import TablePagination from './TablePagination';
import Popover from './Popover';
import { DropdownMenu } from './DropdownMenu';
import { Check, ChevronsUpDown, GripVertical } from 'lucide-react';
import EmptyData from './EmptyData';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import useSpinner from '@/hooks/useSpinner';
import { ButtonIcon } from './Button';
import logo from '../assets/img/playwright.png'

export default function DataTable({
  columns = [],

  data = [],
  pagination = {},
  selected = [],

  isCheckedAll,
  isIndeterminate,

  onChangePage = () => { },
  onSelectAllRows = () => { },

  onSelectAllData = () => { },
  onClearAllData = () => { },

  selectedObjText = '',
  selectAll = false,
  ...other
}) {

  const { isLoading } = useSpinner();

  return (
    <div {...other}>
      <TableContainer
        component={Paper}
        className='custom-table'
      >
        <Table
          stickyHeader
          className='table-default'
        >
          <TableHead>
            <TableRow>
              <TableCell
                key='checkbox-all'
                align='left'
              >
                {selectAll ?
                  <ContextMenuRight
                    onSelectAllData={onSelectAllData}
                    onClearAllData={onClearAllData}
                    trigger={
                      <Checkbox
                        defaultChecked={false}
                        checked={isCheckedAll}
                        onChange={(checked) => onSelectAllRows(checked)}
                        indeterminate={isIndeterminate}
                      />
                    }
                  /> :
                  <Checkbox
                    defaultChecked={false}
                    checked={isCheckedAll}
                    onChange={(checked) => onSelectAllRows(checked)}
                    indeterminate={isIndeterminate}
                  />
                }

              </TableCell>
              {columns?.map((item) => {
                return (
                  <TableCell
                    // width={item.width}
                    key={item.header}
                    align={item.align}
                  >
                    {item.selected ?
                      <Popover
                        mt='mt-7'
                        trigger={
                          <span className='pointer d-flex align-items-center gap-6 fw-bold font-inter text-capitalize table-header-action'>
                            {item.header}
                            <ChevronsUpDown size={'17px'} />
                          </span>
                        }
                        content={
                          <DropdownMenu
                            minW={item.minW}
                            items={item?.options?.map((option, index) => {
                              return {
                                active: option.name === item.selected,
                                onClick: () => item.onChange(option.name),
                                title: <span
                                  key={index}
                                  className='fw-400 fs-13 d-flex gap-25'
                                >
                                  <span className='d-flex gap-10'>
                                    {option.icon}
                                    {option.name}
                                  </span>
                                  <span>
                                    {option.name === item.selected && <Check size={'16px'} color='#a1a1a1' />}
                                  </span>
                                </span>
                              }
                            })}
                          />
                        }
                      />
                      :
                      <span className='fw-bold font-inter text-capitalize'>
                        {item.header}
                      </span>
                    }
                  </TableCell>
                )
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {
              data?.length > 0 ? data :
                <TableRow>
                  <TableCell colSpan={columns?.length + 1}>
                    <EmptyData />
                  </TableCell>
                </TableRow>
            }
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        pagination={pagination}
        onChangePage={onChangePage}
        selected={selected}
        selectedObjText={selectedObjText}
      />
    </div >
  );
}

const ContextMenuRight = ({ trigger, onSelectAllData, onClearAllData }) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{trigger}</ContextMenuTrigger>
      <ContextMenuContent
        className='border-1 bg-color bdr !z-[9999] p-3'
      >
        <ContextMenuItem
          className='dropdown-menu-item pointer'
          onClick={onSelectAllData}
        >
          Select All Data
        </ContextMenuItem>
        <ContextMenuItem
          className='dropdown-menu-item pointer'
          onClick={onClearAllData}
        >
          Clear All Data
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

const SkeletonRow = ({ columns }) => {
  return (
    <TableRow>
      <TableCell>
        <Checkbox
          defaultChecked={false}
          checked={false}
        // style={{ opacity: 0.7 }}
        />
      </TableCell>

      {columns.map((col, i) => {
        if (col !== '') {
          return (
            <TableCell key={i}>
              <div className="rounded-md skeleton-block h-9 w-30"></div>
            </TableCell>
          );
        }
        return <ButtonIcon icon={<GripVertical />} />; // Return null if col is not empty to avoid React warning
      })}
    </TableRow>
  );
};

