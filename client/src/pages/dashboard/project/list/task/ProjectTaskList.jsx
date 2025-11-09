import React, { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/Modal';
import { apiGet } from '@/utils/axios';
import useSpinner from '@/hooks/useSpinner';
import useMessage from '@/hooks/useMessage';
import useTable from '@/hooks/useTable';
import { delayApi } from '@/utils/commonUtil';
import ProjectTaskFilterSearch from './ProjectTaskFilterSearch';
import ProjectTaskDataTable from './ProjectTaskDataTable';
import { ButtonOutlinePrimary, ButtonPrimary } from '@/components/Button';
import { ClipboardPlus } from 'lucide-react';
import ProjectTaskNewEditForm from '../../new-edit/ProjectTaskNewEditForm';
import { StatusCommon, TaskType } from '@/enums/enum';
import { convertProjectTaskTypeEnumToText } from '@/utils/convertUtil';

const ProjectTaskDataTableMemo = React.memo(ProjectTaskDataTable);

export default function ProjectTaskList({ project = {} }) {

  const daily = project?.daily;

  const [open, setOpen] = useState(false); // modal
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const { onOpen, onClose } = useSpinner();
  const { onError } = useMessage();

  const [search, setSearch] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState('in_complete');
  const [selectedTaskTab, setSelectedTaskTab] = useState(daily ? TaskType.DAILY : TaskType.POINTS);

  const {
    page,
    onChangePage,
  } = useTable({});

  const fetchApi = async (dataTrigger = false, onTrigger = () => { }) => {
    const params = {
      page,
      search,
      selectedStatusTab,
      selectedTaskTab,
    }

    try {
      if (!dataTrigger) {
        onOpen();
      }

      const response = await apiGet(`/tasks/${project?.id}`, params);
      console.log(response.data.data)

      if (dataTrigger) {
        delayApi(() => {
          setData(response.data.data.data || []);
          setPagination(response.data.data.pagination || {});
          onTrigger();
        })
      }
      else {
        delayApi(() => {
          setData(response.data.data.data || []);
          setPagination(response.data.data.pagination || {});
          onClose();
        })
      }

    } catch (error) {
      console.error(error);
      onError(error.message);
      onClose();
    }
  }

  const handleUpdateData = useCallback((onTrigger = () => { }) => {
    fetchApi(true, onTrigger)
  }, [
    search,
    page,
    selectedStatusTab,
    selectedTaskTab,
  ]);

  const handleDeleteData = useCallback((onTrigger = () => { }) => {
    fetchApi(true, () => {
      onTrigger();
    })
  }, [
    search,
    page,
    selectedStatusTab,
    selectedTaskTab,
  ]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChangePage = useCallback((newPage) => {
    onChangePage(newPage)
  }, [])

  const handleChangeSearch = (value) => {
    setSearch(value);
    onChangePage(1);
  }

  const handleChangeSelectedStatusTab = (selected) => {
    setSelectedStatusTab(selected);
    onChangePage(1);
  };

  const handleChangeSelectedTaskTab = (selected) => {
    setSelectedTaskTab(selected);
    onChangePage(1);
  };

  const handleClearAllSelectedItems = () => {
    setSearch('');
    onChangePage(1);
  }

  useEffect(() => {
    fetchApi();
  }, [
    search,
    page,
    selectedStatusTab,
    selectedTaskTab,
  ])

  return (
    <div className=''>
      <ProjectTaskFilterSearch
        action={
          <div className='flex items-center gap-10'>
            <ButtonPrimary
              icon={<ClipboardPlus />}
              title={`Thêm task`}
              onClick={handleClickOpen}
            />
          </div>
        }

        onClearAllSelectedItems={handleClearAllSelectedItems}
        pagination={pagination}

        search={search}
        onChangeSearch={handleChangeSearch}

        onChangeSelectedStatusTab={handleChangeSelectedStatusTab}
        selectedStatusTab={selectedStatusTab}

        onChangeSelectedTaskTab={handleChangeSelectedTaskTab}
        selectedTaskTab={selectedTaskTab}
      />
      <ProjectTaskDataTableMemo
        pagination={pagination}
        onChangePage={handleChangePage}

        data={data}
        onUpdateData={handleUpdateData}
        onDeleteData={handleDeleteData}

        projectName={project?.name}
        projectId={project?.id}
        projectDailyTaskRefresh={project?.daily_tasks_refresh}

        selectedTaskTab={selectedTaskTab}
      />

      <Modal
        isOpen={open}
        onClose={handleClose}
        title={`Thêm mới task ${convertProjectTaskTypeEnumToText(selectedTaskTab)}`}
        content={
          <ProjectTaskNewEditForm
            selectedTaskTab={selectedTaskTab}
            projectName={project?.name}
            projectId={project?.id}
            onCloseModal={handleClose}
            onUpdateData={handleUpdateData}
          />
        }
      />
    </div>
  )
}
