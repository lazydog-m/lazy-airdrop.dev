import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import DataTable from '@/components/DataTable';
import { ButtonIcon } from '@/components/Button';
import { convertProjectStatusEnumToColorHex, convertProjectStatusEnumToText, convertProjectTypeEnumToColorHex, darkenColor, lightenColor } from '@/utils/convertUtil';
import { RiTodoLine } from "react-icons/ri";
import { EllipsisVertical, X, PencilLine, CheckCheck, Trash2, CalendarArrowDown, CalendarArrowUp, Clock, Users, ClipboardClock, ClipboardCheck, ClipboardList, UserRoundX, UserRoundCheck, UserLock, Lock, UserRoundMinus, ShieldUser, ShieldBan, FileLock, FileLock2, UserX, UserStar, UserRoundCog, ContactRound, UserRoundPlus, Fingerprint, CirclePlay, CalendarCheck } from 'lucide-react';
import { TbClockCheck } from "react-icons/tb";
import { Badge } from '@/components/ui/badge';
import { Color, DailyTaskRefresh, DAILY_TASK_TEXT, NOT_AVAILABLE, ProjectStatus, PROJECT_STATUS_ARR } from '@/enums/enum';
import { Link } from 'react-router-dom';
import { formatDateVN } from '@/utils/formatDate';
import Modal from '@/components/Modal';
import ProjectNewEditForm from '../new-edit/ProjectNewEditForm';
import Popover from '@/components/Popover';
import { DropdownMenu } from '@/components/DropdownMenu';
import useSpinner from '@/hooks/useSpinner';
import { apiDelete, apiPost, apiPut } from '@/utils/axios';
import useConfirm from '@/hooks/useConfirm';
import useMessage from '@/hooks/useMessage';
import { Checkbox } from '@/components/Checkbox';
import DropdownUi from '@/components/DropdownUi';
import { ResourceIcon } from '@/commons/Resources';
import ProjectTaskList from './task/ProjectTaskList';
import ProjectProfileList from './profile/ProjectProfileList';
import { IconX } from '@/components/IconUi';
import { RiUserForbidLine } from "react-icons/ri";

const DataTableMemo = React.memo(DataTable);

export default function ProjectDataTable({
  data = [],
  onUpdateData,
  onDeleteData,
  onChangePage,
  pagination,
  onSelectAllRows,
  onSelectRow,
  selected = [],
  selectedSortDate,
  onChangeSelectedSortDate,
}) {

  const [open, setOpen] = React.useState(false);
  const [openTask, setOpenTask] = React.useState(false);
  const [taskType, setTaskType] = React.useState(false);
  const [openProfiles, setOpenProfiles] = React.useState(false);
  const [project, setProject] = React.useState({});
  const { onOpen, onClose } = useSpinner();
  const { showConfirm, onCloseLoader } = useConfirm();
  const { onSuccess, onError } = useMessage();

  const isEdit = true;

  const handleClickOpenTask = (item, daily = true) => {
    setOpenTask(true);
    setProject({ ...item, daily });
  };

  const handleClickOpenProfiles = (item) => {
    setOpenProfiles(true);
    setProject(item);
  };

  const handleClickOpen = (item) => {
    setOpen(true);
    setProject(item);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = (id, name) => {
    showConfirm(`Xác nhận xóa dự án '${name}'?`, () => remove(id));
  }

  const handleUpdateProjectStatus = (id, status) => {
    const body = {
      id,
      status,
    };

    if (status === ProjectStatus.END_AIRDROP) {
      showConfirm(
        `Xác nhận cập nhật trạng thái thành '${convertProjectStatusEnumToText(status)}'?`,
        () => showConfirm(`Bạn có chắc chắn muốn cập nhật trạng thái thành 'Airdrop'?`, () => putStatus(body)),
        `Lưu ý: Trạng thái sẽ không thể cập nhật trở lại khi đã chuyển sang 'Airdrop'.`)
        ;
    }
    else {
      showConfirm(
        `Xác nhận cập nhật trạng thái thành '${convertProjectStatusEnumToText(status)}'?`,
        () => putStatus(body))
        ;
    }
  }

  const putStatus = async (body) => {
    try {
      const response = await apiPut(`/projects/status`, body);
      onUpdateData(triggerPut);
    } catch (error) {
      console.error(error);
      onError(error.message);
      onCloseLoader();
    }
  }

  const triggerPut = () => {
    onCloseLoader();
    onSuccess("Cập nhật thành công!")
  }

  const triggerRemove = () => {
    onCloseLoader();
    onSuccess("Xóa thành công!")
  }

  const remove = async (id) => {
    try {
      const response = await apiDelete(`/projects/${id}`);
      onDeleteData(response.data.data, triggerRemove);
    } catch (error) {
      console.error(error);
      onError(error.message);
      onCloseLoader();
    }
  }

  const columns = React.useMemo(() => [
    { header: 'Tên Dự Án', align: 'left' },
    { header: 'Mảng', align: 'left' },
    { header: 'Trạng Thái', align: 'left' },
    {
      header: 'Thời Gian',
      align: 'left',
      minW: '200px',
      onChange: onChangeSelectedSortDate,
      selected: selectedSortDate,
      options: [
        { name: 'Ngày Làm (by Desc)', icon: <CalendarArrowDown size={'16px'} /> },
        { name: 'Ngày End (by Desc)', icon: <CalendarArrowDown size={'16px'} /> },
        { name: 'Ngày Làm (by Asc)', icon: <CalendarArrowUp size={'16px'} /> },
        { name: 'Ngày End (by Asc)', icon: <CalendarArrowUp size={'16px'} /> },
      ],
    },
    { header: 'Tài Nguyên', align: 'left' },
    {
      header: 'Profiles',
      align: 'left',
    },
    // { header: 'Cheated', align: 'left' },
    { header: DAILY_TASK_TEXT, align: 'left' },
    { header: '', align: 'left' },
  ], [onChangeSelectedSortDate, selectedSortDate]);

  const rows = React.useMemo(() => {
    return data.map((row) => (
      <TableRow
        className='table-row'
        key={row?.id}
        selected={selected.includes(row?.id)}
      >
        <TableCell align="left" >
          <Checkbox
            checked={selected.includes(row?.id)}
            onClick={() => onSelectRow(row?.id)}
          />
        </TableCell>
        <TableCell align="left">
          <Link to={row?.url || '/404'} target='_blank' rel="noopener noreferrer">
            <span className='txt-underline color-white fw-500 font-inter text-too-long-auto text-capitalize'>
              {row?.name}
            </span>
          </Link>
        </TableCell>
        <TableCell align="left">
          <div className='d-flex gap-8'>
            <Badge
              className='text-capitalize custom-badge select-none bdr'
              style={{
                backgroundColor: `${darkenColor(convertProjectTypeEnumToColorHex(row?.type))}`,
                color: 'white',
                borderColor: `${lightenColor(convertProjectTypeEnumToColorHex(row?.type))}`,
              }}
            >
              {row?.type}
            </Badge>
          </div>
        </TableCell>
        <TableCell align="left">
          <Popover
            className='button-dropdown-filter-checkbox'
            trigger={
              <Badge
                className='text-capitalize custom-badge select-none pointer bdr'
                style={{
                  backgroundColor: `${darkenColor(convertProjectStatusEnumToColorHex(row?.status))}`,
                  color: 'white',
                  borderColor: `${lightenColor(convertProjectStatusEnumToColorHex(row?.status))}`,
                }}
              >
                <span className=''>
                  {convertProjectStatusEnumToText(row?.status)}
                </span>
              </Badge>
            }
            content={
              <DropdownMenu
                minW='200px'
                items={[
                  {
                    actions: PROJECT_STATUS_ARR.map((item) => {
                      return {
                        disabled: item === row?.status || row?.status === ProjectStatus.END_AIRDROP,
                        onClick: () => handleUpdateProjectStatus(row?.id, item),
                        title:
                          <Badge
                            className='text-capitalize custom-badge select-none bdr'
                            style={{
                              backgroundColor: `${darkenColor(convertProjectStatusEnumToColorHex(item))}`,
                              color: 'white',
                              borderColor: `${lightenColor(convertProjectStatusEnumToColorHex(item))}`,
                            }}
                          >
                            <span className='fs-14 d-flex align-items-center gap-6'>
                              {item === row?.status && <CheckCheck size={'17px'} />}
                              {convertProjectStatusEnumToText(item)}
                            </span>
                          </Badge>
                      }
                    })
                  },
                ]}
              />
            }
          />
        </TableCell>
        <TableCell align="left">
          <Badge className='badge-default bdr'>
            {`${formatDateVN(row?.createdAt)} - ${!row?.end_date ? NOT_AVAILABLE : formatDateVN(row?.end_date)}`}
          </Badge>
        </TableCell>
        <TableCell align="left">
          <div
            className='items-center d-flex select-none gap-6'
          >
            {row?.resources?.length > 0 ? row?.resources?.map((id) => {
              return <ResourceIcon id={id} key={id} />
            })
              :
              <IconX />
            }
          </div>
        </TableCell>
        {/*
        <TableCell align="left">
          {row?.is_cheat ?
            <FingerprintProgress percent={100} />
            :
            <X color={Color.DANGER} className='select-none' />
          }
        </TableCell>
        */}
        <TableCell align="left">
          <div className='d-flex gap-8'>
            <Badge className='badge-default bdr gap-1 items-center'
              style={{
                backgroundColor: `${darkenColor(Color.PRIMARY)}`,
                borderColor: `${lightenColor(Color.PRIMARY)}`,
                color: 'white',
              }}
            >
              <span className='flex gap-1'>
                <UserRoundCheck size={'14.5px'} className='mt-1' />
                60
              </span>
            </Badge>
            <Badge className='badge-default bdr gap-1 items-center'
              style={{
                backgroundColor: `${darkenColor(Color.WARNING)}`,
                borderColor: `${lightenColor(Color.WARNING)}`,
                color: 'white',
              }}
            >
              <span className='flex gap-1'>
                <UserRoundMinus size={'14.5px'} className='mt-1' />
                60
              </span>
            </Badge>
            <Badge className='badge-default bdr gap-1 items-center'
              style={{
                backgroundColor: `${darkenColor(Color.SECONDARY)}`,
                borderColor: `${lightenColor(Color.SECONDARY)}`,
                color: 'white',
              }}
            >
              <span className='flex gap-1'>
                <UserRoundPlus size={'14.5px'} className='mt-1' />
                60
              </span>
            </Badge>
          </div>
        </TableCell>
        <TableCell align="left">
          <div className='d-flex gap-8'>
            {row?.daily_tasks_refresh === DailyTaskRefresh.COUNT_DOWN_TIME_IT_UP &&
              <Badge className='custom-badge bdr select-none'
                style={{
                  backgroundColor: `${darkenColor(Color.WARNING)}`,
                  borderColor: `${lightenColor(Color.WARNING)}`,
                  color: 'white',
                }}
              >
                <span className='flex gap-1'>
                  <ClipboardClock size={'14px'} className='mt-1' />
                  1'
                </span>
              </Badge>
            }
            <Badge className='badge-default bdr select-none pointer'
              onClick={() => handleClickOpenTask(row)}
              style={{
                backgroundColor: `${darkenColor(getColorDailyTaskRefresh(row?.daily_tasks_refresh))}`,
                borderColor: `${lightenColor(getColorDailyTaskRefresh(row?.daily_tasks_refresh))}`,
                color: 'white',
              }}
            >
              <span className='flex gap-1'>
                <ClipboardList size={'14px'} className='mt-1' />
                Todo (0)
              </span>
            </Badge>
            {!row?.totalTasks &&
              <Badge className='text-capitalize custom-badge bdr select-none d-flex gap-1'
                style={{
                  backgroundColor: `${darkenColor(getColorDailyTask(row?.daily_tasks_completed))}`,
                  borderColor: `${lightenColor(getColorDailyTask(row?.daily_tasks_completed))}`,
                  color: 'white',
                }}
              >
                <span className='text-capitalize flex gap-1'>
                  <ClipboardCheck size={'14px'} className='mt-1' />
                  3/5
                </span>
              </Badge>
            }
            {row?.daily_tasks?.trim() === '' &&
              <X color={Color.DANGER} />
            }
            {/* {row?.daily_tasks?.trim() !== '' && row?.daily_tasks_refresh === DailyTaskRefresh.UTC0 && row?.status === ProjectStatus.DOING && */}
            {/*   <Badge className='custom-badge bdr select-none' */}
            {/*     style={{ */}
            {/*       backgroundColor: `${darkenColor(Color.PRIMARY)}`, */}
            {/*       borderColor: `${lightenColor(Color.PRIMARY)}`, */}
            {/*       color: 'white', */}
            {/*     }} */}
            {/*   > */}
            {/*     <TaskTimeCountDownUTC0 */}
            {/*       completed={row?.daily_tasks_completed} */}
            {/*       lastCompletedAt={row?.last_completed_at} */}
            {/*       onUpdateData={onUpdateData} */}
            {/*       row={row} */}
            {/*     /> */}
            {/*   </Badge> */}
            {/* } */}
            {/* {row?.daily_tasks?.trim() !== '' && row?.daily_tasks_refresh === DailyTaskRefresh.COUNT_DOWN_TIME_IT_UP && row?.status === ProjectStatus.DOING && */}
            {/*   <Badge className='text-capitalize custom-badge bdr select-none' */}
            {/*     style={{ */}
            {/*       backgroundColor: `${darkenColor(Color.WARNING)}`, */}
            {/*       borderColor: `${lightenColor(Color.WARNING)}`, */}
            {/*       color: 'white', */}
            {/*     }} */}
            {/*   > */}
            {/*     <TaskTimeCountDownTime */}
            {/*       lastCompletedAt={row?.last_completed_at} */}
            {/*       completed={row?.daily_tasks_completed} */}
            {/*     /> */}
            {/*   </Badge> */}
            {/* } */}
          </div>
        </TableCell>
        <TableCell align="left">
          <div className='d-flex select-none'>
            <ButtonIcon
              onClick={() => handleClickOpen(row)}
              variant='ghost'
              icon={<PencilLine color={Color.WARNING} />}
            />

            <DropdownUi
              align='end'
              // minW='175px'
              footerDelete
              trigger={
                <ButtonIcon
                  variant='ghost'
                  icon={<EllipsisVertical color='#919EAB' />}
                />
              }
              group={[
                {
                  title: <MoreItem
                    title={'Tasks'}
                    icon={<RiTodoLine size={'17px'} />}
                  />,
                  onClick: () => handleClickOpenTask(row, false)
                },
                // {
                //   title: <MoreItem
                //     title={'Scripts'}
                //     icon={<CirclePlay size={'17px'} />}
                //   />,
                //   onClick: () => handleClickOpenTask(row, false)
                // },
                {
                  title: (
                    <MoreItem
                      title={'Profiles'}
                      icon={<Users size={'17px'} />}
                    />
                  ),
                  onClick: () => handleClickOpenProfiles(row)
                },
              ]}
              footer={
                {
                  title: <MoreItem
                    title={<span style={{ color: Color.ORANGE }}>Xóa dự án</span>}
                    icon={<Trash2 size={'17px'} color={Color.ORANGE} />}
                  />,
                  onClick: () => handleDelete(row?.id, row?.name)
                }
              }
            />
          </div>
        </TableCell>

      </TableRow >
    ));
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

        selectedObjText={'dự án'}
      />

      <Modal
        isOpen={open}
        onClose={handleClose}
        title={"Cập nhật dự án"}
        content={
          <ProjectNewEditForm
            onCloseModal={handleClose}
            currentProject={project}
            isEdit={isEdit}
            onUpdateData={onUpdateData}
          />
        }
      />

      <Modal
        height={'800px'}
        width={'1600px'}
        size='xxl'
        isOpen={openProfiles}
        onClose={() => setOpenProfiles(false)}
        title={
          <span>
            {'Profiles'}
            <span className=''>
              {` - ${project?.name || ''}`}
            </span>
          </span>
        }
        content={
          <ProjectProfileList
            project={project} />
        }
      />

      <Modal
        height={'800px'}
        width={'1600px'}
        size='xxl'
        isOpen={openTask}
        onClose={() => setOpenTask(false)}
        title={
          <span>
            {'Tasks'}
            <span className='text-capitalize'>
              {` - ${project?.name || ''}`}
            </span>
          </span>
        }
        content={
          <ProjectTaskList
            project={project} />
        }
      />
    </>
  );
}

const MoreItem = ({ title, icon }) => {
  return (
    <div
      style={{ width: '100%' }}
      className='fw-400 fs-13 d-flex justify-content-between gap-20'>
      {title}
      {icon}
    </div>
  )
}

const getColorDailyTaskRefresh = (type) => {
  if (type === DailyTaskRefresh.COUNT_DOWN_TIME_IT_UP) {
    return Color.WARNING;
  }
  if (type === DailyTaskRefresh.UTC0) {
    return Color.PRIMARY;
  }
  return '';
}

const getColorDailyTask = (completed) => {
  if (completed) {
    return Color.SUCCESS;
  }
  return Color.ORANGE;
}

const TaskTimeCountDownUTC0 = ({ completed, onUpdateData, row }) => {
  const [timeLeft, setTimeLeft] = React.useState("");

  React.useEffect(() => {
    let timer;

    const updateCountdown = () => {
      const now = new Date();

      if (now.getHours() === 0 && now.getMinutes() === 0) {
        onUpdateData(true, { ...row, daily_tasks_completed: false })
      }

      // Tạo mốc 07:00 sáng hôm nay
      let target = new Date(now);
      target.setHours(7, 0, 0, 0);

      if (completed) {
        // cứ hoàn thành rồi là luôn countdown đến 7h sáng NGÀY MAI
        target.setDate(target.getDate() + 1);
      }

      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        // qua 7h sáng rồi thì ko hiện nữa
        setTimeLeft("");
        // return ko làm timeout dừng (chỉ khi clear)
      }
      else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        setTimeLeft(
          `${hours.toString().padStart(2, "0")}:` +
          `${minutes.toString().padStart(2, "0")}`
        );
      }

      const delay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
      timer = setTimeout(updateCountdown, delay);
    }

    updateCountdown();

    return () => clearTimeout(timer);
  }, [completed]);

  // chưa đến 7h sáng (nhưng ngày hôm qua đã completed rồi) hoặc completed thì sẽ hiện countdown, qua 7h sáng rồi thì ko hiện nữa
  const showTime = new Date().getHours() < 7 || completed;

  return (
    <span className="d-flex gap-1">
      {showTime ? <Clock size={"14px"} className="mt-1" /> : <TbClockCheck size={"14px"} className="mb-0.5" />}
      {showTime && timeLeft}
    </span>
  );
}

const TaskTimeCountDownTime = ({ lastCompletedAt, completed }) => {
  const [timeLeft, setTimeLeft] = React.useState("");

  React.useEffect(() => {
    if (!lastCompletedAt) {
      setTimeLeft("");
      return;
    }

    let timer;

    const updateCountdown = () => {
      const now = new Date();
      const start = new Date(lastCompletedAt);
      const target = new Date(start.getTime() + 24 * 60 * 60 * 1000);

      let diff = target - now;

      if (diff <= 0) {
        // Hết giờ
        setTimeLeft("");
      }
      else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        // const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(
          `${hours.toString().padStart(2, "0")}:` +
          `${minutes.toString().padStart(2, "0")}`
          // `${seconds.toString().padStart(2, "0")}`
        );
      }

      const delay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
      timer = setTimeout(updateCountdown, delay);
    }

    updateCountdown();

    return () => clearTimeout(timer);
  }, [completed]);

  return (
    <span className="d-flex gap-1">
      {timeLeft ? <Clock size={"14px"} className="mt-1" /> : <TbClockCheck size={"14px"} className="mb-0.5" />}
      {timeLeft}
      {'Todo (1/6)'}
    </span>
  );
}

// const FingerprintProgress = ({ percent = 0 }) => {
//   const displayPercent = percent >= 100
//     ? 100
//     : Math.min(percent, 70);
//   const circumference = 25;
//   const offset = circumference - (displayPercent / 100) * circumference;
//
//   return (
//     <div className="relative select-none"
//       style={{ height: 25 }}
//
//     >
//       {/* Background (xám) */}
//       <Fingerprint
//         className="absolute top-0 left-0 text-gray-300"
//         strokeWidth={2}
//       />
//       {/* Progress (màu xanh) */}
//       <Fingerprint
//         className="absolute top-0 left-0 text-blue-500"
//         strokeWidth={2}
//         style={{
//           color: displayPercent === 100 ? Color.SUCCESS : '',
//           strokeDasharray: circumference,
//           strokeDashoffset: offset,
//         }}
//       />
//     </div>
//   );
// }

